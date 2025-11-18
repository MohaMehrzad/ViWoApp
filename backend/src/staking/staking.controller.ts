import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StakingService } from './staking.service';
import { StakeVCoinDto } from './dto/stake-vcoin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('staking')
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('stake')
  async stake(@Body() stakeVCoinDto: StakeVCoinDto, @GetUser('id') userId: string) {
    return this.stakingService.stakeVCoin(
      userId,
      stakeVCoinDto.amount,
      stakeVCoinDto.featureType,
      stakeVCoinDto.lockPeriodDays,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('unstake/:stakeId')
  async unstake(@Param('stakeId') stakeId: string, @GetUser('id') userId: string) {
    return this.stakingService.unstakeVCoin(stakeId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-stakes')
  async getMyStakes(@GetUser('id') userId: string) {
    return this.stakingService.getUserStakes(userId);
  }

  @Public()
  @Get('requirements')
  async getRequirements() {
    return this.stakingService.getStakingRequirements();
  }

  @UseGuards(JwtAuthGuard)
  @Post('process-unlocks')
  async processUnlocks() {
    return this.stakingService.processUnlocks();
  }
}

