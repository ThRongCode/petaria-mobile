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
}
