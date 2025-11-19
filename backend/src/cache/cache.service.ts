import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');

    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit() {
    this.redis.on('connect', () => {
      console.log('✅ Redis cache connected');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis cache error:', error.message);
    });

    this.redis.on('ready', () => {
      console.log('✅ Redis cache ready');
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
    console.log('👋 Redis cache disconnected');
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a specific key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    
    try {
      await this.redis.del(...keys);
    } catch (error) {
      console.error(`Cache delete many error:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration on a key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
    }
  }

  /**
   * Get time to live for a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache ttl error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, by: number = 1): Promise<number> {
    try {
      if (by === 1) {
        return await this.redis.incr(key);
      } else {
        return await this.redis.incrby(key, by);
      }
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement a counter
   */
  async decr(key: string, by: number = 1): Promise<number> {
    try {
      if (by === 1) {
        return await this.redis.decr(key);
      } else {
        return await this.redis.decrby(key, by);
      }
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Add member to a set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      console.error(`Cache sadd error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Remove member from a set
   */
  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.srem(key, ...members);
    } catch (error) {
      console.error(`Cache srem error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if member is in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Cache sismember error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      console.error(`Cache smembers error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Push to list (left)
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      console.error(`Cache lpush error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Pop from list (left)
   */
  async lpop(key: string): Promise<string | null> {
    try {
      return await this.redis.lpop(key);
    } catch (error) {
      console.error(`Cache lpop error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get range from list
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redis.lrange(key, start, stop);
    } catch (error) {
      console.error(`Cache lrange error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      await this.redis.hset(key, field, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache hset error for key ${key}:`, error);
    }
  }

  /**
   * Get hash field
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const data = await this.redis.hget(key, field);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache hget error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await this.redis.hgetall(key);
      const parsed: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value as T;
        }
      }
      return parsed;
    } catch (error) {
      console.error(`Cache hgetall error for key ${key}:`, error);
      return {};
    }
  }

  /**
   * Delete hash field
   */
  async hdel(key: string, ...fields: string[]): Promise<void> {
    try {
      await this.redis.hdel(key, ...fields);
    } catch (error) {
      console.error(`Cache hdel error for key ${key}:`, error);
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
      console.warn('⚠️  Redis cache flushed!');
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  /**
   * Get Redis instance for advanced operations
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Ping Redis to check connection
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Cache ping error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    dbsize: number;
    uptime: number;
    usedMemory: string;
  }> {
    try {
      const info = await this.redis.info();
      const dbsize = await this.redis.dbsize();
      
      // Parse info string
      const lines = info.split('\r\n');
      const stats: any = {};
      
      for (const line of lines) {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      }
      
      return {
        connected: this.redis.status === 'ready',
        dbsize,
        uptime: parseInt(stats.uptime_in_seconds || '0'),
        usedMemory: stats.used_memory_human || 'N/A',
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        connected: false,
        dbsize: 0,
        uptime: 0,
        usedMemory: 'N/A',
      };
    }
  }
}

