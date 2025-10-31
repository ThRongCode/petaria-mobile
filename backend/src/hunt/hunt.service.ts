import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    // Check if user has enough energy
    if (user.energy < 10) {
      throw new BadRequestException('Not enough energy (need 10)');
    }

    // Check if user has enough coins
    const huntCost = 50;
    if (user.coins < huntCost) {
      throw new BadRequestException(`Not enough coins (need ${huntCost})`);
    }

    // Check if region exists and is unlocked
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    if (region.unlockLevel > user.level) {
      throw new BadRequestException(
        `Region requires level ${region.unlockLevel}`,
      );
    }

    // Check for existing active session
    const existingSession = await this.prisma.huntSession.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingSession) {
      throw new BadRequestException(
        'You already have an active hunt session',
      );
    }

    // Get spawn data for region
    const spawns = await this.prisma.regionSpawn.findMany({
      where: { regionId },
    });

    if (spawns.length === 0) {
      throw new BadRequestException('No spawns available in this region');
    }

    // Generate 3 encounters based on spawn rates
    const encounters: Encounter[] = [];
    for (let i = 0; i < 3; i++) {
      const encounter = this.generateEncounter(spawns);
      encounters.push(encounter);
    }

    // Deduct energy and coins
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        energy: user.energy - 10,
        coins: user.coins - huntCost,
      },
    });

    // Create session (expires in 30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const session = await this.prisma.huntSession.create({
      data: {
        userId,
        regionId,
        encountersData: encounters as any,
        expiresAt,
      },
      include: {
        region: true,
      },
    });

    return {
      session,
      encounters,
      message: 'Hunt session started! You have 30 minutes to complete it.',
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
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        region: true,
      },
    });

    if (!session) {
      throw new NotFoundException('No active hunt session found');
    }

    return {
      session,
      encounters: session.encountersData as unknown as Encounter[],
    };
  }

  async attemptCatch(
    userId: string,
    sessionId: string,
    encounterId: string,
    ballType: string = 'pokeball',
  ) {
    const session = await this.prisma.huntSession.findFirst({
      where: {
        id: sessionId,
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found or expired');
    }

    const encounters = session.encountersData as unknown as Encounter[];
    const encounter = encounters.find((e) => e.id === encounterId);

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

      // Mark encounter as caught
      encounter.caught = true;
      await this.prisma.huntSession.update({
        where: { id: sessionId },
        data: {
          encountersData: encounters as any,
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
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Hunt session not found or expired');
    }

    await this.prisma.huntSession.delete({
      where: { id: sessionId },
    });

    return {
      message: 'You fled from the hunt.',
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

    const encounters = session.encountersData as unknown as Encounter[];
    const petsCaught = encounters.filter((e) => e.caught).length;

    // Save to hunt history
    await this.prisma.hunt.create({
      data: {
        userId,
        regionId: session.regionId,
        petsCaught,
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
