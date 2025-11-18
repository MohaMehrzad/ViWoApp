import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Public()
  @Get('post/:postId')
  async getPostQuality(@Param('postId') postId: string) {
    return this.qualityService.getPostQualityScore(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-all')
  async updateAll() {
    return this.qualityService.updateAllQualityScores();
  }
}

