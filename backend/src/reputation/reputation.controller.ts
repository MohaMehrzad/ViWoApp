import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Public()
  @Get('user/:userId')
  async getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.getUserReputation(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('calculate/:userId')
  async calculateReputation(@Param('userId') userId: string) {
    return this.reputationService.calculateUserReputation(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-all')
  async updateAll() {
    return this.reputationService.updateAllReputations();
  }
}

