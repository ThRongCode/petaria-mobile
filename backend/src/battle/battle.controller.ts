import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BattleService } from './battle.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { CompleteBattleDto } from './dto/complete-battle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('battle')
@UseGuards(JwtAuthGuard)
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get('opponents')
  listOpponents(@CurrentUser() user: any) {
    return this.battleService.listOpponents(user.level);
  }

  @Get('opponents/:id')
  getOpponent(@Param('id') id: string) {
    return this.battleService.getOpponent(id);
  }

  @Post('start')
  startBattle(
    @CurrentUser('id') userId: string,
    @Body() startBattleDto: StartBattleDto,
  ) {
    return this.battleService.startBattle(
      userId,
      startBattleDto.petId,
      startBattleDto.opponentId,
    );
  }

  @Post('complete')
  completeBattle(
    @CurrentUser('id') userId: string,
    @Body() completeBattleDto: CompleteBattleDto,
  ) {
    return this.battleService.completeBattle(
      userId,
      completeBattleDto.sessionId,
      completeBattleDto.won,
      completeBattleDto.damageDealt,
      completeBattleDto.damageTaken,
      completeBattleDto.finalHp,
    );
  }

  @Get('history')
  getBattleHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.battleService.getBattleHistory(
      userId,
      limit ? parseInt(limit) : 10,
    );
  }
}
