import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  // App config
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get corsOrigin(): string[] {
    return this.configService.get<string>('CORS_ORIGIN', 'http://localhost:8081').split(',');
  }

  // Database
  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  // Redis
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  // JWT
  get jwtAccessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET', 'secret');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 'secret');
  }

  get jwtAccessExpiry(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m');
  }

  get jwtRefreshExpiry(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
  }

  // Token Economy
  get vcnTotalSupply(): number {
    return this.configService.get<number>('VCN_TOTAL_SUPPLY', 1000000000);
  }

  get monthlyEmission(): number {
    return this.configService.get<number>('MONTHLY_EMISSION', 5833333);
  }

  get dailyRewardAllocation(): number {
    return this.configService.get<number>('DAILY_REWARD_ALLOCATION', 0.8);
  }

  get dailyRewardPool(): number {
    return Math.round((this.monthlyEmission * this.dailyRewardAllocation) / 30);
  }

  get maxDailyRewardUsd(): number {
    return this.configService.get<number>('MAX_DAILY_REWARD_USD', 50);
  }

  get vcnPrice(): number {
    return this.configService.get<number>('VCN_PRICE', 0.03);
  }

  // Activity Points
  get activityPoints() {
    return {
      TEXT_POST: this.configService.get<number>('POINTS_TEXT_POST', 10),
      IMAGE_POST: this.configService.get<number>('POINTS_IMAGE_POST', 20),
      VIDEO_POST: this.configService.get<number>('POINTS_VIDEO_POST', 50),
      LIKE: this.configService.get<number>('POINTS_LIKE', 1),
      COMMENT: this.configService.get<number>('POINTS_COMMENT', 8),
      SHARE: this.configService.get<number>('POINTS_SHARE', 10),
      REPOST: this.configService.get<number>('POINTS_REPOST', 12),
      FOLLOW: this.configService.get<number>('POINTS_FOLLOW', 2),
    };
  }

  // Daily Caps
  get dailyCaps() {
    return {
      MAX_POSTS: this.configService.get<number>('DAILY_CAP_POSTS', 50),
      MAX_LIKES: this.configService.get<number>('DAILY_CAP_LIKES', 500),
      MAX_COMMENTS: this.configService.get<number>('DAILY_CAP_COMMENTS', 200),
      MAX_SHARES: this.configService.get<number>('DAILY_CAP_SHARES', 100),
      MAX_FOLLOWS: this.configService.get<number>('DAILY_CAP_FOLLOWS', 100),
    };
  }

  // Fee Distribution
  get burnRate(): number {
    return this.configService.get<number>('BURN_RATE', 0.2);
  }

  get treasuryRate(): number {
    return this.configService.get<number>('TREASURY_RATE', 0.5);
  }

  get rewardsRate(): number {
    return this.configService.get<number>('REWARDS_RATE', 0.3);
  }

  get transactionFeeRate(): number {
    return this.configService.get<number>('TRANSACTION_FEE_RATE', 0.05);
  }

  // Staking
  get stakingRequirements() {
    return {
      IDENTITY_PREMIUM: this.configService.get<number>('STAKE_IDENTITY_PREMIUM', 500),
      CONTENT_CREATOR_PRO: this.configService.get<number>('STAKE_CONTENT_CREATOR_PRO', 1000),
      DAO_FOUNDER: this.configService.get<number>('STAKE_DAO_FOUNDER', 2000),
      QUALITY_CURATOR: this.configService.get<number>('STAKE_QUALITY_CURATOR', 250),
      TRUSTED_MODERATOR: this.configService.get<number>('STAKE_TRUSTED_MODERATOR', 500),
    };
  }

  // Verification Tiers Pricing
  get tierPricing() {
    return {
      BASIC: this.configService.get<number>('PRICE_TIER_BASIC', 1.0),
      VERIFIED: this.configService.get<number>('PRICE_TIER_VERIFIED', 7.0),
      PREMIUM: this.configService.get<number>('PRICE_TIER_PREMIUM', 19.0),
      ENTERPRISE: this.configService.get<number>('PRICE_TIER_ENTERPRISE', 124.0),
    };
  }
}

