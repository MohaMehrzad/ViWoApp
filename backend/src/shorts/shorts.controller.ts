import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ShortsService } from './shorts.service';
import { CreateShortDto } from './dto/create-short.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('shorts')
export class ShortsController {
  constructor(private readonly shortsService: ShortsService) {}

  @Get()
  @Public()
  async getShortsFeed(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.shortsService.getShortsFeed(
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createShort(
    @GetUser('id') userId: string,
    @Body() createShortDto: CreateShortDto,
  ) {
    const short = await this.shortsService.createShort(
      userId,
      createShortDto.title,
      createShortDto.videoUrl,
      createShortDto.thumbnailUrl,
      createShortDto.duration,
    );
    return { success: true, short };
  }

  @Get(':id')
  @Public()
  async getShort(
    @Param('id') id: string,
    @GetUser('id') userId?: string,
  ) {
    const short = await this.shortsService.getShort(id, userId);
    
    // Increment view count
    await this.shortsService.incrementView(id);
    
    return { success: true, short };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likeShort(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const short = await this.shortsService.likeShort(id, userId);
    return { success: true, short };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteShort(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    await this.shortsService.deleteShort(id, userId);
    return { success: true };
  }

  @Get('user/:userId')
  @Public()
  async getUserShorts(
    @Param('userId') userId: string,
    @Query('page') page: string,
  ) {
    return this.shortsService.getUserShorts(
      userId,
      parseInt(page) || 1,
    );
  }
}

