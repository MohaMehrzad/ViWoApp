import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class VCoinService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getBalance(userId: string) {
    const balance = await this.prisma.vCoinBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      // Create if doesn't exist
      const newBalance = await this.prisma.vCoinBalance.create({
        data: {
          userId,
          availableBalance: 0,
          stakedBalance: 0,
          earnedTotal: 0,
          spentTotal: 0,
        },
      });
      return {
        available: 0,
        staked: 0,
        total: 0,
        earnedTotal: 0,
        spentTotal: 0,
      };
    }

    return {
      available: Number(balance.availableBalance),
      staked: Number(balance.stakedBalance),
      total: Number(new Decimal(balance.availableBalance).plus(balance.stakedBalance)),
      earnedTotal: Number(balance.earnedTotal),
      spentTotal: Number(balance.spentTotal),
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.vCoinTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          type: true,
          source: true,
          relatedPostId: true,
          relatedUserId: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.vCoinTransaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async send(senderId: string, recipientId: string, amount: number, note?: string) {
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot send VCoin to yourself');
    }

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Check sender balance
    const senderBalance = await this.prisma.vCoinBalance.findUnique({
      where: { userId: senderId },
    });

    if (!senderBalance || Number(senderBalance.availableBalance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate fees (5% transaction fee)
    const feeRate = this.configService.get<number>('TRANSACTION_FEE_RATE', 0.05);
    const totalFee = amount * feeRate;
    const amountAfterFee = amount - totalFee;

    // Fee distribution
    const burnRate = this.configService.get<number>('BURN_RATE', 0.2);
    const treasuryRate = this.configService.get<number>('TREASURY_RATE', 0.5);
    const rewardsRate = this.configService.get<number>('REWARDS_RATE', 0.3);

    const burnAmount = totalFee * burnRate;
    const treasuryAmount = totalFee * treasuryRate;
    const rewardsAmount = totalFee * rewardsRate;

    // Execute transfer
    await this.prisma.$transaction([
      // Deduct from sender
      this.prisma.vCoinBalance.update({
        where: { userId: senderId },
        data: {
          availableBalance: { decrement: amount },
          spentTotal: { increment: amount },
        },
      }),
      // Credit to recipient
      this.prisma.vCoinBalance.upsert({
        where: { userId: recipientId },
        update: {
          availableBalance: { increment: amountAfterFee },
        },
        create: {
          userId: recipientId,
          availableBalance: amountAfterFee,
          stakedBalance: 0,
          earnedTotal: 0,
          spentTotal: 0,
        },
      }),
      // Log sender transaction
      this.prisma.vCoinTransaction.create({
        data: {
          userId: senderId,
          amount: new Decimal(-amount),
          type: 'send',
          source: 'user_transfer',
          relatedUserId: recipientId,
          status: 'completed',
        },
      }),
      // Log recipient transaction
      this.prisma.vCoinTransaction.create({
        data: {
          userId: recipientId,
          amount: new Decimal(amountAfterFee),
          type: 'receive',
          source: 'user_transfer',
          relatedUserId: senderId,
          status: 'completed',
        },
      }),
      // Log burn
      this.prisma.vCoinBurn.create({
        data: {
          amount: new Decimal(burnAmount),
          source: 'TRANSACTION_FEE',
        },
      }),
      // Create notification for recipient
      this.prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'vcoin_earned',
          actorId: senderId,
          amount: new Decimal(amountAfterFee),
          message: `sent you ${amountAfterFee.toFixed(2)} VCN`,
        },
      }),
    ]);

    return {
      success: true,
      amountSent: amount,
      amountReceived: amountAfterFee,
      fee: totalFee,
      feeBreakdown: {
        burned: burnAmount,
        treasury: treasuryAmount,
        rewards: rewardsAmount,
      },
    };
  }

  async getTotalSupplyStats() {
    const [
      totalBurned,
      totalStaked,
      totalCirculating,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.vCoinBurn.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.vCoinStake.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amount: true },
      }),
      this.prisma.vCoinBalance.aggregate({
        _sum: {
          availableBalance: true,
          stakedBalance: true,
        },
      }),
      this.prisma.vCoinTransaction.count(),
    ]);

    const totalSupply = this.configService.get<number>('VCN_TOTAL_SUPPLY', 1000000000);

    return {
      totalSupply,
      totalBurned: Number(totalBurned._sum.amount || 0),
      totalStaked: Number(totalStaked._sum.amount || 0),
      totalCirculating: Number(
        new Decimal(totalCirculating._sum.availableBalance || 0)
          .plus(totalCirculating._sum.stakedBalance || 0)
      ),
      totalTransactions,
      currentPrice: this.configService.get<number>('VCN_PRICE', 0.03),
    };
  }
}

