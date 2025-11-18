import { Controller, Get, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(
    @GetUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.rewardsService.getRewardHistory(userId, page, limit);
  }

  @Public()
  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.rewardsService.getLeaderboard(period, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('distribute')
  async distributeRewards() {
    return this.rewardsService.distributeDailyRewards();
  }
}

