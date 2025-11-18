import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { MessagesService } from './messages.service';
import { CreateThreadDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  async getThreads(@GetUser('id') userId: string) {
    const threads = await this.messagesService.getUserThreads(userId);
    return { success: true, threads };
  }

  @Post('threads')
  async createThread(
    @GetUser('id') userId: string,
    @Body() body: CreateThreadDto,
  ) {
    const thread = await this.messagesService.createThread([
      userId,
      ...body.participantIds,
    ]);
    return { success: true, thread };
  }

  @Get('threads/:threadId')
  async getThreadMessages(
    @Param('threadId') threadId: string,
    @Query('page') page: string,
  ) {
    const messages = await this.messagesService.getThreadMessages(
      threadId,
      parseInt(page) || 1,
    );
    return { success: true, messages };
  }
}

