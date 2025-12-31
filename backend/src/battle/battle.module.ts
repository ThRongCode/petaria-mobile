import { Module, forwardRef } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { QuestModule } from '../quest/quest.module';

@Module({
  imports: [forwardRef(() => QuestModule)],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
