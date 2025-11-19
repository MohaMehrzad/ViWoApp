import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { VCoinModule } from './vcoin/vcoin.module';
import { QualityModule } from './quality/quality.module';
import { ReputationModule } from './reputation/reputation.module';
import { AntiBotModule } from './anti-bot/anti-bot.module';
import { StakingModule } from './staking/staking.module';
import { RewardsModule } from './rewards/rewards.module';
import { RewardsScheduler } from './rewards/rewards.scheduler';
import { VerificationModule } from './verification/verification.module';
import { BuybackModule } from './buyback/buyback.module';
import { UploadModule } from './upload/upload.module';
import { ShortsModule } from './shorts/shorts.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests
    }]),
    PrismaModule,
    CacheModule,
    QueueModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    VCoinModule,
    QualityModule,
    ReputationModule,
    AntiBotModule,
    StakingModule,
    RewardsModule,
    VerificationModule,
    BuybackModule,
    UploadModule,
    ShortsModule,
    MessagesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RewardsScheduler,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

