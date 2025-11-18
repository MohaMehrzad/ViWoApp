import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ProfileStatsDto } from './dto/profile-stats.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string, requestingUserId?: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        location: true,
        website: true,
        socialLinks: true,
        privacySettings: true,
        emailNotifications: true,
        walletAddress: true,
        verificationTier: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            shorts: true,
            followersRelation: true,
            followingRelation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check privacy settings
    const isOwnProfile = requestingUserId === id;
    const privacySettings = user.privacySettings as any;
    
    // If profile is private and not own profile, check if following
    if (!isOwnProfile && privacySettings?.profileVisibility === 'private') {
      if (!requestingUserId) {
        throw new ForbiddenException('This profile is private');
      }
      
      const isFollowing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: requestingUserId,
            followingId: id,
          },
        },
      });
      
      if (!isFollowing) {
        throw new ForbiddenException('This profile is private');
      }
    }

    let isFollowing = false;
    if (requestingUserId && requestingUserId !== id) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: requestingUserId,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    // Hide email based on privacy settings
    const showEmail = isOwnProfile || privacySettings?.showEmail === true;

    return {
      id: user.id,
      username: user.username,
      email: showEmail ? user.email : null,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      privacySettings: isOwnProfile ? user.privacySettings : null,
      emailNotifications: isOwnProfile ? user.emailNotifications : null,
      walletAddress: user.walletAddress,
      verificationTier: user.verificationTier,
      createdAt: user.createdAt,
      followersCount: user._count.followersRelation,
      followingCount: user._count.followingRelation,
      postsCount: user._count.posts,
      shortsCount: user._count.shorts,
      isFollowing,
    };
  }

  async findByUsername(username: string, requestingUserId?: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        walletAddress: true,
        verificationTier: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followersRelation: true,
            followingRelation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.findById(user.id, requestingUserId);
  }

  async update(userId: string, updateUserDto: UpdateUserDto, requestingUserId: string): Promise<UserResponseDto> {
    // Check if user is updating their own profile
    if (userId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Check if wallet address is already taken (if updating)
    if (updateUserDto.walletAddress) {
      const existingUser = await this.prisma.user.findUnique({
        where: { walletAddress: updateUserDto.walletAddress },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Wallet address already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        location: true,
        website: true,
        socialLinks: true,
        privacySettings: true,
        emailNotifications: true,
        walletAddress: true,
        verificationTier: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async follow(userId: string, followingId: string): Promise<{ message: string }> {
    if (userId === followingId) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship
    await this.prisma.follow.create({
      data: {
        followerId: userId,
        followingId,
      },
    });

    // Create notification for followed user
    await this.prisma.notification.create({
      data: {
        userId: followingId,
        type: 'follow',
        actorId: userId,
        message: `${targetUser.username} started following you`,
      },
    });

    return { message: 'Successfully followed user' };
  }

  async unfollow(userId: string, followingId: string): Promise<{ message: string }> {
    if (userId === followingId) {
      throw new ForbiddenException('Invalid operation');
    }

    // Check if following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('Not following this user');
    }

    // Delete follow relationship
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        select: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              verificationTier: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      data: followers.map((f) => f.follower),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        select: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              verificationTier: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      data: following.map((f) => f.following),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          verificationTier: true,
          _count: {
            select: {
              followersRelation: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          followersRelation: {
            _count: 'desc',
          },
        },
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        followersCount: user._count.followersRelation,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProfileStats(userId: string) {
    // Get user basic info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationTier: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            shorts: true,
            followersRelation: true,
            followingRelation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get VCoin balance
    const vcoinBalance = await this.prisma.vCoinBalance.findUnique({
      where: { userId },
      select: {
        availableBalance: true,
        stakedBalance: true,
        earnedTotal: true,
      },
    });

    // Get reputation score
    const reputation = await this.prisma.userReputationScore.findUnique({
      where: { userId },
      select: {
        overallReputation: true,
      },
    });

    // Get active stakes count
    const activeStakesCount = await this.prisma.vCoinStake.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    // Get total engagement (likes, shares, comments received on all posts)
    const postsEngagement = await this.prisma.post.aggregate({
      where: { userId },
      _sum: {
        likesCount: true,
        sharesCount: true,
        commentsCount: true,
        viewsCount: true,
      },
    });

    return {
      // VCoin stats
      vcoinBalance: vcoinBalance ? Number(vcoinBalance.availableBalance) : 0,
      vcoinStaked: vcoinBalance ? Number(vcoinBalance.stakedBalance) : 0,
      vcoinEarnedTotal: vcoinBalance ? Number(vcoinBalance.earnedTotal) : 0,

      // Reputation
      reputationScore: reputation ? Number(reputation.overallReputation) : 1.0,

      // Verification
      verificationTier: user.verificationTier,

      // Engagement metrics
      totalLikesReceived: postsEngagement._sum.likesCount || 0,
      totalSharesReceived: postsEngagement._sum.sharesCount || 0,
      totalCommentsReceived: postsEngagement._sum.commentsCount || 0,
      totalViewsReceived: postsEngagement._sum.viewsCount || 0,

      // Staking
      activeStakesCount,

      // Account info
      memberSince: user.createdAt,

      // Content counts
      postsCount: user._count.posts,
      shortsCount: user._count.shorts,
      followersCount: user._count.followersRelation,
      followingCount: user._count.followingRelation,
    };
  }
}

