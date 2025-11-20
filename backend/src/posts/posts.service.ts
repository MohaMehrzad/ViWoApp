import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { Decimal } from 'decimal.js';
import { CacheService } from '../cache/cache.service';
import { CacheInvalidationService } from '../cache/cache-invalidation.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private cacheInvalidation: CacheInvalidationService,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  /**
   * Get relative time string (e.g., "5m", "2h", "3d")
   */
  private getRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months}mo`;
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  }

  /**
   * Format number with K/M suffixes
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  /**
   * Format a post for API response with computed fields
   */
  private formatPostResponse(post: any): PostResponseDto {
    return {
      ...post,
      // Ensure aspectRatio is always present
      aspectRatio: post.aspectRatio ?? 1.777, // Default 16:9
      
      // Add precomputed relative time
      relativeTime: this.getRelativeTime(post.createdAt),
      
      // Add formatted counts
      likesCountFormatted: this.formatNumber(post.likesCount),
      sharesCountFormatted: this.formatNumber(post.sharesCount),
      repostsCountFormatted: this.formatNumber(post.repostsCount),
      commentsCountFormatted: this.formatNumber(post.commentsCount),
    };
  }

  async create(userId: string, createPostDto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content,
        mediaType: createPostDto.mediaType || null,
        mediaUrl: createPostDto.mediaUrl || null,
        mediaThumbnail: createPostDto.mediaThumbnail || null,
        mediaMedium: createPostDto.mediaMedium || null,
        aspectRatio: createPostDto.aspectRatio || 1.777, // Default to 16:9
      },
      select: {
        id: true,
        userId: true,
        content: true,
        mediaType: true,
        mediaUrl: true,
        mediaThumbnail: true,
        mediaMedium: true,
        aspectRatio: true,
        likesCount: true,
        sharesCount: true,
        repostsCount: true,
        commentsCount: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
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

    // Invalidate feed caches and user stats
    await Promise.all([
      this.cacheInvalidation.invalidateFeedCaches(),
      this.cacheInvalidation.invalidateUserStats(userId),
    ]);

    return this.formatPostResponse(post);
  }

  async findAll(page = 1, limit = 20, userId?: string) {
    // Try to get from cache first (1 minute TTL)
    const cacheKey = `posts:feed:page:${page}:limit:${limit}:user:${userId || 'anon'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count(),
    ]);

    // Batch load all users in a single query to avoid N+1 problem
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        verificationTier: true,
      },
    });

    // Create user map for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Attach user data to posts
    const postsWithUsers = posts.map(post => ({
      ...post,
      user: userMap.get(post.userId),
    }));

    // Check if user has liked/shared/reposted each post
    let postsWithInteractions = postsWithUsers;
    if (userId) {
      const postIds = postsWithUsers.map((p) => p.id);
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

      postsWithInteractions = postsWithUsers.map((post) => {
        const types = interactionMap.get(post.id) || new Set();
        return {
          ...post,
          isLiked: types.has('like'),
          isShared: types.has('share'),
          isReposted: types.has('repost'),
        } as any;
      });
    }

    // Format all posts with computed fields
    const formattedPosts = postsWithInteractions.map(post => 
      this.formatPostResponse(post)
    );

    const result = {
      posts: formattedPosts,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };

    // Cache for 1 minute (60 seconds)
    await this.cache.set(cacheKey, result, 60);

    return result;
  }

  /**
   * Cursor-based pagination for infinite scroll
   * Much faster than offset pagination for large datasets
   */
  async findAllCursor(cursor?: string, limit = 20, userId?: string) {
    // Try to get from cache first (1 minute TTL)
    const cacheKey = `posts:cursor:${cursor || 'start'}:limit:${limit}:user:${userId || 'anon'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const posts = await this.prisma.post.findMany({
      take: limit + 1, // Fetch one extra to determine if there's more
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

    // Batch load all users in a single query to avoid N+1 problem
    const userIds = [...new Set(postsToReturn.map(p => p.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        verificationTier: true,
      },
    });

    // Create user map for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Attach user data to posts
    const postsWithUsers = postsToReturn.map(post => ({
      ...post,
      user: userMap.get(post.userId),
    }));

    // Check if user has liked/shared/reposted each post
    let postsWithInteractions = postsWithUsers;
    if (userId) {
      const postIds = postsWithUsers.map((p) => p.id);
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

      postsWithInteractions = postsWithUsers.map((post) => {
        const types = interactionMap.get(post.id) || new Set();
        return {
          ...post,
          isLiked: types.has('like'),
          isShared: types.has('share'),
          isReposted: types.has('repost'),
        } as any;
      });
    }

    // Format all posts with computed fields
    const formattedPosts = postsWithInteractions.map(post => 
      this.formatPostResponse(post)
    );

    const result = {
      posts: formattedPosts,
      nextCursor,
      hasMore,
    };

    // Cache for 1 minute (60 seconds)
    await this.cache.set(cacheKey, result, 60);

    return result;
  }

  async findById(id: string, userId?: string): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        content: true,
        mediaType: true,
        mediaUrl: true,
        mediaThumbnail: true,
        mediaMedium: true,
        aspectRatio: true,
        likesCount: true,
        sharesCount: true,
        repostsCount: true,
        commentsCount: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
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

    // Check if user has liked/shared/reposted (with caching)
    let postWithInteractions = post;
    if (userId) {
      const cacheKey = `interactions:${userId}:${id}`;
      let interactions = await this.cache.get<any[]>(cacheKey);
      
      if (!interactions) {
        interactions = await this.prisma.postInteraction.findMany({
          where: {
            userId,
            postId: id,
          },
        });
        // Cache for 5 minutes
        await this.cache.set(cacheKey, interactions, 300);
      }

      const types = new Set(interactions.map((i) => i.interactionType));
      postWithInteractions = {
        ...post,
        isLiked: types.has('like'),
        isShared: types.has('share'),
        isReposted: types.has('repost'),
      };
    }

    return this.formatPostResponse(postWithInteractions);
  }

  async findByUserId(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    // Batch load user (likely same user, but keeping consistent pattern)
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        verificationTier: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));
    const postsWithUsers = posts.map(post => ({
      ...post,
      user: userMap.get(post.userId),
    }));

    // Format all posts with computed fields
    const formattedPosts = postsWithUsers.map(post => this.formatPostResponse(post));

    return {
      posts: formattedPosts,
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
      select: {
        id: true,
        userId: true,
        content: true,
        mediaType: true,
        mediaUrl: true,
        mediaThumbnail: true,
        mediaMedium: true,
        aspectRatio: true,
        likesCount: true,
        sharesCount: true,
        repostsCount: true,
        commentsCount: true,
        viewsCount: true,
        createdAt: true,
        updatedAt: true,
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

    // Invalidate feed and post caches
    await this.cacheInvalidation.invalidateFeedCaches();

    return this.formatPostResponse(updatedPost);
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

    // Invalidate feed caches and user stats
    await Promise.all([
      this.cacheInvalidation.invalidateFeedCaches(),
      this.cacheInvalidation.invalidateUserStats(userId),
    ]);

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
    ]);

    // Queue notification for post owner (async, non-blocking)
    await this.notificationQueue.add('create', {
      userId: post.userId,
      type: 'like',
      actorId: userId,
      postId,
      message: 'liked your post',
    });

    // Invalidate caches
    await Promise.all([
      this.cacheInvalidation.invalidateInteractionCache(userId, postId),
      this.cacheInvalidation.invalidateUserStats(userId),
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
    ]);

    // Queue notification for post owner (async, non-blocking)
    await this.notificationQueue.add('create', {
      userId: post.userId,
      type: 'share',
      actorId: userId,
      postId,
      message: 'shared your post',
    });

    // Invalidate caches
    await Promise.all([
      this.cacheInvalidation.invalidateInteractionCache(userId, postId),
      this.cacheInvalidation.invalidateUserStats(userId),
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
    ]);

    // Queue notification for post owner (async, non-blocking)
    await this.notificationQueue.add('create', {
      userId: post.userId,
      type: 'repost',
      actorId: userId,
      postId,
      message: 'reposted your post',
    });

    // Invalidate caches
    await Promise.all([
      this.cacheInvalidation.invalidateInteractionCache(userId, postId),
      this.cacheInvalidation.invalidateUserStats(userId),
    ]);

    return { message: 'Post reposted successfully', vcoinEarned };
  }
}

