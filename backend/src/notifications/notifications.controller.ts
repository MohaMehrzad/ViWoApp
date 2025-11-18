import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, RemoveTokenDto } from './dto/register-token.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(
    @GetUser('id') userId: string,
    @Body() registerTokenDto: RegisterTokenDto,
  ) {
    const result = await this.notificationsService.registerFCMToken(
      userId,
      registerTokenDto.token,
      registerTokenDto.deviceType,
    );
    return { success: true, result };
  }

  @Delete('remove-token')
  async removeToken(
    @GetUser('id') userId: string,
    @Body() removeTokenDto: RemoveTokenDto,
  ) {
    await this.notificationsService.removeFCMToken(userId, removeTokenDto.token);
    return { success: true };
  }
}

