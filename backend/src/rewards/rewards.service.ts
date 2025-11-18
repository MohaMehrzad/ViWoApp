import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { QualityService } from '../quality/quality.service';
import { ReputationService } from '../reputation/reputation.service';
import { AntiBotService } from '../anti-bot/anti-bot.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class RewardsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private qualityService: QualityService,
    private reputationService: ReputationService,
    private antiBotService: AntiBotService,
  ) {}

  async distributeDailyRewards(date: Date = new Date()) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    // Check if already distributed
    const existing = await this.prisma.dailyRewardDistribution.findUnique({
      where: { distributionDate: today },
    });

    if (existing) {
      return { success: false, message: 'Already distributed today' };
    }

    // Get daily reward pool from config
    const monthlyEmission = this.configService.get<number>('MONTHLY_EMISSION', 5833333);
    const allocationPercent = this.configService.get<number>('DAILY_REWARD_ALLOCATION', 0.8);
    const DAILY_POOL = Math.round((monthlyEmission * allocationPercent) / 30);

    const vcnPrice = this.configService.get<number>('VCN_PRICE', 0.03);
    const maxRewardUsd = this.configService.get<number>('MAX_DAILY_REWARD_USD', 50);
    const maxRewardVCN = maxRewardUsd / vcnPrice;

    // Get active users (with activity in last 24 hours)
    const activeUsers = await this.getActiveUsers();

    if (activeUsers.length === 0) {
      return { success: false, message: 'No active users' };
    }

    let totalPoints = 0;
    const userPointsArray: Array<{ userId: string; points: number }> = [];

    // Calculate points for each user
    for (const user of activeUsers) {
      try {
        const points = await this.calculateUserPoints(user.id, date);
        
        if (points.final >= 10) { // Minimum threshold
          totalPoints += points.final;
          userPointsArray.push({
            userId: user.id,
            points: points.final,
          });
        }
      } catch (error) {
        console.error(`Error calculating points for user ${user.id}:`, error);
      }
    }

    if (totalPoints === 0) {
      return { success: false, message: 'No qualifying users' };
    }

    // Distribute pool proportionally
    let totalDistributed = 0;
    let topEarner: { userId: string; amount: number } | null = null;

    for (const userPoint of userPointsArray) {
      let reward = (userPoint.points / totalPoints) * DAILY_POOL;
      reward = Math.min(reward, maxRewardVCN); // Apply daily cap

      // Credit VCoin
      await this.prisma.$transaction([
        this.prisma.vCoinBalance.update({
          where: { userId: userPoint.userId },
          data: {
            availableBalance: { increment: reward },
            earnedTotal: { increment: reward },
            lastRewardAt: new Date(),
          },
        }),
        this.prisma.vCoinTransaction.create({
          data: {
            userId: userPoint.userId,
            amount: new Decimal(reward),
            type: 'earn',
            source: 'DAILY_REWARD',
            status: 'completed',
          },
        }),
      ]);

      totalDistributed += reward;

      if (!topEarner || reward > topEarner.amount) {
        topEarner = { userId: userPoint.userId, amount: reward };
      }
    }

    // Log distribution
    await this.prisma.dailyRewardDistribution.create({
      data: {
        distributionDate: today,
        totalPool: new Decimal(DAILY_POOL),
        activeUsersCount: activeUsers.length,
        totalPoints: BigInt(Math.round(totalPoints)),
        vcnDistributed: new Decimal(totalDistributed),
        avgRewardPerUser: new Decimal(totalDistributed / userPointsArray.length),
        topEarnerUserId: topEarner?.userId,
        topEarnerAmount: topEarner ? new Decimal(topEarner.amount) : null,
      },
    });

    return {
      success: true,
      distributed: totalDistributed,
      recipients: userPointsArray.length,
      averageReward: totalDistributed / userPointsArray.length,
      topEarner,
    };
  }

  private async calculateUserPoints(userId: string, date: Date) {
    const activities = await this.getUserActivitiesLast24Hours(userId, date);

    // Phase 1: Raw points from activities
    let rawPoints = 0;
    const activityPoints = this.configService.get('activityPoints') || {
      TEXT_POST: 10,
      IMAGE_POST: 20,
      VIDEO_POST: 50,
      LIKE: 1,
      COMMENT: 8,
      SHARE: 10,
      REPOST: 12,
      FOLLOW: 2,
    };

    for (const activity of activities) {
      const baseScore = activityPoints[activity.type] || 0;
      const timeDecay = this.calculateTimeDecay(activity.createdAt);
      rawPoints += baseScore * timeDecay;
    }

    // Phase 2: Apply anti-bot filters
    const botCheck = await this.antiBotService.applyAntiBotFilters(userId, date);
    const botPenalty = botCheck.botPenalty;
    const filteredPoints = rawPoints * botPenalty;

    // Phase 3: Apply quality multipliers
    const contentQuality = await this.getUserContentQuality(userId);
    const userReputation = await this.getUserReputationMultiplier(userId);
    const finalPoints = filteredPoints * contentQuality * userReputation;

    return {
      raw: rawPoints,
      botPenalty,
      filtered: filteredPoints,
      contentQuality,
      userReputation,
      final: Math.round(finalPoints),
    };
  }

  private calculateTimeDecay(createdAt: Date): number {
    const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    const ageDays = ageHours / 24;

    if (ageDays <= 1) return 1.0;
    if (ageDays <= 3) return 0.95;
    if (ageDays <= 7) return 0.70;
    if (ageDays <= 14) return 0.45;
    if (ageDays <= 30) return 0.20;
    if (ageDays <= 60) return 0.08;
    if (ageDays <= 90) return 0.05;
    return 0.03;
  }

  private async getUserActivitiesLast24Hours(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [posts, interactions, comments, follows] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prisma.postInteraction.findMany({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prisma.comment.findMany({
        where: { userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prisma.follow.findMany({
        where: { followerId: userId, createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
    ]);

    const activities = [
      ...posts.map(p => ({
        type: p.mediaType ? `${p.mediaType.toUpperCase()}_POST` : 'TEXT_POST',
        createdAt: p.createdAt,
      })),
      ...interactions.map(i => ({
        type: i.interactionType.toUpperCase(),
        createdAt: i.createdAt,
      })),
      ...comments.map(c => ({
        type: 'COMMENT',
        createdAt: c.createdAt,
      })),
      ...follows.map(f => ({
        type: 'FOLLOW',
        createdAt: f.createdAt,
      })),
    ];

    return activities;
  }

  private async getUserContentQuality(userId: string): Promise<number> {
    const recentPosts = await this.prisma.post.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: { qualityScore: true },
      take: 20,
    });

    if (recentPosts.length === 0) return 1.0;

    const postsWithScores = recentPosts.filter(p => p.qualityScore);
    if (postsWithScores.length === 0) return 1.0;

    const avgMultiplier = postsWithScores.reduce(
      (sum, p) => sum + Number(p.qualityScore!.multiplier),
      0
    ) / postsWithScores.length;

    return avgMultiplier;
  }

  private async getUserReputationMultiplier(userId: string): Promise<number> {
    const reputation = await this.prisma.userReputationScore.findUnique({
      where: { userId },
    });

    return reputation ? Number(reputation.overallReputation) : 1.0;
  }

  private async getActiveUsers() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.prisma.user.findMany({
      where: {
        OR: [
          { posts: { some: { createdAt: { gte: yesterday } } } },
          { postInteractions: { some: { createdAt: { gte: yesterday } } } },
          { comments: { some: { createdAt: { gte: yesterday } } } },
        ],
      },
    });
  }

  async getRewardHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [rewards, total] = await Promise.all([
      this.prisma.vCoinTransaction.findMany({
        where: {
          userId,
          source: 'DAILY_REWARD',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vCoinTransaction.count({
        where: { userId, source: 'DAILY_REWARD' },
      }),
    ]);

    return {
      data: rewards.map(r => ({
        amount: Number(r.amount),
        date: r.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' = 'daily', limit = 10) {
    let startDate = new Date();
    
    if (period === 'daily') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const topEarners = await this.prisma.vCoinTransaction.groupBy({
      by: ['userId'],
      where: {
        type: 'earn',
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    const leaderboard = await Promise.all(
      topEarners.map(async (entry) => {
        const user = await this.prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verificationTier: true,
          },
        });

        return {
          user,
          earned: Number(entry._sum.amount || 0),
        };
      })
    );

    return {
      period,
      leaderboard,
    };
  }
}

