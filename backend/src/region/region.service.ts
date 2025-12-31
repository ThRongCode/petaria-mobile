import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async listRegions(userLevel: number) {
    const regions = await this.prisma.region.findMany({
      orderBy: {
        unlockLevel: 'asc',
      },
      include: {
        spawns: {
          orderBy: {
            spawnRate: 'desc',
          },
        },
      },
    });

    return regions.map((region) => ({
      ...region,
      locked: region.unlockLevel > userLevel,
      // Get top featured spawns (highest spawn rate first, take top 4)
      featuredSpawns: region.spawns.slice(0, 4).map((spawn) => ({
        species: spawn.species,
        rarity: spawn.rarity,
        spawnRate: spawn.spawnRate,
      })),
      // Get rare spawns (uncommon, rare, epic, legendary)
      rareSpawns: region.spawns
        .filter((s) => ['rare', 'epic', 'legendary'].includes(s.rarity))
        .slice(0, 2)
        .map((spawn) => ({
          species: spawn.species,
          rarity: spawn.rarity,
          spawnRate: spawn.spawnRate,
        })),
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
    const spawns = await this.prisma.regionSpawn.findMany({
      where: { regionId },
      orderBy: {
        spawnRate: 'desc',
      },
    });

    return spawns;
  }
}
