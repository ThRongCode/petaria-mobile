import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BattleService } from './battle.service';
import { StartBattleDto } from './dto/start-battle.dto';
import { CompleteBattleDto } from './dto/complete-battle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('battle')
@UseGuards(JwtAuthGuard)
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Get('types')
  getBattleTypes() {
    return this.battleService.getBattleTypes();
  }

  @Get('opponents')
  listOpponents(@CurrentUser('level') userLevel: number) {
    return this.battleService.listOpponents(userLevel);
  }

  @Get('opponents/:id')
  getOpponent(@Param('id') id: string) {
    return this.battleService.getOpponent(id);
  }

  @Post('start')
  startBattle(@CurrentUser('id') userId: string, @Body() dto: StartBattleDto) {
    return this.battleService.startBattle(userId, dto.petId, dto.opponentId);
  }

  @Post('complete')
  completeBattle(@CurrentUser('id') userId: string, @Body() dto: CompleteBattleDto) {
    return this.battleService.completeBattle(
      userId,
      dto.sessionId,
      dto.won,
      dto.damageDealt,
      dto.damageTaken,
      dto.finalHp,
    );
  }

  @Get('history')
  getBattleHistory(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    return this.battleService.getBattleHistory(userId, limit ? parseInt(limit, 10) : 10);
  }
}
