import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { HuntService } from './hunt.service';
import { StartHuntDto } from './dto/start-hunt.dto';
import { CatchPetDto } from './dto/catch-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('hunt')
@UseGuards(JwtAuthGuard)
export class HuntController {
  constructor(private readonly huntService: HuntService) {}

  @Post('start')
  startSession(
    @CurrentUser('id') userId: string,
    @Body() startHuntDto: StartHuntDto,
  ) {
    return this.huntService.startSession(userId, startHuntDto.regionId);
  }

  @Get('session')
  getSession(@CurrentUser('id') userId: string) {
    return this.huntService.getSession(userId);
  }

  @Post('catch')
  attemptCatch(
    @CurrentUser('id') userId: string,
    @Body() catchPetDto: CatchPetDto,
  ) {
    return this.huntService.attemptCatch(
      userId,
      catchPetDto.sessionId,
      catchPetDto.encounterId,
      catchPetDto.ballType,
    );
  }

  @Post('flee/:sessionId')
  flee(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    return this.huntService.flee(userId, sessionId);
  }

  @Post('complete/:sessionId')
  completeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.huntService.completeSession(userId, sessionId);
  }
}
