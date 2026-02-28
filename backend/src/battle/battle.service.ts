import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketResetUtil } from '../utils/ticketReset';
import { PetStatsUtil } from '../utils/petStats';
import { UserStatsUtil } from '../utils/userStats';
import { QuestService } from '../quest/quest.service';

@Injectable()
export class BattleService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => QuestService))
    private questService: QuestService,
  ) {}

  /**
   * Get available battle types
   */
  getBattleTypes() {
    return [
      {
        id: 'event',
        name: '⚡ Event Battle',
        description: 'Limited time event with exclusive rewards! Weekly rotating challenges.',
        icon: 'trophy',
        gradient: ['#FFD700', '#FFA500'],
        rewards: ['Rare Pokemon', 'Premium Items', 'Event Coins'],
        available: true,
      },
      {
        id: 'exp',
        name: '📚 EXP Battle',
        description: 'Train your Pokemon and gain massive experience points!',
        icon: 'trending-up',
        gradient: ['#9C27B0', '#5E35B1'],
        rewards: ['High EXP', 'Rare Candy', 'Training Items'],
        available: true,
      },
      {
        id: 'material',
        name: '💎 Material Battle',
        description: 'Farm materials, gold, and evolution stones!',
        icon: 'diamond',
        gradient: ['#2196F3', '#1976D2'],
        rewards: ['Gold', 'Evolution Stones', 'Stat Boosters'],
        available: true,
      },
    ];
  }

  /**
   * Update quest progress with error handling
   */
  private async updateQuestProgress(userId: string, targetType: string, amount: number = 1): Promise<void> {
    try {
      await this.questService.updateProgress(userId, { targetType, amount });
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  }

  async listOpponents(userLevel: number) {
    return this.prisma.opponent.findMany({
      where: {
        unlockLevel: {
          lte: userLevel,
        },
      },
      include: {
        moves: {
          include: {
            move: true,
          },
        },
      },
      orderBy: {
        level: 'asc',
      },
    });
  }

  async getOpponent(id: string) {
    const opponent = await this.prisma.opponent.findUnique({
      where: { id },
      include: {
        moves: {
          include: {
            move: true,
          },
        },
      },
    });

    if (!opponent) {
      throw new NotFoundException('Opponent not found');
    }

    return opponent;
  }

  async startBattle(userId: string, petId: string, opponentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check and reset tickets if needed
    await TicketResetUtil.checkAndResetTickets(this.prisma, userId);

    // Refresh user data after potential ticket reset
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after ticket reset');
    }

    // Check if user has enough battle tickets
    if (updatedUser.battleTickets < 1) {
      throw new BadRequestException(
        'Not enough battle tickets (need 1, resets daily)',
      );
    }

    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: userId,
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.hp <= 0) {
      throw new BadRequestException('Pet has no HP left');
    }

    const opponent = await this.getOpponent(opponentId);

    if (opponent.unlockLevel > updatedUser.level) {
      throw new BadRequestException(
        `Opponent requires level ${opponent.unlockLevel}`,
      );
    }

    // Deduct battle ticket
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        battleTickets: updatedUser.battleTickets - 1,
      },
    });

    // Create battle session
    const session = await this.prisma.battleSession.create({
      data: {
        userId,
        petId,
        opponentId,
        battleType: 'exp',
      },
      include: {
        opponent: {
          include: {
            moves: {
              include: {
                move: true,
              },
            },
          },
        },
      },
    });

    return {
      session,
      pet,
      opponent: session.opponent,
      message: 'Battle started!',
    };
  }

  async completeBattle(
    userId: string,
    sessionId: string,
    won: boolean,
    damageDealt: number,
    damageTaken: number,
    finalHp: number,
  ) {
    const session = await this.prisma.battleSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Battle session not found');
    }

    // Get opponent, pet, and user details
    const opponent = await this.prisma.opponent.findUnique({
      where: { id: session.opponentId },
    });

    const pet = await this.prisma.pet.findUnique({
      where: { id: session.petId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!opponent || !pet || !user) {
      throw new NotFoundException('Required data not found');
    }

    // Basic validation to prevent cheating
    const maxPossibleDamage = pet.attack * 10; // Simplified check
    if (damageDealt > maxPossibleDamage * 2) {
      throw new BadRequestException('Invalid damage values');
    }

    // Calculate rewards
    let xpReward = 0;
    let coinReward = 0;

    if (won) {
      xpReward = opponent.rewardXp;
      coinReward = opponent.rewardCoins;
    } else {
      // Give partial rewards even on loss
      xpReward = Math.floor(opponent.rewardXp * 0.3);
      coinReward = Math.floor(opponent.rewardCoins * 0.3);
    }

    // Use finalHp from frontend (accurate after battle)
    const newHp = finalHp;
    let leveledUp = false;
    let newLevel = pet.level;
    let statChanges = {};

    // Add XP and check for level up
    const newXp = pet.xp + xpReward;
    const xpForNextLevel = PetStatsUtil.calculateXpForNextLevel(pet.level);

    if (newXp >= xpForNextLevel) {
      newLevel = pet.level + 1;
      leveledUp = true;

      // Recalculate stats using deterministic formula (based on species, IVs, level)
      const newStats = PetStatsUtil.calculateStats(
        pet.species,
        newLevel,
        pet.rarity,
        {
          ivHp: pet.ivHp,
          ivAttack: pet.ivAttack,
          ivDefense: pet.ivDefense,
          ivSpeed: pet.ivSpeed,
        },
      );

      statChanges = {
        maxHp: newStats.maxHp,
        attack: newStats.attack,
        defense: newStats.defense,
        speed: newStats.speed,
      };

      await this.prisma.pet.update({
        where: { id: pet.id },
        data: {
          level: newLevel,
          xp: newXp - xpForNextLevel,
          hp: Math.min(newHp, newStats.maxHp), // Heal to new max if increased
          maxHp: newStats.maxHp,
          attack: newStats.attack,
          defense: newStats.defense,
          speed: newStats.speed,
        },
      });
    } else {
      await this.prisma.pet.update({
        where: { id: pet.id },
        data: {
          xp: newXp,
          hp: newHp,
        },
      });
    }

    // Update user coins and level
    const userNewXp = user.xp + xpReward;
    const userLevelUpResult = UserStatsUtil.checkLevelUp(userNewXp, user.level);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        level: userLevelUpResult.newLevel,
        xp: userLevelUpResult.remainingXp,
        coins: { increment: coinReward },
        battlesWon: won ? { increment: 1 } : undefined,
      },
    });

    // Save battle history
    await this.prisma.battle.create({
      data: {
        userId,
        petId: pet.id,
        opponentId: opponent.id,
        battleType: 'exp',
        result: won ? 'victory' : 'defeat',
        xpEarned: xpReward,
        coinsEarned: coinReward,
      },
    });

    // Delete battle session
    await this.prisma.battleSession.delete({
      where: { id: sessionId },
    });

    // Update quest progress for winning battles
    if (won) {
      await this.updateQuestProgress(userId, 'win_battles', 1);
    }

    return {
      won,
      xpReward,
      coinReward,
      pet: {
        leveledUp,
        newLevel,
        currentHp: newHp,
        statChanges: leveledUp ? statChanges : undefined,
      },
      user: {
        leveledUp: userLevelUpResult.leveledUp,
        newLevel: userLevelUpResult.newLevel,
      },
      message: won
        ? `Victory! You earned ${xpReward} XP and ${coinReward} coins!`
        : `Defeat! You earned ${xpReward} XP and ${coinReward} coins for trying.`,
    };
  }

  async getBattleHistory(userId: string, limit: number = 10) {
    return this.prisma.battle.findMany({
      where: { userId },
      include: {
        opponent: true,
        pet: {
          select: {
            species: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
