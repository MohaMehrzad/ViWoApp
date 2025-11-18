import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BuybackService } from './buyback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('buyback')
export class BuybackController {
  constructor(private readonly buybackService: BuybackService) {}

  @UseGuards(JwtAuthGuard)
  @Post('execute')
  async execute(@Body('monthlyProfit') monthlyProfit: number) {
    return this.buybackService.executeBuyback(monthlyProfit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('track-revenue')
  async trackRevenue(
    @Body('moduleName') moduleName: string,
    @Body('month') month: string,
    @Body('revenue') revenue: number,
    @Body('costs') costs: number,
  ) {
    return this.buybackService.trackModuleRevenue(moduleName, new Date(month), revenue, costs);
  }

  @Public()
  @Get('history')
  async getHistory(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.buybackService.getBuybackHistory(page, limit);
  }

  @Public()
  @Get('stats')
  async getStats() {
    return this.buybackService.getBuybackStats();
  }

  @Public()
  @Get('module-revenues')
  async getModuleRevenues() {
    return this.buybackService.getModuleRevenues();
  }
}

