import { Module } from '@nestjs/common';
import { AntiBotService } from './anti-bot.service';
import { AntiBotController } from './anti-bot.controller';

@Module({
  controllers: [AntiBotController],
  providers: [AntiBotService],
  exports: [AntiBotService],
})
export class AntiBotModule {}

