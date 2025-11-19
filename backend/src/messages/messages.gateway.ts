import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private configService: ConfigService,
  ) {}

  async afterInit(server: Server) {
    // Set up Redis adapter for horizontal scaling
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');

    try {
      const pubClient = createClient({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        password: redisPassword || undefined,
      });
      
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      server.adapter(createAdapter(pubClient, subClient));
      
      console.log('✅ WebSocket Redis adapter configured');
    } catch (error) {
      console.error('❌ WebSocket Redis adapter failed:', error.message);
      console.log('⚠️  WebSocket will run in single-instance mode');
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract userId from JWT in handshake
    const userId = this.extractUserIdFromSocket(client);
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove from userSockets
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { threadId: string; content: string; mediaUrl?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserIdFromSocket(client);
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const message = await this.messagesService.createMessage(
      userId,
      data.threadId,
      data.content,
      data.mediaUrl,
    );

    // Emit to all participants in thread
    this.server.to(`thread:${data.threadId}`).emit('new_message', message);

    return { success: true, message };
  }

  @SubscribeMessage('join_thread')
  handleJoinThread(
    @MessageBody() data: { threadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`thread:${data.threadId}`);
    return { success: true };
  }

  @SubscribeMessage('leave_thread')
  handleLeaveThread(
    @MessageBody() data: { threadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`thread:${data.threadId}`);
    return { success: true };
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { threadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserIdFromSocket(client);
    client.to(`thread:${data.threadId}`).emit('user_typing', { userId });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { threadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserIdFromSocket(client);
    client.to(`thread:${data.threadId}`).emit('user_stopped_typing', { userId });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.extractUserIdFromSocket(client);
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await this.messagesService.markAsRead(data.messageId, userId);
    return { success: true };
  }

  private extractUserIdFromSocket(client: Socket): string | null {
    // Extract from JWT token in handshake auth
    const token = client.handshake.auth.token;
    // TODO: Decode JWT and extract userId
    // For now, return userId from query params if available
    return (client.handshake.query.userId as string) || null;
  }

  // Helper method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}

