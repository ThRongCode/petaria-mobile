import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketResetUtil } from '../utils/ticketReset';

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
        huntTickets: true,
        battleTickets: true,
        lastTicketReset: true,
        petCount: true,
        itemCount: true,
        battlesWon: true,
        battlesLost: true,
        huntsCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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
}
