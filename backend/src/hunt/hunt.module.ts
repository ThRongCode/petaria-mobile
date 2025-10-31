import { Module } from '@nestjs/common';
import { HuntService } from './hunt.service';
import { HuntController } from './hunt.controller';

@Module({
  controllers: [HuntController],
  providers: [HuntService],
  exports: [HuntService],
})
export class HuntModule {}
