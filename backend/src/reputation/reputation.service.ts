import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class ReputationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async calculateUserReputation(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            qualityScore: true,
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            posts: true,
            followersRelation: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 1. Account Age Score (1.0x - 2.0x)
    const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    let accountAgeScore = 1.0;
    if (accountAgeDays > 365) accountAgeScore = 2.0;
    else if (accountAgeDays > 180) accountAgeScore = 1.5;
    else if (accountAgeDays > 90) accountAgeScore = 1.3;
    else if (accountAgeDays > 30) accountAgeScore = 1.2;

    // 2. Historical Quality Score (0.5x - 2.0x)
    let historicalQualityScore = 1.0;
    if (user.posts.length > 0) {
      const postsWithScores = user.posts.filter(p => p.qualityScore);
      if (postsWithScores.length > 0) {
        const avgQuality = postsWithScores.reduce(
          (sum, p) => sum + Number(p.qualityScore!.overallScore),
          0
        ) / postsWithScores.length;

        if (avgQuality > 0.08) historicalQualityScore = 2.0;
        else if (avgQuality > 0.05) historicalQualityScore = 1.5;
        else if (avgQuality > 0.02) historicalQualityScore = 1.2;
        else if (avgQuality < 0.005) historicalQualityScore = 0.5;
      }
    }

    // 3. Verification Score (1.0x - 2.5x)
    let verificationScore = 1.0;
    const verifiedMultiplier = this.configService.get<number>('VERIFIED_USER_MULTIPLIER', 1.4);
    const premiumMultiplier = this.configService.get<number>('PREMIUM_USER_MULTIPLIER', 1.8);
    const enterpriseMultiplier = this.configService.get<number>('ENTERPRISE_USER_MULTIPLIER', 2.5);

    switch (user.verificationTier) {
      case 'VERIFIED':
        verificationScore = verifiedMultiplier;
        break;
      case 'PREMIUM':
        verificationScore = premiumMultiplier;
        break;
      case 'ENTERPRISE':
        verificationScore = enterpriseMultiplier;
        break;
      default:
        verificationScore = 1.0;
    }

    // 4. Community Standing Score (0.5x - 2.0x)
    let communityStandingScore = 1.0;
    const followerCount = user._count.followersRelation;
    const postCount = user._count.posts;

    if (followerCount > 10000) communityStandingScore = 2.0;
    else if (followerCount > 1000) communityStandingScore = 1.7;
    else if (followerCount > 100) communityStandingScore = 1.4;
    else if (followerCount > 10) communityStandingScore = 1.2;
    else if (followerCount === 0 && postCount === 0) communityStandingScore = 0.5;

    // 5. Calculate Overall Reputation (0.3x - 5.0x)
    let overallReputation = 
      accountAgeScore * 0.25 +
      historicalQualityScore * 0.35 +
      verificationScore * 0.25 +
      communityStandingScore * 0.15;

    // Cap at reasonable limits
    overallReputation = Math.min(Math.max(overallReputation, 0.3), 5.0);

    // Save to database
    await this.prisma.userReputationScore.upsert({
      where: { userId },
      update: {
        accountAgeScore: new Decimal(accountAgeScore),
        historicalQualityScore: new Decimal(historicalQualityScore),
        verificationScore: new Decimal(verificationScore),
        communityStandingScore: new Decimal(communityStandingScore),
        overallReputation: new Decimal(overallReputation),
        lastCalculated: new Date(),
      },
      create: {
        userId,
        accountAgeScore: new Decimal(accountAgeScore),
        historicalQualityScore: new Decimal(historicalQualityScore),
        verificationScore: new Decimal(verificationScore),
        communityStandingScore: new Decimal(communityStandingScore),
        overallReputation: new Decimal(overallReputation),
      },
    });

    return {
      userId,
      accountAgeScore,
      historicalQualityScore,
      verificationScore,
      communityStandingScore,
      overallReputation,
      accountAgeDays: Math.floor(accountAgeDays),
      followerCount,
      postCount,
    };
  }

  async getUserReputation(userId: string) {
    const reputation = await this.prisma.userReputationScore.findUnique({
      where: { userId },
    });

    if (!reputation) {
      // Calculate if not exists
      return this.calculateUserReputation(userId);
    }

    return {
      userId: reputation.userId,
      accountAgeScore: Number(reputation.accountAgeScore),
      historicalQualityScore: Number(reputation.historicalQualityScore),
      verificationScore: Number(reputation.verificationScore),
      communityStandingScore: Number(reputation.communityStandingScore),
      overallReputation: Number(reputation.overallReputation),
      lastCalculated: reputation.lastCalculated,
    };
  }

  async updateAllReputations() {
    // Get all users with recent activity
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { posts: { some: {} } },
          { followersRelation: { some: {} } },
        ],
      },
      select: { id: true },
    });

    let updated = 0;
    for (const user of users) {
      try {
        await this.calculateUserReputation(user.id);
        updated++;
      } catch (error) {
        console.error(`Error updating reputation for user ${user.id}:`, error);
      }
    }

    return {
      message: 'Reputations updated',
      usersUpdated: updated,
      totalUsers: users.length,
    };
  }
}

