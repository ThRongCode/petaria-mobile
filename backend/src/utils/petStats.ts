import {
  getSpeciesBaseStats,
  calculateFinalStat,
  getRarityMultiplier,
} from '../config/species-stats.config';

/**
 * Utility class for pet stat calculations
 * 
 * Uses deterministic formula: finalStat = (baseStat + IV) × levelMultiplier × rarityMultiplier
 * This ensures stats are predictable and easy to test/verify.
 */
export class PetStatsUtil {
  /**
   * Calculate XP required for next level
   * Formula: level * 100
   * 
   * @param currentLevel - Current pet level
   * @returns XP required to reach next level
   */
  static calculateXpForNextLevel(currentLevel: number): number {
    return currentLevel * 100;
  }

  /**
   * Calculate all stats for a pet at a given level
   * Uses the deterministic formula: (baseStat + IV) × levelMultiplier × rarityMultiplier
   * 
   * @param species - Pet species name
   * @param level - Pet level
   * @param rarity - Pet rarity
   * @param ivs - Individual Values for each stat
   * @returns Calculated stats
   */
  static calculateStats(
    species: string,
    level: number,
    rarity: string,
    ivs: {
      ivHp: number;
      ivAttack: number;
      ivDefense: number;
      ivSpeed: number;
    },
  ): {
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  } {
    const baseStats = getSpeciesBaseStats(species);
    const rarityMult = getRarityMultiplier(rarity);

    return {
      maxHp: calculateFinalStat(baseStats.hp, ivs.ivHp, level, rarityMult),
      attack: calculateFinalStat(baseStats.attack, ivs.ivAttack, level, rarityMult),
      defense: calculateFinalStat(baseStats.defense, ivs.ivDefense, level, rarityMult),
      speed: calculateFinalStat(baseStats.speed, ivs.ivSpeed, level, rarityMult),
    };
  }

  /**
   * Check if pet should level up and calculate new stats
   * Stats are recalculated using the deterministic formula (not random growth)
   * 
   * @param currentXp - Current pet XP
   * @param currentLevel - Current pet level
   * @param species - Pet species name
   * @param rarity - Pet rarity
   * @param ivs - Individual Values for each stat
   * @returns Level up information with recalculated stats
   */
  static checkLevelUp(
    currentXp: number,
    currentLevel: number,
    species: string,
    rarity: string,
    ivs: {
      ivHp: number;
      ivAttack: number;
      ivDefense: number;
      ivSpeed: number;
    },
  ): {
    leveledUp: boolean;
    newLevel: number;
    remainingXp: number;
    newStats?: {
      maxHp: number;
      attack: number;
      defense: number;
      speed: number;
    };
  } {
    const xpRequired = this.calculateXpForNextLevel(currentLevel);

    if (currentXp >= xpRequired) {
      const newLevel = currentLevel + 1;
      
      // Recalculate stats using deterministic formula
      const newStats = this.calculateStats(species, newLevel, rarity, ivs);

      return {
        leveledUp: true,
        newLevel,
        remainingXp: currentXp - xpRequired,
        newStats,
      };
    }

    return {
      leveledUp: false,
      newLevel: currentLevel,
      remainingXp: currentXp,
    };
  }
}
