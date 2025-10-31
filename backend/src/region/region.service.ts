import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async listRegions(userLevel: number) {
    return this.prisma.region.findMany({
      where: {
        unlockLevel: {
          lte: userLevel,
        },
      },
      orderBy: {
        unlockLevel: 'asc',
      },
    });
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
