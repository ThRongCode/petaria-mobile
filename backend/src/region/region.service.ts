import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const RARE_RARITIES = ['rare', 'epic', 'legendary'];

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  private formatSpawn(spawn: { species: string; rarity: string; spawnRate: number }) {
    return {
      species: spawn.species,
      rarity: spawn.rarity,
      spawnRate: spawn.spawnRate,
    };
  }

  async listRegions(userLevel: number) {
    const regions = await this.prisma.region.findMany({
      orderBy: { unlockLevel: 'asc' },
      include: {
        spawns: { orderBy: { spawnRate: 'desc' } },
      },
    });

    return regions.map((region) => ({
      ...region,
      locked: region.unlockLevel > userLevel,
      featuredSpawns: region.spawns.slice(0, 4).map(this.formatSpawn),
      rareSpawns: region.spawns
        .filter((s) => RARE_RARITIES.includes(s.rarity))
        .slice(0, 2)
        .map(this.formatSpawn),
    }));
  }

  async getRegionDetails(id: string, userLevel: number) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        spawns: true,
      },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    if (region.unlockLevel > userLevel) {
      return {
        ...region,
        locked: true,
        message: `Reach level ${region.unlockLevel} to unlock this region`,
      };
    }

    return {
      ...region,
      locked: false,
    };
  }

  async getSpawns(regionId: string) {
    return this.prisma.regionSpawn.findMany({
      where: { regionId },
      orderBy: { spawnRate: 'desc' },
    });
  }
}
