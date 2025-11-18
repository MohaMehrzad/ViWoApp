import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShortsService {
  constructor(private prisma: PrismaService) {}
  
  async createShort(
    userId: string,
    title: string | undefined,
    videoUrl: string,
    thumbnailUrl: string,
    duration: number,
  ) {
    return this.prisma.short.create({
      data: {
        userId,
        title,
        videoUrl,
        thumbnailUrl,
        duration,
      },
    });
  }

  async getShortsFeed(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const shorts = await this.prisma.short.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verificationTier: true,
          },
        },
      },
    });

    const total = await this.prisma.short.count();

    return {
      shorts,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }

  async getShort(id: string, userId?: string) {
    const short = await this.prisma.short.findUnique({
      where: { id },
    });

    if (!short) {
      throw new NotFoundException('Short not found');
    }

    return short;
  }

  async incrementView(id: string) {
    return this.prisma.short.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
    });
  }

  async likeShort(id: string, userId: string) {
    // Check if already liked
    // TODO: Add shorts_likes table for tracking
    
    return this.prisma.short.update({
      where: { id },
      data: {
        likesCount: { increment: 1 },
      },
    });
  }

  async getUserShorts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const shorts = await this.prisma.short.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verificationTier: true,
          },
        },
      },
    });

    const total = await this.prisma.short.count({ where: { userId } });
    
    return {
      shorts,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }

  async deleteShort(id: string, userId: string) {
    const short = await this.prisma.short.findUnique({ where: { id } });

    if (!short) {
      throw new NotFoundException('Short not found');
    }

    if (short.userId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this short');
    }

    return this.prisma.short.delete({ where: { id } });
  }
}

