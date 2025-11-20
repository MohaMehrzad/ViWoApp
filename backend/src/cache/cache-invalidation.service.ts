import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Centralized cache invalidation service
 * Handles all cache invalidation logic across the application
 */
@Injectable()
export class CacheInvalidationService {
  constructor(private cache: CacheService) {}

  /**
   * Invalidate all user-related caches
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:stats:${userId}`,
      `profile:view:${userId}:*`,
    ];

    await Promise.all(
      patterns.map(pattern => this.cache.delPattern(pattern))
    );
  }

  /**
   * Invalidate post-related caches
   */
  async invalidatePostCache(postId?: string): Promise<void> {
    // Invalidate feed caches
    await this.cache.delPattern('posts:feed:*');
    await this.cache.delPattern('posts:cursor:*');

    // If specific post, invalidate its interactions
    if (postId) {
      await this.cache.delPattern(`interactions:*:${postId}`);
    }
  }

  /**
   * Invalidate interaction caches for a specific user and post
   */
  async invalidateInteractionCache(userId: string, postId: string): Promise<void> {
    await this.cache.del(`interactions:${userId}:${postId}`);
  }

  /**
   * Invalidate profile view caches for a user
   */
  async invalidateProfileView(userId: string): Promise<void> {
    await this.cache.delPattern(`profile:view:${userId}:*`);
  }

  /**
   * Invalidate user stats cache
   */
  async invalidateUserStats(userId: string): Promise<void> {
    await this.cache.del(`user:stats:${userId}`);
  }

  /**
   * Invalidate all feed caches (when new post is created)
   */
  async invalidateFeedCaches(): Promise<void> {
    await Promise.all([
      this.cache.delPattern('posts:feed:*'),
      this.cache.delPattern('posts:cursor:*'),
    ]);
  }

  /**
   * Invalidate multiple users' caches at once
   */
  async invalidateMultipleUsers(userIds: string[]): Promise<void> {
    await Promise.all(
      userIds.map(userId => this.invalidateUserCache(userId))
    );
  }

  /**
   * Clear all application caches (use with caution!)
   */
  async clearAllCaches(): Promise<void> {
    console.warn('⚠️  Clearing all application caches!');
    await this.cache.flushAll();
  }
}

