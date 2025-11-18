import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getTiers() {
    const pricing = {
      BASIC: this.configService.get<number>('PRICE_TIER_BASIC', 1.0),
      VERIFIED: this.configService.get<number>('PRICE_TIER_VERIFIED', 7.0),
      PREMIUM: this.configService.get<number>('PRICE_TIER_PREMIUM', 19.0),
      ENTERPRISE: this.configService.get<number>('PRICE_TIER_ENTERPRISE', 124.0),
    };

    return {
      tiers: [
        {
          name: 'BASIC',
          price: pricing.BASIC,
          benefits: [
            'Basic profile',
            'Create posts',
            'Earn VCoin (1.0x multiplier)',
            'Follow users',
          ],
        },
        {
          name: 'VERIFIED',
          price: pricing.VERIFIED,
          benefits: [
            'Verification badge',
            'Priority support',
            'Earn VCoin (1.4x multiplier)',
            'Advanced analytics',
            'Create communities',
          ],
        },
        {
          name: 'PREMIUM',
          price: pricing.PREMIUM,
          benefits: [
            'Premium badge',
            'Remove ads',
            'Earn VCoin (1.8x multiplier)',
            'Advanced features',
            'Custom profile themes',
            'Priority content distribution',
          ],
        },
        {
          name: 'ENTERPRISE',
          price: pricing.ENTERPRISE,
          benefits: [
            'Enterprise badge',
            'White-label options',
            'Earn VCoin (2.5x multiplier)',
            'API access',
            'Dedicated support',
            'Custom integrations',
          ],
        },
      ],
      pricing,
    };
  }

  async getUserTier(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationTier: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tierInfo = await this.getTiers();
    const currentTier = user.verificationTier || 'BASIC';
    const tierData = tierInfo.tiers.find(t => t.name === currentTier);

    return {
      currentTier,
      ...tierData,
    };
  }

  async upgradeTier(userId: string, newTier: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentTier = user.verificationTier || 'BASIC';
    const tierHierarchy = ['BASIC', 'VERIFIED', 'PREMIUM', 'ENTERPRISE'];
    const currentIndex = tierHierarchy.indexOf(currentTier);
    const newIndex = tierHierarchy.indexOf(newTier);

    if (newIndex <= currentIndex) {
      throw new BadRequestException('Can only upgrade to higher tier');
    }

    // In production, would check payment here
    // For now, just update the tier

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationTier: newTier,
      },
    });

    // Update reputation score to reflect new tier
    const multiplier = 
      newTier === 'VERIFIED' ? 1.4 :
      newTier === 'PREMIUM' ? 1.8 :
      newTier === 'ENTERPRISE' ? 2.5 : 1.0;

    await this.prisma.userReputationScore.update({
      where: { userId },
      data: {
        verificationScore: new Decimal(multiplier),
      },
    });

    return {
      message: 'Tier upgraded successfully',
      newTier,
      multiplier,
    };
  }

  async applyForVerification(userId: string, documents?: any) {
    // In production, would process documents and create verification request
    // For MVP, this is a placeholder
    
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'verification_pending',
        message: 'Your verification application is under review',
      },
    });

    return {
      message: 'Verification application submitted',
      status: 'PENDING',
      estimatedProcessingTime: '24-48 hours',
    };
  }
}

