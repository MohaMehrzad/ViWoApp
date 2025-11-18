import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @GetUser('id') userId: string) {
    return this.postsService.create(userId, createPostDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @GetUser('id') userId?: string,
  ) {
    return this.postsService.findAll(page, limit, userId);
  }

  @Public()
  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.postsService.findByUserId(userId, page, limit);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string, @GetUser('id') userId?: string) {
    return this.postsService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.update(id, userId, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.postsService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async like(@Param('id') postId: string, @GetUser('id') userId: string) {
    return this.postsService.like(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlike(@Param('id') postId: string, @GetUser('id') userId: string) {
    return this.postsService.unlike(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async share(@Param('id') postId: string, @GetUser('id') userId: string) {
    return this.postsService.share(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/repost')
  async repost(@Param('id') postId: string, @GetUser('id') userId: string) {
    return this.postsService.repost(postId, userId);
  }
}

