import { Module } from '@nestjs/common';
import { BuybackService } from './buyback.service';
import { BuybackController } from './buyback.controller';

@Module({
  controllers: [BuybackController],
  providers: [BuybackService],
  exports: [BuybackService],
})
export class BuybackModule {}

