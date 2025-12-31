import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuestProgressDto } from './dto/quest.dto';

// Quest target types
export const QUEST_TARGET_TYPES = {
  CATCH_POKEMON: 'catch_pokemon',
  WIN_BATTLES: 'win_battles',
  EVOLVE_PET: 'evolve_pet',
  COMPLETE_HUNTS: 'complete_hunts',
  FEED_PET: 'feed_pet',
  BUY_ITEM: 'buy_item',
  USE_ITEM: 'use_item',
  CATCH_RARITY: 'catch_rarity', // Catch X pokemon of specific rarity
  CATCH_SPECIES: 'catch_species', // Catch specific species
  LEVEL_UP_PET: 'level_up_pet',
} as const;

@Injectable()
export class QuestService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all daily quests for a user
   * Also checks if quests need to be reset (daily)
   */
  async getUserQuests(userId: string) {
    // Check if daily reset is needed
    await this.checkAndResetDailyQuests(userId);

    // Get user's active quests
    const userQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        status: { in: ['active', 'completed'] },
      },
      include: {
        quest: true,
      },
      orderBy: [
        { quest: { sortOrder: 'asc' } },
        { assignedAt: 'desc' },
      ],
    });

    return userQuests.map((uq) => ({
      id: uq.id,
      questId: uq.questId,
      name: uq.quest.name,
      description: uq.quest.description,
      type: uq.quest.type,
      category: uq.quest.category,
      targetType: uq.quest.targetType,
      targetCount: uq.quest.targetCount,
      targetSpecies: uq.quest.targetSpecies,
      targetRarity: uq.quest.targetRarity,
      progress: uq.progress,
      status: uq.status,
      difficulty: uq.quest.difficulty,
      rewards: {
        coins: uq.quest.rewardCoins,
        gems: uq.quest.rewardGems,
        xp: uq.quest.rewardXp,
        itemId: uq.quest.rewardItemId,
        itemQty: uq.quest.rewardItemQty,
      },
      expiresAt: uq.expiresAt,
      completedAt: uq.completedAt,
    }));
  }

  /**
   * Check if daily quests need to be reset and assign new ones
   */
  async checkAndResetDailyQuests(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastQuestReset: true },
    });

    if (!user) return;

    const now = new Date();
    const lastReset = new Date(user.lastQuestReset);
    
    // Check if it's a new day (reset at midnight UTC)
    const isNewDay =
      now.getUTCDate() !== lastReset.getUTCDate() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCFullYear() !== lastReset.getUTCFullYear();

    if (isNewDay) {
      await this.assignDailyQuests(userId);
    }
  }

  /**
   * Assign new daily quests to user
   */
  async assignDailyQuests(userId: string) {
    // Expire old daily quests
    await this.prisma.userQuest.updateMany({
      where: {
        userId,
        status: { in: ['active', 'completed'] },
        quest: { type: 'daily' },
      },
      data: {
        status: 'expired',
      },
    });

    // Get available daily quest templates
    const dailyTemplates = await this.prisma.questTemplate.findMany({
      where: {
        type: 'daily',
        isActive: true,
      },
    });

    if (dailyTemplates.length === 0) {
      console.warn('No daily quest templates found');
      return;
    }

    // Select 3 random daily quests (or all if less than 3)
    const selectedQuests = this.selectRandomQuests(dailyTemplates, 3);

    // Calculate expiry (end of day UTC)
    const now = new Date();
    const expiresAt = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    ));

    // Create user quest entries
    await this.prisma.userQuest.createMany({
      data: selectedQuests.map((quest) => ({
        userId,
        questId: quest.id,
        progress: 0,
        status: 'active',
        expiresAt,
      })),
    });

    // Update user's last quest reset time
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastQuestReset: now },
    });

    console.log(`Assigned ${selectedQuests.length} daily quests to user ${userId}`);
  }

  /**
   * Helper to select random quests from templates
   */
  private selectRandomQuests(templates: any[], count: number) {
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, templates.length));
  }

  /**
   * Update quest progress for a specific action
   * Called by other services (hunt, battle, pet) when actions occur
   */
  async updateProgress(userId: string, dto: UpdateQuestProgressDto) {
    const { targetType, amount = 1, species, rarity } = dto;

    // Find matching active quests
    const userQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        status: 'active',
        quest: {
          targetType,
          // Match species if specified
          OR: [
            { targetSpecies: null },
            { targetSpecies: species || null },
          ],
        },
      },
      include: {
        quest: true,
      },
    });

    // Filter by rarity if specified
    const matchingQuests = userQuests.filter((uq) => {
      if (uq.quest.targetRarity && rarity) {
        return uq.quest.targetRarity === rarity;
      }
      return !uq.quest.targetRarity; // Quest doesn't require specific rarity
    });

    // Update progress for each matching quest
    const updates: Promise<any>[] = [];
    for (const uq of matchingQuests) {
      const newProgress = Math.min(uq.progress + amount, uq.quest.targetCount);
      const isCompleted = newProgress >= uq.quest.targetCount;

      updates.push(
        this.prisma.userQuest.update({
          where: { id: uq.id },
          data: {
            progress: newProgress,
            status: isCompleted ? 'completed' : 'active',
            completedAt: isCompleted ? new Date() : null,
          },
        }),
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return { updatedCount: updates.length };
  }

  /**
   * Claim rewards for a completed quest
   */
  async claimQuest(userId: string, userQuestId: string) {
    // Find the user quest
    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        id: userQuestId,
        userId,
      },
      include: {
        quest: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest not found');
    }

    if (userQuest.status !== 'completed') {
      throw new BadRequestException('Quest is not completed yet');
    }

    // Get rewards
    const { rewardCoins, rewardGems, rewardXp, rewardItemId, rewardItemQty } = userQuest.quest;

    // Start transaction to give rewards
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user quest status
      await tx.userQuest.update({
        where: { id: userQuestId },
        data: {
          status: 'claimed',
          claimedAt: new Date(),
        },
      });

      // Give currency rewards
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
          gems: { increment: rewardGems },
          xp: { increment: rewardXp },
        },
      });

      // Give item reward if any
      let itemReward: { item: any; quantity: number } | null = null;
      if (rewardItemId && rewardItemQty) {
        const existingItem = await tx.userItem.findUnique({
          where: {
            userId_itemId: { userId, itemId: rewardItemId },
          },
        });

        if (existingItem) {
          await tx.userItem.update({
            where: {
              userId_itemId: { userId, itemId: rewardItemId },
            },
            data: {
              quantity: { increment: rewardItemQty },
            },
          });
        } else {
          await tx.userItem.create({
            data: {
              userId,
              itemId: rewardItemId,
              quantity: rewardItemQty,
            },
          });
        }

        const item = await tx.item.findUnique({
          where: { id: rewardItemId },
        });
        itemReward = { item, quantity: rewardItemQty };
      }

      return { updatedUser, itemReward };
    });

    return {
      message: 'Quest rewards claimed!',
      rewards: {
        coins: rewardCoins,
        gems: rewardGems,
        xp: rewardXp,
        item: result.itemReward,
      },
      user: {
        coins: result.updatedUser.coins,
        gems: result.updatedUser.gems,
        xp: result.updatedUser.xp,
      },
    };
  }

  /**
   * Get all available quest templates (for admin)
   */
  async getAllTemplates() {
    return this.prisma.questTemplate.findMany({
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /**
   * Create a new quest template (for seeding)
   */
  async createTemplate(data: {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    targetType: string;
    targetCount: number;
    targetSpecies?: string;
    targetRarity?: string;
    rewardCoins?: number;
    rewardGems?: number;
    rewardXp?: number;
    rewardItemId?: string;
    rewardItemQty?: number;
    difficulty?: string;
    sortOrder?: number;
  }) {
    return this.prisma.questTemplate.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
