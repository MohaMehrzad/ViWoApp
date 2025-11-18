import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  async calculatePostQualityScore(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        comments: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Engagement Rate: (likes + comments + shares) / views
    const totalEngagements = post.likesCount + post.commentsCount + post.sharesCount;
    const engagementRate = post.viewsCount > 0 ? totalEngagements / post.viewsCount : 0;

    // Retention Score: Based on completion rate (placeholder, would need video analytics)
    const retentionScore = post.mediaType === 'video' ? 0.7 : 1.0;

    // Virality Score: shares and reposts relative to views
    const viralityScore = post.viewsCount > 0 
      ? (post.sharesCount + post.repostsCount * 1.5) / post.viewsCount 
      : 0;

    // Comment Quality: Average comment length and depth
    const avgCommentLength = post.comments.length > 0
      ? post.comments.reduce((sum, c) => sum + c.content.length, 0) / post.comments.length
      : 0;
    const commentQuality = Math.min(avgCommentLength / 100, 1.0); // Normalize to 0-1

    // Calculate overall score (weighted average)
    const overallScore = (
      engagementRate * 0.4 +
      retentionScore * 0.2 +
      viralityScore * 0.3 +
      commentQuality * 0.1
    );

    // Map overall score to multiplier (0.1x - 10x)
    let multiplier = 1.0;
    if (overallScore < 0.005) multiplier = 0.1;
    else if (overallScore < 0.01) multiplier = 0.5;
    else if (overallScore < 0.02) multiplier = 1.0;
    else if (overallScore < 0.05) multiplier = 2.0;
    else if (overallScore < 0.10) multiplier = 5.0;
    else multiplier = 10.0;

    // Save to database
    await this.prisma.contentQualityScore.upsert({
      where: { postId },
      update: {
        engagementRate: new Decimal(engagementRate),
        retentionScore: new Decimal(retentionScore),
        viralityScore: new Decimal(viralityScore),
        commentQuality: new Decimal(commentQuality),
        overallScore: new Decimal(overallScore),
        multiplier: new Decimal(multiplier),
        calculatedAt: new Date(),
      },
      create: {
        postId,
        engagementRate: new Decimal(engagementRate),
        retentionScore: new Decimal(retentionScore),
        viralityScore: new Decimal(viralityScore),
        commentQuality: new Decimal(commentQuality),
        overallScore: new Decimal(overallScore),
        multiplier: new Decimal(multiplier),
      },
    });

    return {
      postId,
      engagementRate,
      retentionScore,
      viralityScore,
      commentQuality,
      overallScore,
      multiplier,
    };
  }

  async getPostQualityScore(postId: string) {
    const score = await this.prisma.contentQualityScore.findUnique({
      where: { postId },
    });

    if (!score) {
      // Calculate if not exists
      return this.calculatePostQualityScore(postId);
    }

    return {
      postId: score.postId,
      engagementRate: Number(score.engagementRate),
      retentionScore: Number(score.retentionScore),
      viralityScore: Number(score.viralityScore),
      commentQuality: Number(score.commentQuality),
      overallScore: Number(score.overallScore),
      multiplier: Number(score.multiplier),
      calculatedAt: score.calculatedAt,
    };
  }

  async updateAllQualityScores() {
    // Get recent posts (last 30 days)
    const recentPosts = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true },
    });

    let updated = 0;
    for (const post of recentPosts) {
      try {
        await this.calculatePostQualityScore(post.id);
        updated++;
      } catch (error) {
        console.error(`Error updating quality score for post ${post.id}:`, error);
      }
    }

    return {
      message: 'Quality scores updated',
      postsUpdated: updated,
      totalPosts: recentPosts.length,
    };
  }
}

