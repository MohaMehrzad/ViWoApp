import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VCoinService } from './vcoin.service';
import { SendVCoinDto } from './dto/send-vcoin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('vcoin')
export class VCoinController {
  constructor(private readonly vcoinService: VCoinService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@GetUser('id') userId: string) {
    return this.vcoinService.getBalance(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @GetUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.vcoinService.getTransactions(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Body() sendVCoinDto: SendVCoinDto, @GetUser('id') senderId: string) {
    return this.vcoinService.send(
      senderId,
      sendVCoinDto.recipientId,
      sendVCoinDto.amount,
      sendVCoinDto.note,
    );
  }

  @Public()
  @Get('stats')
  async getStats() {
    return this.vcoinService.getTotalSupplyStats();
  }
}

