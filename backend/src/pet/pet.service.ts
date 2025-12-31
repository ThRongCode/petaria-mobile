import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePetDto } from './dto/update-pet.dto';
import {
  getSpeciesEvolution,
  getAvailableEvolutions,
  canEvolveWith,
  EVOLUTION_CHAINS,
} from '../config/evolution-chains.config';
import {
  getSpeciesBaseStats,
  calculateFinalStat,
  getRarityMultiplier,
} from '../config/species-stats.config';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const pets = await this.prisma.pet.findMany({
      where: { ownerId: userId },
      include: {
        moves: {
          include: {
            move: true,
          },
        },
        favoritedBy: {
          where: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add isFavorite flag and evolution info to each pet
    return pets.map((pet) => {
      const evolutionData = getSpeciesEvolution(pet.species);
      const availableEvolutions = getAvailableEvolutions(pet.species, pet.level);
      
      return {
        ...pet,
        isFavorite: pet.favoritedBy.length > 0,
        favoritedBy: undefined, // Remove the relation data
        // Evolution info from config
        maxEvolutionStage: evolutionData.maxStage,
        canEvolve: evolutionData.canEvolve && availableEvolutions.length > 0,
      };
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

    // Add evolution info from config
    const evolutionData = getSpeciesEvolution(pet.species);
    const availableEvolutions = getAvailableEvolutions(pet.species, pet.level);
    
    return {
      ...pet,
      maxEvolutionStage: evolutionData.maxStage,
      canEvolve: evolutionData.canEvolve && availableEvolutions.length > 0,
    };
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

  /**
   * Add a pet to user's favorites
   */
  async addToFavorites(userId: string, petId: string) {
    // Verify the pet belongs to the user
    const pet = await this.prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: userId,
      },
    });

    if (!pet) {
      throw new BadRequestException('Pet not found or does not belong to you');
    }

    // Check if already favorited
    const existing = await this.prisma.favoritePet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    if (existing) {
      return {
        message: 'Pet is already in favorites',
        isFavorite: true,
      };
    }

    // Add to favorites
    await this.prisma.favoritePet.create({
      data: {
        userId,
        petId,
      },
    });

    return {
      message: 'Pet added to favorites',
      isFavorite: true,
    };
  }

  /**
   * Remove a pet from user's favorites
   */
  async removeFromFavorites(userId: string, petId: string) {
    const favorite = await this.prisma.favoritePet.findUnique({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    if (!favorite) {
      return {
        message: 'Pet is not in favorites',
        isFavorite: false,
      };
    }

    await this.prisma.favoritePet.delete({
      where: {
        userId_petId: {
          userId,
          petId,
        },
      },
    });

    return {
      message: 'Pet removed from favorites',
      isFavorite: false,
    };
  }

  /**
   * Get all favorite pets for a user
   */
  async getFavoritePets(userId: string) {
    const favorites = await this.prisma.favoritePet.findMany({
      where: { userId },
      include: {
        pet: {
          include: {
            moves: {
              include: {
                move: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav) => fav.pet);
  }

  /**
   * Get evolution options for a pet
   * Returns available evolution paths based on level
   */
  async getEvolutionOptions(petId: string, userId: string) {
    const pet = await this.findOne(petId, userId);
    
    const evolutionData = getSpeciesEvolution(pet.species);
    const availableEvolutions = getAvailableEvolutions(pet.species, pet.level);
    
    // Get user's evolution items
    const userItems = await this.prisma.userItem.findMany({
      where: {
        userId,
        item: {
          type: 'Evolution',
        },
      },
      include: {
        item: true,
      },
    });

    const userItemIds = userItems.reduce((acc, ui) => {
      acc[ui.itemId] = ui.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Map ALL possible evolutions with eligibility info
    const allEvolutionsWithInfo = evolutionData.evolutions.map((evo) => {
      const meetsLevelReq = pet.level >= evo.levelRequired;
      const hasItem = evo.itemRequired ? (userItemIds[evo.itemRequired] || 0) > 0 : true;
      
      return {
        ...evo,
        meetsLevelRequirement: meetsLevelReq,
        hasItem,
        itemQuantity: evo.itemRequired ? userItemIds[evo.itemRequired] || 0 : null,
        canEvolveNow: meetsLevelReq && hasItem,
      };
    });

    // Check if any evolution is currently possible
    const canEvolveNow = allEvolutionsWithInfo.some(evo => evo.canEvolveNow);

    return {
      petId: pet.id,
      species: pet.species,
      level: pet.level,
      canEvolve: evolutionData.canEvolve,
      canEvolveNow,
      currentStage: evolutionData.stage,
      maxStage: evolutionData.maxStage,
      evolvesFrom: evolutionData.evolvesFrom,
      availableEvolutions: allEvolutionsWithInfo,
    };
  }

  /**
   * Evolve a pet using a specific evolution stone
   */
  async evolve(petId: string, userId: string, itemId: string) {
    const pet = await this.findOne(petId, userId);

    // Check evolution eligibility
    const evolutionPath = canEvolveWith(pet.species, pet.level, itemId);
    
    if (!evolutionPath) {
      const evolutionData = getSpeciesEvolution(pet.species);
      
      if (!evolutionData.canEvolve) {
        throw new BadRequestException(`${pet.species} cannot evolve`);
      }
      
      const availableEvolutions = getAvailableEvolutions(pet.species, pet.level);
      
      if (availableEvolutions.length === 0) {
        throw new BadRequestException(`${pet.species} cannot evolve yet. Level up more!`);
      }
      
      const validItems = availableEvolutions
        .filter(e => e.itemRequired)
        .map(e => e.itemRequired);
      
      throw new BadRequestException(
        `Cannot evolve ${pet.species} with this item. Valid items: ${validItems.join(', ')}`
      );
    }

    // Check user has the required item
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
      throw new BadRequestException('You do not have the required evolution item');
    }

    // Get new species stats
    const newSpecies = evolutionPath.evolvesTo;
    const newBaseStats = getSpeciesBaseStats(newSpecies);
    const rarityMult = getRarityMultiplier(pet.rarity);
    const newEvolutionData = getSpeciesEvolution(newSpecies);

    // Calculate new stats based on species base stats, IVs, level, and rarity
    const newStats = {
      maxHp: calculateFinalStat(newBaseStats.hp, pet.ivHp, pet.level, rarityMult),
      attack: calculateFinalStat(newBaseStats.attack, pet.ivAttack, pet.level, rarityMult),
      defense: calculateFinalStat(newBaseStats.defense, pet.ivDefense, pet.level, rarityMult),
      speed: calculateFinalStat(newBaseStats.speed, pet.ivSpeed, pet.level, rarityMult),
    };

    // Perform evolution in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Consume the evolution item
      if (userItem.quantity === 1) {
        await prisma.userItem.delete({
          where: {
            userId_itemId: {
              userId,
              itemId,
            },
          },
        });
      } else {
        await prisma.userItem.update({
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

      // Update the pet with new species and stats
      const evolvedPet = await prisma.pet.update({
        where: { id: petId },
        data: {
          species: newSpecies,
          evolutionStage: newEvolutionData.stage,
          ...newStats,
          hp: newStats.maxHp, // Full heal on evolution
        },
        include: {
          moves: {
            include: {
              move: true,
            },
          },
        },
      });

      return evolvedPet;
    });

    return {
      message: `${pet.species} evolved into ${newSpecies}!`,
      previousSpecies: pet.species,
      newSpecies: newSpecies,
      pet: result,
      itemUsed: userItem.item.name,
      statsChanged: {
        maxHp: { from: pet.maxHp, to: newStats.maxHp },
        attack: { from: pet.attack, to: newStats.attack },
        defense: { from: pet.defense, to: newStats.defense },
        speed: { from: pet.speed, to: newStats.speed },
      },
    };
  }
}
