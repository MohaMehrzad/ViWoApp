import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { VideoProcessor } from './processors/video.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { RewardProcessor } from './processors/reward.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600, // Keep jobs for 1 hour
            count: 1000, // Keep maximum 1000 jobs
          },
          removeOnFail: {
            age: 86400, // Keep failed jobs for 24 hours
          },
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'video',
        defaultJobOptions: {
          attempts: 2,
          timeout: 300000, // 5 minutes
        },
      },
      {
        name: 'notification',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      {
        name: 'reward',
        defaultJobOptions: {
          attempts: 3,
          priority: 1, // High priority
        },
      },
    ),
  ],
  providers: [VideoProcessor, NotificationProcessor, RewardProcessor],
  exports: [BullModule],
})
export class QueueModule {}

