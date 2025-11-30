import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.pet.findMany({
      where: { ownerId: userId },
      include: {
        moves: {
          include: {
            move: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const pet = await this.prisma.pet.findFirst({
      where: {
        id,
        ownerId: userId,
      },
      include: {
        moves: {
          include: {
            move: true,
          },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  async update(id: string, userId: string, updatePetDto: UpdatePetDto) {
    // Verify ownership
    const pet = await this.findOne(id, userId);

    return this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
      include: {
        moves: {
          include: {
            move: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    await this.prisma.pet.delete({
      where: { id },
    });

    // Decrement petCount
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        petCount: { decrement: 1 },
      },
    });

    return { message: 'Pet released successfully' };
  }

  async feed(id: string, userId: string) {
    const pet = await this.findOne(id, userId);

    if (pet.mood >= 100) {
      throw new BadRequestException('Pet is already at maximum mood');
    }

    const updated = await this.prisma.pet.update({
      where: { id },
      data: {
        mood: Math.min(pet.mood + 20, 100),
        lastFed: new Date(),
      },
    });

    return {
      ...updated,
      moodIncreased: Math.min(pet.mood + 20, 100) - pet.mood,
    };
  }

  async heal(id: string, userId: string, itemId: string) {
    const pet = await this.findOne(id, userId);

    // Check if user has the item
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

    // Check if item is a healing item
    if (!item.effectHp || item.effectHp <= 0) {
      throw new BadRequestException('This item cannot heal pets');
    }

    if (pet.hp >= pet.maxHp) {
      throw new BadRequestException('Pet is already at full health');
    }

    // Apply healing
    const healAmount = Math.min(item.effectHp, pet.maxHp - pet.hp);
    const newHp = pet.hp + healAmount;

    // Update pet HP
    const updated = await this.prisma.pet.update({
      where: { id },
      data: { hp: newHp },
    });

    // Decrease item quantity
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

    return {
      pet: updated,
      healAmount,
      itemUsed: item.name,
    };
  }

  async healAll(userId: string) {
    const HEAL_COST = 200;

    // Get user to check coins
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.coins < HEAL_COST) {
      throw new BadRequestException(
        `Not enough coins. Need ${HEAL_COST}, have ${user.coins}`,
      );
    }

    // Get all user's pets that need healing (hp < maxHp)
    const petsNeedingHeal = await this.prisma.pet.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        hp: true,
        maxHp: true,
      },
    });

    const petsToHeal = petsNeedingHeal.filter((pet) => pet.hp < pet.maxHp);

    if (petsToHeal.length === 0) {
      // All Pokemon are already healthy - return success without charging
      return {
        healedCount: 0,
        coinCost: 0,
        coinsRemaining: user.coins,
        message: 'All Pokemon are already at full health',
      };
    }

    // Heal all pets to max HP and deduct coins in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Heal each pet individually to set hp = maxHp
      for (const pet of petsToHeal) {
        await prisma.pet.update({
          where: { id: pet.id },
          data: { hp: pet.maxHp },
        });
      }

      // Deduct coins from user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            decrement: HEAL_COST,
          },
        },
      });

      return {
        healedCount: petsToHeal.length,
        coinsRemaining: updatedUser.coins,
      };
    });

    return {
      healedCount: result.healedCount,
      coinCost: HEAL_COST,
      coinsRemaining: result.coinsRemaining,
      message: `Healed ${result.healedCount} Pokemon for ${HEAL_COST} coins`,
    };
  }
}
