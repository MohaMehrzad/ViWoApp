import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AntiBotService } from './anti-bot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('anti-bot')
@UseGuards(JwtAuthGuard)
export class AntiBotController {
  constructor(private readonly antiBotService: AntiBotService) {}

  @Post('check/:userId')
  async checkUser(@Param('userId') userId: string) {
    return this.antiBotService.applyAntiBotFilters(userId);
  }

  @Get('flags/:userId')
  async getUserFlags(@Param('userId') userId: string) {
    return this.antiBotService.getUserBotFlags(userId);
  }

  @Post('flags/:flagId/resolve')
  async resolveFlag(
    @Param('flagId') flagId: string,
    @Body('resolution') resolution: string,
  ) {
    return this.antiBotService.resolveFlag(flagId, resolution);
  }

  @Get('stats')
  async getStats() {
    return this.antiBotService.getSystemBotStats();
  }
}

