import { Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quest')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  getQuests(@CurrentUser('id') userId: string) {
    return this.questService.getUserQuests(userId);
  }

  @Post(':id/claim')
  claimQuest(@CurrentUser('id') userId: string, @Param('id') userQuestId: string) {
    return this.questService.claimQuest(userId, userQuestId);
  }

  @Post('refresh')
  async refreshQuests(@CurrentUser('id') userId: string) {
    await this.questService.assignDailyQuests(userId);
    return this.questService.getUserQuests(userId);
  }
}
