import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketResetUtil } from '../utils/ticketReset';
import { UserStatsUtil } from '../utils/userStats';
import {
  getSpeciesBaseStats,
  generateRandomIVs,
  calculateFinalStat,
  getRarityMultiplier,
} from '../config/species-stats.config';
import { QuestService } from '../quest/quest.service';
import { ConfigLoaderService } from '../config/config-loader.service';

export interface Encounter {
  id: string;
  species: string;
  rarity: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  caught: boolean;
}

@Injectable()
export class HuntService {
  /** Hunt sessions expire based on game-constants.json */
  private get SESSION_EXPIRY_MS(): number {
    const loader = ConfigLoaderService.getInstance();
    const hours = loader?.getGameConstants()?.hunting?.sessionExpiryHours ?? 24;
    return hours * 60 * 60 * 1000;
  }

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => QuestService))
    private questService: QuestService,
  ) {}

  /**
   * Check if a hunt session has expired (older than 24 hours).
   * If expired, auto-cancels the session and refunds the ticket.
   * Returns true if the session was expired and cleaned up.
   */
  private async checkAndExpireSession(session: any): Promise<boolean> {
    const createdAt = new Date(session.createdAt).getTime();
    const now = Date.now();

    if (now - createdAt > this.SESSION_EXPIRY_MS) {
      // Delete the expired session
      await this.prisma.huntSession.delete({
        where: { id: session.id },
      });

      // Refund the hunt ticket
      await this.prisma.user.update({
        where: { id: session.userId },
        data: {
          huntTickets: { increment: 1 },
        },
      });

      return true;
    }

    return false;
  }

  /**
   * Update quest progress with error handling
   */
  private async updateQuestProgress(
    userId: string,
    targetType: string,
    amount: number = 1,
    species?: string,
    rarity?: string,
  ): Promise<void> {
    try {
      await this.questService.updateProgress(userId, { targetType, amount, species, rarity });
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  }

  async startSession(userId: string, regionId: string) {
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

    // Check if user has enough hunt tickets
    if (updatedUser.huntTickets < 1) {
      throw new BadRequestException(
        'Not enough hunt tickets (need 1, regenerates every 3h)',
      );
    }

    // Check pet limit before starting
    if (updatedUser.petCount >= 100) {
      throw new BadRequestException('Pet limit reached (100 max)');
    }

    // Check if region exists and is unlocked
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    if (region.unlockLevel > updatedUser.level) {
      throw new BadRequestException(
        `Region requires level ${region.unlockLevel}`,
      );
    }

    // Check for existing active session
    const existingSession = await this.prisma.huntSession.findFirst({
      where: {
        userId,
      },
    });

    if (existingSession) {
      // If the existing session has expired, auto-clean it
      const expired = await this.checkAndExpireSession(existingSession);
      if (!expired) {
        throw new BadRequestException(
          'You already have an active hunt session. Complete or cancel it first.',
        );
      }
      // If expired, it was cleaned up — we can proceed
    }

    // Get spawn data for region
    const spawns = await this.prisma.regionSpawn.findMany({
      where: { regionId },
    });

    if (spawns.length === 0) {
      throw new BadRequestException('No spawns available in this region');
    }

    // Initialize session data with move tracking
    const loader = ConfigLoaderService.getInstance();
    const gc = loader?.getGameConstants();
    const movesPerSession = gc?.hunting?.movesPerSession ?? 10;

    const sessionData = {
      encounters: [] as Encounter[],
      movesLeft: movesPerSession,
      regionSpawns: spawns.map((s) => ({
        species: s.species,
        rarity: s.rarity,
        minLevel: s.minLevel,
        maxLevel: s.maxLevel,
        spawnRate: s.spawnRate,
      })),
    };

    // Deduct hunt ticket
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        huntTickets: updatedUser.huntTickets - 1,
      },
    });

    // Create session (no expiration)
    const session = await this.prisma.huntSession.create({
      data: {
        userId,
        regionId,
        encountersData: sessionData as any,
      },
      include: {
        region: true,
      },
    });

    return {
      session,
      movesLeft: sessionData.movesLeft,
      encounters: [],
      message:
        'Hunt session started! Explore with 10 moves to find Pokemon.',
    };
  }

  async getSession(userId: string) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        userId,
      },
      include: {
        region: true,
      },
    });

    if (!session) {
      throw new NotFoundException('No active hunt session found');
    }

    // Check if session has expired (24h)
    const expired = await this.checkAndExpireSession(session);
    if (expired) {
      throw new NotFoundException('Hunt session expired (24h limit). Your ticket has been refunded.');
    }

    const sessionData = session.encountersData as any;
    const movesLeft = sessionData.movesLeft || 0;

    // Auto-complete session if no moves left
    if (movesLeft === 0) {
      console.log(`🏁 Auto-completing session ${session.id} (0 moves left)`);
      
      const encounters = sessionData.encounters || [];
      const caughtCount = encounters.filter((e: any) => e.caught).length;
      
      // Delete the session
      await this.prisma.huntSession.delete({
        where: { id: session.id },
      });

      // Update user stats
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          huntsCompleted: { increment: 1 },
        },
      });

      // Return as if no session exists, but with completion info
      throw new NotFoundException('No active hunt session found');
    }

    return {
      session,
      encounters: sessionData.encounters || [],
      movesLeft,
    };
  }

  async move(
    userId: string,
    sessionId: string,
    direction: 'up' | 'down' | 'left' | 'right',
  ) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        region: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found');
    }

    // Check if session has expired (24h)
    const expired = await this.checkAndExpireSession(session);
    if (expired) {
      throw new NotFoundException('Hunt session expired (24h limit). Your ticket has been refunded.');
    }

    const sessionData = session.encountersData as any;

    // Check if moves left
    if (sessionData.movesLeft <= 0) {
      throw new BadRequestException(
        'No moves left! Please complete the session.',
      );
    }

    // Random chance to encounter a Pokemon (from config)
    const encounterChance = Math.random();
    const loader2 = ConfigLoaderService.getInstance();
    const encounterThreshold = loader2?.getGameConstants()?.hunting?.encounterChance ?? 0.5;
    let newEncounter: Encounter | null = null;

    if (encounterChance < encounterThreshold && sessionData.regionSpawns?.length > 0) {
      // Generate new encounter
      newEncounter = this.generateEncounterFromSpawns(
        sessionData.regionSpawns,
      );
      sessionData.encounters.push(newEncounter);
    }

    // Decrease moves
    sessionData.movesLeft -= 1;

    // Update session
    await this.prisma.huntSession.update({
      where: { id: sessionId },
      data: {
        encountersData: sessionData as any,
      },
    });

    return {
      direction,
      movesLeft: sessionData.movesLeft,
      encounter: newEncounter,
      message: newEncounter
        ? `Wild ${newEncounter.species} appeared!`
        : 'Nothing here... keep exploring!',
    };
  }

  private generateEncounterFromSpawns(spawns: any[]): Encounter {
    // Calculate total spawn rate
    const totalRate = spawns.reduce((sum: number, s: any) => sum + s.spawnRate, 0);

    // Pick a random spawn based on rates
    let random = Math.random() * totalRate;
    let selectedSpawn = spawns[0];

    for (const spawn of spawns) {
      random -= spawn.spawnRate;
      if (random <= 0) {
        selectedSpawn = spawn;
        break;
      }
    }

    // Generate level within min/max range
    const level =
      Math.floor(
        Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1),
      ) + selectedSpawn.minLevel;

    // Get species base stats and rarity multiplier
    const baseStats = getSpeciesBaseStats(selectedSpawn.species);
    const rarityMult = getRarityMultiplier(selectedSpawn.rarity);

    // Calculate encounter stats (using average IVs for display, actual IVs generated on capture)
    const avgIV = 7; // Middle of 0-15 range for encounter display
    const hp = calculateFinalStat(baseStats.hp, avgIV, level, rarityMult);
    const attack = calculateFinalStat(baseStats.attack, avgIV, level, rarityMult);
    const defense = calculateFinalStat(baseStats.defense, avgIV, level, rarityMult);
    const speed = calculateFinalStat(baseStats.speed, avgIV, level, rarityMult);

    return {
      id: `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      species: selectedSpawn.species,
      rarity: selectedSpawn.rarity,
      level,
      hp,
      maxHp: hp,
      attack,
      defense,
      speed,
      caught: false,
    };
  }

  async attemptCatch(
    userId: string,
    sessionId: string,
    encounterId: string,
    ballType: string = 'pokeball',
  ) {
    // Check if user has pokeballs (only regular pokeballs for now)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pokeballs: true },
    });

    if (!user || user.pokeballs < 1) {
      throw new BadRequestException(`You don't have any pokeballs`);
    }

    // Deduct pokeball BEFORE catch attempt
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pokeballs: { decrement: 1 },
      },
    });

    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found');
    }

    // Check if session has expired (24h)
    const catchExpired = await this.checkAndExpireSession(session);
    if (catchExpired) {
      throw new NotFoundException('Hunt session expired (24h limit). Your ticket has been refunded.');
    }

    const sessionData = session.encountersData as any;
    const encounters = sessionData.encounters || [];
    const encounter = encounters.find((e: Encounter) => e.id === encounterId);

    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    if (encounter.caught) {
      throw new BadRequestException('This pet has already been caught');
    }

    // Calculate catch rate based on ball type and rarity (from config)
    const configLoader = ConfigLoaderService.getInstance();
    const gcCatch = configLoader?.getGameConstants()?.catching;
    const ballRates: Record<string, number> = gcCatch?.ballRates ?? {
      'pokeball': 0.4,
      'great-ball': 0.6,
      'ultra-ball': 0.8,
    };

    const rarityModifiers: Record<string, number> = gcCatch?.rarityModifiers ?? {
      common: 1.2,
      uncommon: 1.0,
      rare: 0.7,
      epic: 0.5,
      legendary: 0.3,
    };

    const rarityModifier = rarityModifiers[encounter.rarity.toLowerCase()] || 1.0;
    const catchRate = (ballRates[ballType] || ballRates['pokeball'] || 0.4) * rarityModifier;
    const success = Math.random() < catchRate;

    if (success) {
      // Check pet limit before creating
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.petCount >= 100) {
        throw new BadRequestException('Pet limit reached (100 max)');
      }

      // Generate random IVs for this capture
      const ivs = generateRandomIVs();
      
      // Get species base stats and calculate final stats with IVs
      const baseStats = getSpeciesBaseStats(encounter.species);
      const rarityMult = getRarityMultiplier(encounter.rarity);
      
      const finalHp = calculateFinalStat(baseStats.hp, ivs.ivHp, encounter.level, rarityMult);
      const finalAttack = calculateFinalStat(baseStats.attack, ivs.ivAttack, encounter.level, rarityMult);
      const finalDefense = calculateFinalStat(baseStats.defense, ivs.ivDefense, encounter.level, rarityMult);
      const finalSpeed = calculateFinalStat(baseStats.speed, ivs.ivSpeed, encounter.level, rarityMult);

      // Create pet with IVs and calculated stats
      const pet = await this.prisma.pet.create({
        data: {
          ownerId: userId,
          species: encounter.species,
          nickname: encounter.species,
          rarity: encounter.rarity,
          level: encounter.level,
          xp: 0,
          hp: finalHp,
          maxHp: finalHp,
          attack: finalAttack,
          defense: finalDefense,
          speed: finalSpeed,
          ivHp: ivs.ivHp,
          ivAttack: ivs.ivAttack,
          ivDefense: ivs.ivDefense,
          ivSpeed: ivs.ivSpeed,
        },
      });

      // Increment petCount
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          petCount: { increment: 1 },
        },
      });

      // Mark encounter as caught
      encounter.caught = true;
      sessionData.encounters = encounters;
      await this.prisma.huntSession.update({
        where: { id: sessionId },
        data: {
          encountersData: sessionData as any,
        },
      });

      // Update quest progress for catching Pokemon
      await this.updateQuestProgress(userId, 'catch_pokemon', 1, encounter.species, encounter.rarity);

      return {
        success: true,
        message: `Congratulations! You caught ${encounter.species}!`,
        pet,
      };
    }

    return {
      success: false,
      message: `${encounter.species} broke free!`,
    };
  }

  async flee(userId: string, sessionId: string) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found');
    }

    await this.prisma.huntSession.delete({
      where: { id: sessionId },
    });

    return {
      message: 'You fled from the hunt.',
    };
  }

  async cancelSession(userId: string, sessionId: string) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found');
    }

    await this.prisma.huntSession.delete({
      where: { id: sessionId },
    });

    return {
      message: 'Hunt session canceled.',
    };
  }

  async completeSession(userId: string, sessionId: string) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        region: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found');
    }

    // encountersData is an object with { encounters: [], movesLeft: number, regionSpawns: [] }
    const sessionData = session.encountersData as any;
    const encounters = sessionData.encounters || [];
    const petsCaught = encounters.filter((e: any) => e.caught).length;

    // Calculate XP reward based on region difficulty and catches
    // Base: 20 XP per hunt + 10 XP per encounter + 25 XP per catch
    const baseXp = 20;
    const encounterXp = encounters.length * 10;
    const catchXp = petsCaught * 25;
    const totalXpReward = baseXp + encounterXp + catchXp;

    // Get current user for level up check
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Calculate new XP and check for level up
    const newXp = currentUser.xp + totalXpReward;
    const levelUpResult = UserStatsUtil.checkLevelUp(newXp, currentUser.level);

    // Save to hunt history
    await this.prisma.hunt.create({
      data: {
        userId,
        regionId: session.regionId,
        petsCaught,
      },
    });

    // Update user stats with XP and potential level up
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        huntsCompleted: { increment: 1 },
        xp: levelUpResult.remainingXp,
        level: levelUpResult.newLevel,
      },
    });

    // Delete session
    await this.prisma.huntSession.delete({
      where: { id: sessionId },
    });

    // Update quest progress for completing hunts
    await this.updateQuestProgress(userId, 'complete_hunts', 1);

    return {
      message: levelUpResult.leveledUp 
        ? `Hunt completed! You leveled up to ${levelUpResult.newLevel}!`
        : 'Hunt completed!',
      region: session.region.name,
      petsCaught,
      totalEncounters: encounters.length,
      xpEarned: totalXpReward,
      user: {
        level: updatedUser.level,
        xp: updatedUser.xp,
        leveledUp: levelUpResult.leveledUp,
      },
    };
  }
}
