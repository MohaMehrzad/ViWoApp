import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class AntiBotService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async checkUserActivity(userId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's activity
    const [posts, interactions, comments, follows] = await Promise.all([
      this.prisma.post.count({
        where: {
          userId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.postInteraction.findMany({
        where: {
          userId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.comment.count({
        where: {
          userId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      this.prisma.follow.count({
        where: {
          followerId: userId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    const likes = interactions.filter(i => i.interactionType === 'like').length;
    const shares = interactions.filter(i => i.interactionType === 'share').length;

    return {
      posts,
      likes,
      comments,
      shares,
      follows,
    };
  }

  async applyAntiBotFilters(userId: string, date: Date = new Date()) {
    const activity = await this.checkUserActivity(userId, date);
    let botPenalty = 1.0;
    const flags: string[] = [];

    // Get daily caps from config
    const caps = {
      MAX_POSTS: this.configService.get<number>('DAILY_CAP_POSTS', 50),
      MAX_LIKES: this.configService.get<number>('DAILY_CAP_LIKES', 500),
      MAX_COMMENTS: this.configService.get<number>('DAILY_CAP_COMMENTS', 200),
      MAX_SHARES: this.configService.get<number>('DAILY_CAP_SHARES', 100),
      MAX_FOLLOWS: this.configService.get<number>('DAILY_CAP_FOLLOWS', 100),
    };

    // 1. Check daily caps
    if (activity.posts > caps.MAX_POSTS) {
      botPenalty *= 0.5;
      flags.push('EXCESSIVE_POSTS');
    }
    if (activity.likes > caps.MAX_LIKES) {
      botPenalty *= 0.5;
      flags.push('EXCESSIVE_LIKES');
    }
    if (activity.comments > caps.MAX_COMMENTS) {
      botPenalty *= 0.5;
      flags.push('EXCESSIVE_COMMENTS');
    }
    if (activity.shares > caps.MAX_SHARES) {
      botPenalty *= 0.5;
      flags.push('EXCESSIVE_SHARES');
    }
    if (activity.follows > caps.MAX_FOLLOWS) {
      botPenalty *= 0.5;
      flags.push('EXCESSIVE_FOLLOWS');
    }

    // 2. Check velocity (actions per hour) - simplified check
    const totalActions = activity.posts + activity.likes + activity.comments + activity.shares;
    const actionsPerHour = totalActions / 24; // Average across day

    if (actionsPerHour > 100) {
      botPenalty *= 0.3;
      flags.push('HIGH_VELOCITY');
    }

    // 3. Check diversity (must have 3+ activity types)
    const activityTypes = [
      activity.posts > 0,
      activity.likes > 0,
      activity.comments > 0,
      activity.shares > 0,
      activity.follows > 0,
    ].filter(Boolean).length;

    if (activityTypes < 3 && totalActions > 20) {
      botPenalty *= 0.5;
      flags.push('LOW_DIVERSITY');
    }

    // 4. Check for repetitive patterns
    if (activity.likes > 100 && activity.comments === 0 && activity.posts === 0) {
      botPenalty *= 0.3;
      flags.push('LIKE_ONLY_PATTERN');
    }

    // Create bot flags if suspicious
    if (flags.length > 0) {
      for (const flagType of flags) {
        const severity = botPenalty < 0.3 ? 'HIGH' : botPenalty < 0.5 ? 'MEDIUM' : 'LOW';
        
        await this.prisma.botDetectionFlag.create({
          data: {
            userId,
            flagType,
            severity,
            penaltyApplied: new Decimal(botPenalty),
            description: `Detected ${flagType.toLowerCase().replace('_', ' ')} behavior`,
          },
        });
      }
    }

    return {
      userId,
      date,
      activity,
      botPenalty,
      flags,
      isLikelyBot: botPenalty < 0.5,
    };
  }

  async getUserBotFlags(userId: string) {
    const flags = await this.prisma.botDetectionFlag.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { flaggedAt: 'desc' },
    });

    return {
      userId,
      flags: flags.map(f => ({
        id: f.id,
        type: f.flagType,
        severity: f.severity,
        description: f.description,
        penaltyApplied: Number(f.penaltyApplied),
        flaggedAt: f.flaggedAt,
      })),
      totalFlags: flags.length,
      highSeverityFlags: flags.filter(f => f.severity === 'HIGH').length,
    };
  }

  async resolveFlag(flagId: string, resolution: string) {
    await this.prisma.botDetectionFlag.update({
      where: { id: flagId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        description: resolution,
      },
    });

    return { message: 'Flag resolved successfully' };
  }

  async getSystemBotStats() {
    const [totalFlags, activeFlags, resolvedFlags, usersWithFlags] = await Promise.all([
      this.prisma.botDetectionFlag.count(),
      this.prisma.botDetectionFlag.count({ where: { status: 'ACTIVE' } }),
      this.prisma.botDetectionFlag.count({ where: { status: 'RESOLVED' } }),
      this.prisma.botDetectionFlag.findMany({
        where: { status: 'ACTIVE' },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

    return {
      totalFlags,
      activeFlags,
      resolvedFlags,
      uniqueUsersWithFlags: usersWithFlags.length,
      detectionRate: totalFlags > 0 ? (activeFlags / totalFlags * 100).toFixed(2) + '%' : '0%',
    };
  }
}

