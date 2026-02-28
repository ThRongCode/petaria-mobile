import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameConfigService } from './game-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('config')
export class GameConfigController {
  constructor(private readonly gameConfigService: GameConfigService) {}

  @Get('game')
  @UseGuards(JwtAuthGuard)
  getGameConfig() {
    return this.gameConfigService.getGameConfig();
  }

  @Get('species')
  @UseGuards(JwtAuthGuard)
  getSpeciesTypes() {
    return this.gameConfigService.getSpeciesTypes();
  }
}
