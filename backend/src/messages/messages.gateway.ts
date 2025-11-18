import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private messagesService: MessagesService) {}

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

