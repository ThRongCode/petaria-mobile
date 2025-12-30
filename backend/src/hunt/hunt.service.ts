import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketResetUtil } from '../utils/ticketReset';

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
  constructor(private prisma: PrismaService) {}

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
        'Not enough hunt tickets (need 1, resets daily)',
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
      throw new BadRequestException(
        'You already have an active hunt session. Complete or cancel it first.',
      );
    }

    // Get spawn data for region
    const spawns = await this.prisma.regionSpawn.findMany({
      where: { regionId },
    });

    if (spawns.length === 0) {
      throw new BadRequestException('No spawns available in this region');
    }

    // Initialize session data with move tracking
    const sessionData = {
      encounters: [] as Encounter[],
      movesLeft: 10, // 10 moves per session
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

  private generateEncounter(spawns: any[]): Encounter {
    // Calculate total spawn rate
    const totalRate = spawns.reduce((sum, s) => sum + s.spawnRate, 0);

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

    // Generate stats based on level and rarity
    const rarityMultiplier = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.5,
      epic: 1.8,
      legendary: 2.0,
    }[selectedSpawn.rarity.toLowerCase()] || 1.0;

    const baseHp = 20 + level * 5;
    const baseAttack = 5 + level * 2;
    const baseDefense = 5 + level * 2;
    const baseSpeed = 5 + level * 2;

    return {
      id: `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      species: selectedSpawn.species,
      rarity: selectedSpawn.rarity,
      level,
      hp: Math.floor(baseHp * rarityMultiplier),
      maxHp: Math.floor(baseHp * rarityMultiplier),
      attack: Math.floor(baseAttack * rarityMultiplier),
      defense: Math.floor(baseDefense * rarityMultiplier),
      speed: Math.floor(baseSpeed * rarityMultiplier),
      caught: false,
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

    const sessionData = session.encountersData as any;

    // Check if moves left
    if (sessionData.movesLeft <= 0) {
      throw new BadRequestException(
        'No moves left! Please complete the session.',
      );
    }

    // Random chance to encounter a Pokemon (50% chance)
    const encounterChance = Math.random();
    let newEncounter: Encounter | null = null;

    if (encounterChance < 0.5 && sessionData.regionSpawns?.length > 0) {
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

    // Generate stats based on level and rarity
    const rarityMultiplier = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.5,
      epic: 1.8,
      legendary: 2.0,
    }[selectedSpawn.rarity.toLowerCase()] || 1.0;

    const baseHp = 20 + level * 5;
    const baseAttack = 5 + level * 2;
    const baseDefense = 5 + level * 2;
    const baseSpeed = 5 + level * 2;

    return {
      id: `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      species: selectedSpawn.species,
      rarity: selectedSpawn.rarity,
      level,
      hp: Math.floor(baseHp * rarityMultiplier),
      maxHp: Math.floor(baseHp * rarityMultiplier),
      attack: Math.floor(baseAttack * rarityMultiplier),
      defense: Math.floor(baseDefense * rarityMultiplier),
      speed: Math.floor(baseSpeed * rarityMultiplier),
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

    const sessionData = session.encountersData as any;
    const encounters = sessionData.encounters || [];
    const encounter = encounters.find((e: Encounter) => e.id === encounterId);

    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    if (encounter.caught) {
      throw new BadRequestException('This pet has already been caught');
    }

    // Calculate catch rate based on ball type and rarity
    const ballRates = {
      pokeball: 0.4,
      greatball: 0.6,
      ultraball: 0.8,
    };

    const rarityModifier = {
      common: 1.2,
      uncommon: 1.0,
      rare: 0.7,
      epic: 0.5,
      legendary: 0.3,
    }[encounter.rarity.toLowerCase()] || 1.0;

    const catchRate = (ballRates[ballType] || 0.4) * rarityModifier;
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

      // Create pet
      const pet = await this.prisma.pet.create({
        data: {
          ownerId: userId,
          species: encounter.species,
          nickname: encounter.species,
          rarity: encounter.rarity,
          level: encounter.level,
          xp: 0,
          hp: encounter.maxHp,
          maxHp: encounter.maxHp,
          attack: encounter.attack,
          defense: encounter.defense,
          speed: encounter.speed,
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

    // Save to hunt history
    await this.prisma.hunt.create({
      data: {
        userId,
        regionId: session.regionId,
        petsCaught,
      },
    });

    // Update user stats
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        huntsCompleted: { increment: 1 },
      },
    });

    // Delete session
    await this.prisma.huntSession.delete({
      where: { id: sessionId },
    });

    return {
      message: 'Hunt completed!',
      region: session.region.name,
      petsCaught,
      totalEncounters: encounters.length,
    };
  }
}
