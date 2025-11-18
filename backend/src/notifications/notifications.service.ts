import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private firebaseApp: admin.app.App;
  private isInitialized = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Initialize Firebase
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (projectId && privateKey && clientEmail) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });
        this.isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        console.warn('⚠️ Firebase Admin SDK initialization failed:', error.message);
        console.warn('Push notifications will be disabled. Set Firebase environment variables to enable.');
      }
    } else {
      console.warn('⚠️ Firebase credentials not found. Push notifications disabled.');
    }
  }

  async registerFCMToken(userId: string, token: string, deviceType: string) {
    // Check if token already exists
    const existing = await this.prisma.fcmToken.findFirst({
      where: { userId, token },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.fcmToken.create({
      data: {
        userId,
        token,
        deviceType,
      },
    });
  }

  async removeFCMToken(userId: string, token: string) {
    return this.prisma.fcmToken.deleteMany({
      where: { userId, token },
    });
  }

  async sendToUser(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    },
  ) {
    if (!this.isInitialized) {
      console.log('Firebase not initialized, skipping notification');
      return { success: false, message: 'Firebase not initialized' };
    }

    const tokens = await this.prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) {
      return { success: false, message: 'No FCM tokens found' };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: tokens.map((t) => t.token),
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            invalidTokens.push(tokens[idx].token);
          }
        });

        // Delete invalid tokens
        await this.prisma.fcmToken.deleteMany({
          where: {
            token: { in: invalidTokens },
          },
        });
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('FCM Error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLikeNotification(postOwnerId: string, likerUsername: string) {
    return this.sendToUser(postOwnerId, {
      title: 'New Like!',
      body: `${likerUsername} liked your post`,
      data: {
        type: 'like',
      },
    });
  }

  async sendCommentNotification(
    postOwnerId: string,
    commenterUsername: string,
    comment: string,
  ) {
    return this.sendToUser(postOwnerId, {
      title: 'New Comment!',
      body: `${commenterUsername}: ${comment.substring(0, 50)}...`,
      data: {
        type: 'comment',
      },
    });
  }

  async sendFollowNotification(followedUserId: string, followerUsername: string) {
    return this.sendToUser(followedUserId, {
      title: 'New Follower!',
      body: `${followerUsername} started following you`,
      data: {
        type: 'follow',
      },
    });
  }

  async sendVCoinEarnedNotification(userId: string, amount: number, source: string) {
    return this.sendToUser(userId, {
      title: 'VCoin Earned! 💰',
      body: `You earned ${amount} VCN from ${source}`,
      data: {
        type: 'vcoin_earned',
        amount: amount.toString(),
      },
    });
  }
}

