import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { QualityModule } from '../quality/quality.module';
import { ReputationModule } from '../reputation/reputation.module';
import { AntiBotModule } from '../anti-bot/anti-bot.module';

@Module({
  imports: [QualityModule, ReputationModule, AntiBotModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}

