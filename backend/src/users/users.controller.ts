import { Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Public()
  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.searchUsers(query, page, limit);
  }

  @Public()
  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @GetUser('id') requestingUserId?: string,
  ) {
    return this.usersService.findById(id, requestingUserId);
  }

  @Public()
  @Get('username/:username')
  async getUserByUsername(
    @Param('username') username: string,
    @GetUser('id') requestingUserId?: string,
  ) {
    return this.usersService.findByUsername(username, requestingUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') requestingUserId: string,
  ) {
    return this.usersService.update(id, updateUserDto, requestingUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(
    @Param('id') followingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.usersService.follow(userId, followingId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollowUser(
    @Param('id') followingId: string,
    @GetUser('id') userId: string,
  ) {
    return this.usersService.unfollow(userId, followingId);
  }

  @Public()
  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.getFollowers(userId, page, limit);
  }

  @Public()
  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.usersService.getFollowing(userId, page, limit);
  }

  @Public()
  @Get(':id/stats')
  async getProfileStats(@Param('id') userId: string) {
    return this.usersService.getProfileStats(userId);
  }

  @Public()
  @Get(':id/profile-view')
  async getProfileView(
    @Param('id') userId: string,
    @GetUser('id') currentUserId?: string,
  ) {
    return this.usersService.getProfileView(userId, currentUserId);
  }
}

