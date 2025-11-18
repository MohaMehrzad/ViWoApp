import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content,
        mediaType: createPostDto.mediaType || null,
        mediaUrl: createPostDto.mediaUrl || null,
        mediaThumbnail: createPostDto.mediaThumbnail || null,
      },
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

    return post;
  }

  async findAll(page = 1, limit = 20, userId?: string) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
      }),
      this.prisma.post.count(),
    ]);

    // Check if user has liked/shared/reposted each post
    let postsWithInteractions = posts;
    if (userId) {
      const postIds = posts.map((p) => p.id);
      const interactions = await this.prisma.postInteraction.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
      });

      const interactionMap = new Map<string, Set<string>>();
      interactions.forEach((i) => {
        if (!interactionMap.has(i.postId)) {
          interactionMap.set(i.postId, new Set());
        }
        interactionMap.get(i.postId)!.add(i.interactionType);
      });

      postsWithInteractions = posts.map((post) => {
        const types = interactionMap.get(post.id) || new Set();
        return {
          ...post,
          isLiked: types.has('like'),
          isShared: types.has('share'),
          isReposted: types.has('repost'),
        };
      });
    }

    return {
      posts: postsWithInteractions,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async findById(id: string, userId?: string): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Check if user has liked/shared/reposted
    if (userId) {
      const interactions = await this.prisma.postInteraction.findMany({
        where: {
          userId,
          postId: id,
        },
      });

      const types = new Set(interactions.map((i) => i.interactionType));
      return {
        ...post,
        isLiked: types.has('like'),
        isShared: types.has('share'),
        isReposted: types.has('repost'),
      };
    }

    return post;
  }

  async findByUserId(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
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

    return updatedPost;
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  async like(postId: string, userId: string): Promise<{ message: string; vcoinEarned: number }> {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.postInteraction.findUnique({
      where: {
        userId_postId_interactionType: {
          userId,
          postId,
          interactionType: 'like',
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('Already liked this post');
    }

    // Calculate VCoin reward (simple for now, will be enhanced with quality multipliers later)
    const vcoinEarned = 0.5; // Base reward for liking

    // Create interaction and credit VCoin
    await this.prisma.$transaction([
      // Create interaction
      this.prisma.postInteraction.create({
        data: {
          userId,
          postId,
          interactionType: 'like',
          vcoinEarned: new Decimal(vcoinEarned),
        },
      }),
      // Increment like count
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
      // Credit VCoin to user
      this.prisma.vCoinBalance.update({
        where: { userId },
        data: {
          availableBalance: { increment: vcoinEarned },
          earnedTotal: { increment: vcoinEarned },
        },
      }),
      // Log transaction
      this.prisma.vCoinTransaction.create({
        data: {
          userId,
          amount: new Decimal(vcoinEarned),
          type: 'earn',
          source: 'like',
          relatedPostId: postId,
          status: 'completed',
        },
      }),
      // Create notification for post owner
      this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'like',
          actorId: userId,
          postId,
          message: 'liked your post',
        },
      }),
    ]);

    return { message: 'Post liked successfully', vcoinEarned };
  }

  async unlike(postId: string, userId: string): Promise<{ message: string }> {
    const existingLike = await this.prisma.postInteraction.findUnique({
      where: {
        userId_postId_interactionType: {
          userId,
          postId,
          interactionType: 'like',
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.$transaction([
      // Delete interaction
      this.prisma.postInteraction.delete({
        where: {
          userId_postId_interactionType: {
            userId,
            postId,
            interactionType: 'like',
          },
        },
      }),
      // Decrement like count
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Post unliked successfully' };
  }

  async share(postId: string, userId: string): Promise<{ message: string; vcoinEarned: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already shared
    const existingShare = await this.prisma.postInteraction.findUnique({
      where: {
        userId_postId_interactionType: {
          userId,
          postId,
          interactionType: 'share',
        },
      },
    });

    if (existingShare) {
      throw new ConflictException('Already shared this post');
    }

    const vcoinEarned = 1.0; // Base reward for sharing

    await this.prisma.$transaction([
      this.prisma.postInteraction.create({
        data: {
          userId,
          postId,
          interactionType: 'share',
          vcoinEarned: new Decimal(vcoinEarned),
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { sharesCount: { increment: 1 } },
      }),
      this.prisma.vCoinBalance.update({
        where: { userId },
        data: {
          availableBalance: { increment: vcoinEarned },
          earnedTotal: { increment: vcoinEarned },
        },
      }),
      this.prisma.vCoinTransaction.create({
        data: {
          userId,
          amount: new Decimal(vcoinEarned),
          type: 'earn',
          source: 'share',
          relatedPostId: postId,
          status: 'completed',
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'share',
          actorId: userId,
          postId,
          message: 'shared your post',
        },
      }),
    ]);

    return { message: 'Post shared successfully', vcoinEarned };
  }

  async repost(postId: string, userId: string): Promise<{ message: string; vcoinEarned: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already reposted
    const existingRepost = await this.prisma.postInteraction.findUnique({
      where: {
        userId_postId_interactionType: {
          userId,
          postId,
          interactionType: 'repost',
        },
      },
    });

    if (existingRepost) {
      throw new ConflictException('Already reposted this post');
    }

    const vcoinEarned = 1.2; // Base reward for reposting

    await this.prisma.$transaction([
      this.prisma.postInteraction.create({
        data: {
          userId,
          postId,
          interactionType: 'repost',
          vcoinEarned: new Decimal(vcoinEarned),
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { repostsCount: { increment: 1 } },
      }),
      this.prisma.vCoinBalance.update({
        where: { userId },
        data: {
          availableBalance: { increment: vcoinEarned },
          earnedTotal: { increment: vcoinEarned },
        },
      }),
      this.prisma.vCoinTransaction.create({
        data: {
          userId,
          amount: new Decimal(vcoinEarned),
          type: 'earn',
          source: 'repost',
          relatedPostId: postId,
          status: 'completed',
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'repost',
          actorId: userId,
          postId,
          message: 'reposted your post',
        },
      }),
    ]);

    return { message: 'Post reposted successfully', vcoinEarned };
  }
}

