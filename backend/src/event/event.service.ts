import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Event types
export const EVENT_TYPES = {
  HUNT_BOOST: 'hunt_boost', // Increased spawn rates
  RARE_SPAWN: 'rare_spawn', // Special rare pokemon available
  DOUBLE_XP: 'double_xp', // Double XP from all sources
  SPECIAL_HUNT: 'special_hunt', // Special hunt region with unique spawns
  SHINY_CHANCE: 'shiny_chance', // Increased shiny chance
} as const;

export interface EventConfig {
  spawnBonus?: number; // e.g., 0.5 = 50% bonus spawn rate
  xpMultiplier?: number; // e.g., 2 = double XP
  featuredSpecies?: string[]; // List of featured pokemon
  guaranteedEncounter?: string; // Species guaranteed on first encounter
}

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all currently active events
   */
  async getActiveEvents() {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        eventSpawns: true,
      },
      orderBy: { priority: 'desc' },
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      timeRemaining: this.getTimeRemaining(event.endTime),
      regionId: event.regionId,
      bannerUrl: event.bannerUrl,
      config: event.config as EventConfig,
      spawns: event.eventSpawns.map((spawn) => ({
        species: spawn.species,
        rarity: spawn.rarity,
        spawnRate: spawn.spawnRate,
        minLevel: spawn.minLevel,
        maxLevel: spawn.maxLevel,
        isGuaranteed: spawn.isGuaranteed,
      })),
    }));
  }

  /**
   * Get event spawn rates for a region (to override normal spawns)
   */
  async getEventSpawnsForRegion(regionId: string) {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
        OR: [
          { regionId }, // Region-specific events
          { regionId: null }, // Global events
        ],
      },
      include: {
        eventSpawns: true,
      },
    });

    if (events.length === 0) {
      return null;
    }

    // Merge all event spawns
    const eventSpawns = events.flatMap((event) =>
      event.eventSpawns.map((spawn) => ({
        ...spawn,
        eventName: event.name,
        eventType: event.type,
      })),
    );

    // Get XP multiplier (take highest if multiple events)
    const xpMultiplier = Math.max(
      ...events.map((e) => (e.config as EventConfig)?.xpMultiplier || 1),
    );

    // Get spawn bonus (take highest)
    const spawnBonus = Math.max(
      ...events.map((e) => (e.config as EventConfig)?.spawnBonus || 0),
    );

    return {
      eventSpawns,
      xpMultiplier,
      spawnBonus,
      activeEvents: events.map((e) => e.name),
    };
  }

  /**
   * Calculate time remaining string
   */
  private getTimeRemaining(endTime: Date): string {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  }

  /**
   * Get upcoming events (not started yet)
   */
  async getUpcomingEvents() {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        isActive: true,
        startTime: { gt: now },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    });

    return events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      startsIn: this.getTimeUntil(event.startTime),
      bannerUrl: event.bannerUrl,
    }));
  }

  /**
   * Calculate time until string
   */
  private getTimeUntil(startTime: Date): string {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();

    if (diff <= 0) return 'Starting now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  }

  /**
   * Create a new event (for admin/seeding)
   */
  async createEvent(data: {
    name: string;
    description: string;
    type: string;
    startTime: Date;
    endTime: Date;
    regionId?: string;
    bannerUrl?: string;
    config?: EventConfig;
    priority?: number;
    spawns?: Array<{
      species: string;
      rarity: string;
      spawnRate: number;
      minLevel: number;
      maxLevel: number;
      isGuaranteed?: boolean;
    }>;
  }) {
    const event = await this.prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        regionId: data.regionId,
        bannerUrl: data.bannerUrl,
        config: (data.config || {}) as any,
        priority: data.priority || 0,
        eventSpawns: {
          create:
            data.spawns?.map((spawn) => ({
              species: spawn.species,
              rarity: spawn.rarity,
              spawnRate: spawn.spawnRate,
              minLevel: spawn.minLevel,
              maxLevel: spawn.maxLevel,
              isGuaranteed: spawn.isGuaranteed || false,
            })) || [],
        },
      },
      include: {
        eventSpawns: true,
      },
    });

    return event;
  }
}
