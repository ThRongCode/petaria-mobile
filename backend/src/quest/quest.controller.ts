import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quest')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  /**
   * GET /quest
   * Get all daily quests for the current user
   */
  @Get()
  async getQuests(@CurrentUser() user: any) {
    return this.questService.getUserQuests(user.id);
  }

  /**
   * POST /quest/:id/claim
   * Claim rewards for a completed quest
   */
  @Post(':id/claim')
  async claimQuest(
    @CurrentUser() user: any,
    @Param('id') userQuestId: string,
  ) {
    return this.questService.claimQuest(user.id, userQuestId);
  }

  /**
   * POST /quest/refresh
   * Force refresh daily quests (mainly for testing)
   */
  @Post('refresh')
  async refreshQuests(@CurrentUser() user: any) {
    await this.questService.assignDailyQuests(user.id);
    return this.questService.getUserQuests(user.id);
  }
}
