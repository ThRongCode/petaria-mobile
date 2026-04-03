import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketResetUtil } from '../utils/ticketReset';
import { DailyLoginUtil } from '../utils/dailyLogin';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ConfigLoaderService } from '../config/config-loader.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        xp: true,
        coins: true,
        gems: true,
        pokeballs: true,
        huntTickets: true,
        battleTickets: true,
        lastHuntTicketRegen: true,
        lastBattleTicketRegen: true,
        petCount: true,
        itemCount: true,
        battlesWon: true,
        battlesLost: true,
        huntsCompleted: true,
        avatarUrl: true,
        title: true,
        lastHealTime: true,
        // Login streak
        loginStreak: true,
        lastLoginDate: true,
        totalLogins: true,
        // Settings
        settingsNotifications: true,
        settingsAutoFeed: true,
        settingsBattleAnimations: true,
        settingsSoundEnabled: true,
        settingsMusicEnabled: true,
        settingsLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Regenerate tickets based on elapsed time
    const ticketRegen = await TicketResetUtil.checkAndResetTickets(this.prisma, userId);

    const loader = ConfigLoaderService.getInstance();
    const gc = loader?.getGameConstants();

    return {
      ...user,
      // Override with regenerated ticket counts
      huntTickets: ticketRegen.huntTickets,
      battleTickets: ticketRegen.battleTickets,
      // Ticket regen info for FE countdown timers
      maxBattleTickets: ticketRegen.maxBattleTickets,
      maxHuntTickets: ticketRegen.maxHuntTickets,
      nextHuntTicketAt: ticketRegen.nextHuntTicketAt,
      nextBattleTicketAt: ticketRegen.nextBattleTicketAt,
      huntRegenMinutes: ticketRegen.huntRegenMinutes,
      battleRegenMinutes: ticketRegen.battleRegenMinutes,
      // Game constants
      maxPetSlots: gc?.limits?.maxPetSlots ?? 100,
      maxItemSlots: gc?.limits?.maxItemSlots ?? 500,
      xpToNext: user.level * user.level * 20, // quadratic: level² × 20
      settings: {
        notifications: user.settingsNotifications,
        autoFeed: user.settingsAutoFeed,
        battleAnimations: user.settingsBattleAnimations,
        soundEnabled: user.settingsSoundEnabled,
        musicEnabled: user.settingsMusicEnabled,
        language: user.settingsLanguage,
      },
    };
  }

  async getInventory(userId: string) {
    const inventory = await this.prisma.userItem.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            rarity: true,
            imageUrl: true,
            effectHp: true,
            effectAttack: true,
            effectDefense: true,
            effectSpeed: true,
            effectXpBoost: true,
            isPermanent: true,
            priceCoins: true,
            priceGems: true,
          },
        },
      },
    });

    return inventory.map((inv) => ({
      itemId: inv.itemId,
      quantity: inv.quantity,
      item: inv.item,
    }));
  }

  async claimDailyLogin(userId: string) {
    return DailyLoginUtil.claimDailyLogin(this.prisma, userId);
  }

  async getDailyLoginStatus(userId: string) {
    return DailyLoginUtil.getStreakStatus(this.prisma, userId);
  }

  async checkTicketReset(userId: string) {
    return TicketResetUtil.checkAndResetTickets(this.prisma, userId);
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        battlesWon: true,
        battlesLost: true,
        huntsCompleted: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const petsCount = await this.prisma.pet.count({
      where: { ownerId: userId },
    });

    return {
      battlesWon: user.battlesWon,
      battlesLost: user.battlesLost,
      huntsCompleted: user.huntsCompleted,
      petsOwned: petsCount,
      winRate: user.battlesWon + user.battlesLost > 0 
        ? (user.battlesWon / (user.battlesWon + user.battlesLost)) * 100 
        : 0,
    };
  }

  // DEV ONLY: Add tickets for testing
  private async addTickets(
    userId: string,
    ticketType: 'battleTickets' | 'huntTickets',
    amount: number,
    maxAmount: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { battleTickets: true, huntTickets: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentTickets = user[ticketType];
    const newTickets = Math.min(currentTickets + amount, maxAmount);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { [ticketType]: newTickets },
      select: { battleTickets: true, huntTickets: true },
    });

    const ticketName = ticketType === 'battleTickets' ? 'battle' : 'hunt';
    return {
      message: `Added ${amount} ${ticketName} tickets`,
      [ticketType]: updatedUser[ticketType],
    };
  }

  // DEV ONLY: Add 5 battle tickets for testing
  async addBattleTickets(userId: string) {
    return this.addTickets(userId, 'battleTickets', 5, 20);
  }

  // DEV ONLY: Add 5 hunt tickets for testing
  async addHuntTickets(userId: string) {
    return this.addTickets(userId, 'huntTickets', 5, 5);
  }

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        settingsNotifications: true,
        settingsAutoFeed: true,
        settingsBattleAnimations: true,
        settingsSoundEnabled: true,
        settingsMusicEnabled: true,
        settingsLanguage: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      notifications: user.settingsNotifications,
      autoFeed: user.settingsAutoFeed,
      battleAnimations: user.settingsBattleAnimations,
      soundEnabled: user.settingsSoundEnabled,
      musicEnabled: user.settingsMusicEnabled,
      language: user.settingsLanguage,
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: Record<string, any> = {};
    if (dto.notifications !== undefined) data.settingsNotifications = dto.notifications;
    if (dto.autoFeed !== undefined) data.settingsAutoFeed = dto.autoFeed;
    if (dto.battleAnimations !== undefined) data.settingsBattleAnimations = dto.battleAnimations;
    if (dto.soundEnabled !== undefined) data.settingsSoundEnabled = dto.soundEnabled;
    if (dto.musicEnabled !== undefined) data.settingsMusicEnabled = dto.musicEnabled;
    if (dto.language !== undefined) data.settingsLanguage = dto.language;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        settingsNotifications: true,
        settingsAutoFeed: true,
        settingsBattleAnimations: true,
        settingsSoundEnabled: true,
        settingsMusicEnabled: true,
        settingsLanguage: true,
      },
    });

    return {
      notifications: updated.settingsNotifications,
      autoFeed: updated.settingsAutoFeed,
      battleAnimations: updated.settingsBattleAnimations,
      soundEnabled: updated.settingsSoundEnabled,
      musicEnabled: updated.settingsMusicEnabled,
      language: updated.settingsLanguage,
    };
  }
}
