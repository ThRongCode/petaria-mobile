import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async getCatalog() {
    return this.prisma.item.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getItemById(id: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async buyItem(userId: string, itemId: string, quantity: number = 1) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const item = await this.getItemById(itemId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check item limit
    if (user.itemCount + quantity > 500) {
      throw new BadRequestException(
        `Item limit reached. Can only add ${500 - user.itemCount} more items (500 max)`,
      );
    }

    // Determine which currency to use
    let totalCost = 0;
    let currency: 'coin' | 'gem' = 'coin';

    if (item.priceGems && item.priceGems > 0) {
      totalCost = item.priceGems * quantity;
      currency = 'gem';
      if (user.gems < totalCost) {
        throw new BadRequestException('Not enough gems');
      }
    } else if (item.priceCoins && item.priceCoins > 0) {
      totalCost = item.priceCoins * quantity;
      currency = 'coin';
      if (user.coins < totalCost) {
        throw new BadRequestException('Not enough coins');
      }
    } else {
      throw new BadRequestException('Item is not purchasable');
    }

    // Special handling for pokeballs - add to currency instead of inventory
    if (itemId === 'pokeball') {
      const updateData = currency === 'coin' 
        ? { coins: user.coins - totalCost, pokeballs: { increment: quantity } }
        : { gems: user.gems - totalCost, pokeballs: { increment: quantity } };

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return {
        message: 'Pokeballs purchased successfully',
        item: item.name,
        quantity,
        totalCost,
        currency,
        remainingCoins: updatedUser.coins,
        remainingGems: updatedUser.gems,
        pokeballs: updatedUser.pokeballs,
      };
    }

    // Deduct currency for regular items
    const updateData = currency === 'coin' 
      ? { coins: user.coins - totalCost }
      : { gems: user.gems - totalCost };

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Add or update item in inventory
    const existingItem = await this.prisma.userItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.userItem.update({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await this.prisma.userItem.create({
        data: {
          userId,
          itemId,
          quantity,
        },
      });
    }

    // Increment itemCount
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        itemCount: { increment: quantity },
      },
    });

    return {
      message: 'Item purchased successfully',
      item: item.name,
      quantity,
      totalCost,
      currency,
      remainingCoins: updateData.coins ?? user.coins,
      remainingGems: updateData.gems ?? user.gems,
    };
  }

  async useItem(userId: string, itemId: string, petId?: string) {
    const userItem = await this.prisma.userItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      include: {
        item: true,
      },
    });

    if (!userItem || userItem.quantity < 1) {
      throw new BadRequestException('Item not found in inventory');
    }

    const item = userItem.item;

    // If item affects a pet, petId is required
    if ((item.effectHp || item.effectAttack || item.effectDefense || item.effectSpeed) && !petId) {
      throw new BadRequestException('Pet ID is required to use this item');
    }

    let result: any = {
      message: `Used ${item.name}`,
      itemUsed: item.name,
    };

    // Apply item effects
    if (petId) {
      const pet = await this.prisma.pet.findFirst({
        where: {
          id: petId,
          ownerId: userId,
        },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      const updates: any = {};

      // HP restoration
      if (item.effectHp && item.effectHp > 0) {
        const healAmount = Math.min(item.effectHp, pet.maxHp - pet.hp);
        updates.hp = pet.hp + healAmount;
        result.healAmount = healAmount;
      }

      // Stat boosts (permanent)
      if (item.effectAttack && item.effectAttack > 0) {
        updates.attack = pet.attack + item.effectAttack;
        result.attackBoost = item.effectAttack;
      }
      if (item.effectDefense && item.effectDefense > 0) {
        updates.defense = pet.defense + item.effectDefense;
        result.defenseBoost = item.effectDefense;
      }
      if (item.effectSpeed && item.effectSpeed > 0) {
        updates.speed = pet.speed + item.effectSpeed;
        result.speedBoost = item.effectSpeed;
      }

      // Evolution trigger (permanent stat items might trigger evolution in future)
      if (item.isPermanent && (item.effectAttack || item.effectDefense || item.effectSpeed)) {
        result.message = `${item.name} permanently boosted your pet's stats!`;
      }

      if (Object.keys(updates).length > 0) {
        const updatedPet = await this.prisma.pet.update({
          where: { id: petId },
          data: updates,
        });
        result.pet = updatedPet;
      }
    }

    // Decrease item quantity if not permanent
    if (!item.isPermanent) {
      if (userItem.quantity === 1) {
        await this.prisma.userItem.delete({
          where: {
            userId_itemId: {
              userId,
              itemId,
            },
          },
        });
      } else {
        await this.prisma.userItem.update({
          where: {
            userId_itemId: {
              userId,
              itemId,
            },
          },
          data: {
            quantity: userItem.quantity - 1,
          },
        });
      }

      // Decrement itemCount
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          itemCount: { decrement: 1 },
        },
      });
    }

    return result;
  }
}
