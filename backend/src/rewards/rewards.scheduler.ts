import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RewardsService } from './rewards.service';
import { QualityService } from '../quality/quality.service';
import { ReputationService } from '../reputation/reputation.service';
import { StakingService } from '../staking/staking.service';

@Injectable()
export class RewardsScheduler {
  private readonly logger = new Logger(RewardsScheduler.name);

  constructor(
    private readonly rewardsService: RewardsService,
    private readonly qualityService: QualityService,
    private readonly reputationService: ReputationService,
    private readonly stakingService: StakingService,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'UTC' })
  async handleDailyRewardDistribution() {
    this.logger.log('🎁 Starting daily reward distribution...');

    try {
      const result = await this.rewardsService.distributeDailyRewards();
      
      if (result.success && result.distributed !== undefined) {
        this.logger.log(
          `✅ Distributed ${result.distributed.toFixed(2)} VCN to ${result.recipients} users`
        );
      } else {
        this.logger.warn(`⚠️ ${result.message}`);
      }
    } catch (error) {
      this.logger.error('❌ Error distributing rewards:', error);
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async updateQualityScores() {
    this.logger.log('📊 Updating quality scores...');

    try {
      const result = await this.qualityService.updateAllQualityScores();
      this.logger.log(`✅ Updated ${result.postsUpdated} quality scores`);
    } catch (error) {
      this.logger.error('❌ Error updating quality scores:', error);
    }
  }

  @Cron('0 2 * * *', { timeZone: 'UTC' }) // Every day at 2 AM
  async updateReputationScores() {
    this.logger.log('⭐ Updating reputation scores...');

    try {
      const result = await this.reputationService.updateAllReputations();
      this.logger.log(`✅ Updated ${result.usersUpdated} reputation scores`);
    } catch (error) {
      this.logger.error('❌ Error updating reputations:', error);
    }
  }

  @Cron('0 * * * *') // Every hour
  async processStakeUnlocks() {
    this.logger.log('🔓 Processing stake unlocks...');

    try {
      const result = await this.stakingService.processUnlocks();
      this.logger.log(`✅ Processed ${result.stakesUnlocked} stake unlocks`);
    } catch (error) {
      this.logger.error('❌ Error processing unlocks:', error);
    }
  }

  @Cron('0 12 * * *', { timeZone: 'UTC' }) // Daily at noon
  async logSystemStats() {
    this.logger.log('📈 Daily system statistics logged');
  }
}

