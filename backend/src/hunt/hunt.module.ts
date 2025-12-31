import { Module, forwardRef } from '@nestjs/common';
import { HuntService } from './hunt.service';
import { HuntController } from './hunt.controller';
import { QuestModule } from '../quest/quest.module';

@Module({
  imports: [forwardRef(() => QuestModule)],
  controllers: [HuntController],
  providers: [HuntService],
  exports: [HuntService],
})
export class HuntModule {}
