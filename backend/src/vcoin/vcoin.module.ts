import { Module } from '@nestjs/common';
import { VCoinService } from './vcoin.service';
import { VCoinController } from './vcoin.controller';

@Module({
  controllers: [VCoinController],
  providers: [VCoinService],
  exports: [VCoinService],
})
export class VCoinModule {}

