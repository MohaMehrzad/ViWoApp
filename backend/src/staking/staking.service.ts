import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class StakingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async stakeVCoin(userId: string, amount: number, featureType: string, lockPeriodDays: number) {
    // Check if user has sufficient balance
    const balance = await this.prisma.vCoinBalance.findUnique({
      where: { userId },
    });

    if (!balance || Number(balance.availableBalance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate APY based on lock period
    let apy = 0;
    if (lockPeriodDays >= 365) apy = 12.0;
    else if (lockPeriodDays >= 180) apy = 8.0;
    else if (lockPeriodDays >= 90) apy = 5.0;
    else if (lockPeriodDays >= 30) apy = 3.0;

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + lockPeriodDays);

    // Create stake and update balance
    const [stake] = await this.prisma.$transaction([
      this.prisma.vCoinStake.create({
        data: {
          userId,
          amount: new Decimal(amount),
          featureType,
          lockPeriodDays,
          unlockDate,
          status: 'ACTIVE',
          apy: new Decimal(apy),
        },
      }),
      this.prisma.vCoinBalance.update({
        where: { userId },
        data: {
          availableBalance: { decrement: amount },
          stakedBalance: { increment: amount },
        },
      }),
      this.prisma.vCoinTransaction.create({
        data: {
          userId,
          amount: new Decimal(-amount),
          type: 'stake',
          source: `STAKE_${featureType}`,
          status: 'completed',
        },
      }),
    ]);

    return {
      stakeId: stake.id,
      amount,
      featureType,
      lockPeriodDays,
      unlockDate,
      apy,
      status: 'ACTIVE',
    };
  }

  async unstakeVCoin(stakeId: string, userId: string) {
    const stake = await this.prisma.vCoinStake.findUnique({
      where: { id: stakeId },
    });

    if (!stake) {
      throw new NotFoundException('Stake not found');
    }

    if (stake.userId !== userId) {
      throw new BadRequestException('Not your stake');
    }

    if (stake.status !== 'ACTIVE') {
      throw new BadRequestException('Stake is not active');
    }

    // Check if unlock date has passed
    if (new Date() < stake.unlockDate) {
      throw new BadRequestException('Stake is still locked');
    }

    const amount = Number(stake.amount);
    const rewards = Number(stake.rewardsEarned);
    const totalAmount = amount + rewards;

    // Unstake and return funds
    await this.prisma.$transaction([
      this.prisma.vCoinStake.update({
        where: { id: stakeId },
        data: { status: 'WITHDRAWN' },
      }),
      this.prisma.vCoinBalance.update({
        where: { userId },
        data: {
          availableBalance: { increment: totalAmount },
          stakedBalance: { decrement: amount },
        },
      }),
      this.prisma.vCoinTransaction.create({
        data: {
          userId,
          amount: new Decimal(totalAmount),
          type: 'receive',
          source: 'UNSTAKE',
          status: 'completed',
        },
      }),
    ]);

    return {
      message: 'Successfully unstaked',
      principalReturned: amount,
      rewardsEarned: rewards,
      totalReturned: totalAmount,
    };
  }

  async getUserStakes(userId: string) {
    const stakes = await this.prisma.vCoinStake.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return stakes.map(s => ({
      id: s.id,
      amount: Number(s.amount),
      featureType: s.featureType,
      lockPeriodDays: s.lockPeriodDays,
      startDate: s.startDate,
      unlockDate: s.unlockDate,
      status: s.status,
      apy: Number(s.apy),
      rewardsEarned: Number(s.rewardsEarned),
      daysRemaining: s.status === 'ACTIVE' 
        ? Math.max(0, Math.ceil((s.unlockDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
        : 0,
    }));
  }

  async getStakingRequirements() {
    return {
      requirements: {
        IDENTITY_PREMIUM: this.configService.get<number>('STAKE_IDENTITY_PREMIUM', 500),
        CONTENT_CREATOR_PRO: this.configService.get<number>('STAKE_CONTENT_CREATOR_PRO', 1000),
        DAO_FOUNDER: this.configService.get<number>('STAKE_DAO_FOUNDER', 2000),
        QUALITY_CURATOR: this.configService.get<number>('STAKE_QUALITY_CURATOR', 250),
        TRUSTED_MODERATOR: this.configService.get<number>('STAKE_TRUSTED_MODERATOR', 500),
      },
      apyRates: {
        '30_DAYS': 3.0,
        '90_DAYS': 5.0,
        '180_DAYS': 8.0,
        '365_DAYS': 12.0,
      },
    };
  }

  async processUnlocks() {
    // Find all stakes that can be unlocked
    const unlockedStakes = await this.prisma.vCoinStake.findMany({
      where: {
        status: 'ACTIVE',
        unlockDate: { lte: new Date() },
      },
    });

    for (const stake of unlockedStakes) {
      await this.prisma.vCoinStake.update({
        where: { id: stake.id },
        data: { status: 'UNLOCKED' },
      });
    }

    return {
      message: 'Processed stake unlocks',
      stakesUnlocked: unlockedStakes.length,
    };
  }
}

