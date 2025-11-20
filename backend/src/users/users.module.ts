import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    PostsModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

