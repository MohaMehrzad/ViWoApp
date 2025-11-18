import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class BuybackService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async executeBuyback(monthlyProfit: number, dexUsed = 'UniswapV3') {
    const buybackAllocation = this.configService.get<number>('BUYBACK_ALLOCATION', 0.25);
    const burnPercent = this.configService.get<number>('BUYBACK_BURN_PERCENT', 0.5);

    const buybackBudget = monthlyProfit * buybackAllocation;
    
    // In production, this would interact with DEX to buy VCN
    // For MVP, we simulate the buyback
    const vcnPrice = this.configService.get<number>('VCN_PRICE', 0.03);
    const vcnBought = buybackBudget / vcnPrice;

    const vcnToBurn = vcnBought * burnPercent;
    const vcnToLock = vcnBought * (1 - burnPercent);

    // Record buyback
    const buyback = await this.prisma.vCoinBuyback.create({
      data: {
        usdSpent: new Decimal(buybackBudget),
        vcnBought: new Decimal(vcnBought),
        vcnBurned: new Decimal(vcnToBurn),
        vcnLocked: new Decimal(vcnToLock),
        avgPrice: new Decimal(vcnPrice),
        dexUsed,
      },
    });

    // Burn tokens
    await this.prisma.vCoinBurn.create({
      data: {
        amount: new Decimal(vcnToBurn),
        source: 'BUYBACK',
      },
    });

    return {
      buybackId: buyback.id,
      budgetUsed: buybackBudget,
      vcnBought,
      vcnBurned: vcnToBurn,
      vcnLocked: vcnToLock,
      avgPrice: vcnPrice,
    };
  }

  async trackModuleRevenue(
    moduleName: string,
    month: Date,
    revenue: number,
    costs: number,
  ) {
    const profit = revenue - costs;

    await this.prisma.moduleRevenue.upsert({
      where: {
        moduleName_month: {
          moduleName,
          month,
        },
      },
      update: {
        revenueUsd: new Decimal(revenue),
        costsUsd: new Decimal(costs),
        profitUsd: new Decimal(profit),
      },
      create: {
        moduleName,
        month,
        revenueUsd: new Decimal(revenue),
        costsUsd: new Decimal(costs),
        profitUsd: new Decimal(profit),
      },
    });

    return { message: 'Revenue tracked successfully' };
  }

  async getBuybackHistory(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [buybacks, total] = await Promise.all([
      this.prisma.vCoinBuyback.findMany({
        skip,
        take: limit,
        orderBy: { executedAt: 'desc' },
      }),
      this.prisma.vCoinBuyback.count(),
    ]);

    return {
      data: buybacks.map(b => ({
        id: b.id,
        usdSpent: Number(b.usdSpent),
        vcnBought: Number(b.vcnBought),
        vcnBurned: Number(b.vcnBurned),
        vcnLocked: Number(b.vcnLocked),
        avgPrice: Number(b.avgPrice),
        dexUsed: b.dexUsed,
        executedAt: b.executedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBuybackStats() {
    const [totalBuybacks, totalStats] = await Promise.all([
      this.prisma.vCoinBuyback.count(),
      this.prisma.vCoinBuyback.aggregate({
        _sum: {
          usdSpent: true,
          vcnBought: true,
          vcnBurned: true,
          vcnLocked: true,
        },
      }),
    ]);

    return {
      totalBuybacks,
      totalUsdSpent: Number(totalStats._sum.usdSpent || 0),
      totalVcnBought: Number(totalStats._sum.vcnBought || 0),
      totalVcnBurned: Number(totalStats._sum.vcnBurned || 0),
      totalVcnLocked: Number(totalStats._sum.vcnLocked || 0),
    };
  }

  async getModuleRevenues() {
    const revenues = await this.prisma.moduleRevenue.findMany({
      orderBy: [
        { month: 'desc' },
        { moduleName: 'asc' },
      ],
      take: 50,
    });

    return revenues.map(r => ({
      module: r.moduleName,
      month: r.month,
      revenue: Number(r.revenueUsd),
      costs: Number(r.costsUsd),
      profit: Number(r.profitUsd),
      vcnFees: Number(r.vcnFeesCollected),
      vcnBurned: Number(r.vcnBurned),
      vcnStaked: Number(r.vcnStaked),
    }));
  }
}

