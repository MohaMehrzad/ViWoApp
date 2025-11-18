import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { UpgradeTierDto } from './dto/upgrade-tier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Public()
  @Get('tiers')
  async getTiers() {
    return this.verificationService.getTiers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@GetUser('id') userId: string) {
    return this.verificationService.getUserTier(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgrade(@Body() upgradeTierDto: UpgradeTierDto, @GetUser('id') userId: string) {
    return this.verificationService.upgradeTier(userId, upgradeTierDto.tier);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  async apply(@GetUser('id') userId: string, @Body() documents?: any) {
    return this.verificationService.applyForVerification(userId, documents);
  }
}

