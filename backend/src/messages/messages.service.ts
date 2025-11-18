import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async createThread(participantIds: string[]) {
    // Check if thread already exists
    const existingThread = await this.prisma.messageThread.findFirst({
      where: {
        participantIds: {
          equals: participantIds.sort(),
        },
      },
    });

    if (existingThread) {
      return existingThread;
    }

    return this.prisma.messageThread.create({
      data: {
        participantIds: participantIds.sort(),
      },
    });
  }

  async createMessage(
    senderId: string,
    threadId: string,
    content: string,
    mediaUrl?: string,
  ) {
    const message = await this.prisma.message.create({
      data: {
        senderId,
        threadId,
        content,
        mediaUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update thread last message time
    await this.prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async getThreadMessages(threadId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: { threadId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return messages.reverse(); // Oldest first
  }

  async getUserThreads(userId: string) {
    const threads = await this.prisma.messageThread.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Get last message for each thread
    const threadsWithMessages = await Promise.all(
      threads.map(async (thread) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: { threadId: thread.id },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        });

        return {
          ...thread,
          lastMessage,
        };
      }),
    );

    return threadsWithMessages;
  }

  async markAsRead(messageId: string, userId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
  }
}

