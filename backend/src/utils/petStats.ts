import {
  getSpeciesBaseStats,
  calculateFinalStat,
  getRarityMultiplier,
} from '../config/species-stats.config';
import { ConfigLoaderService } from '../config/config-loader.service';

/** Maximum level a pet can reach — reads from game-constants.json, fallback 100 */
export function getMaxPetLevel(): number {
  const loader = ConfigLoaderService.getInstance();
  return loader?.getGameConstants()?.levels?.maxPetLevel ?? 100;
}


/**
 * Utility class for pet stat calculations
 * 
 * Uses deterministic formula: finalStat = (baseStat + IV) × levelMultiplier × rarityMultiplier
 * This ensures stats are predictable and easy to test/verify.
 */
export class PetStatsUtil {
  /**
   * Calculate XP required for next level: level² × 10
   */
  static calculateXpForNextLevel(currentLevel: number): number {
    // Quadratic curve: level² × 10
    // Lv1→10, Lv10→1000, Lv25→6250, Lv50→25000, Lv100→100000
    return currentLevel * currentLevel * 10;
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
    let level = currentLevel;
    let xp = currentXp;
    const maxLevel = getMaxPetLevel();

    // Allow multiple level-ups in one go, capped at max level
    while (level < maxLevel) {
      const xpRequired = this.calculateXpForNextLevel(level);
      if (xp < xpRequired) break;
      xp -= xpRequired;
      level += 1;
    }

    // If at max level, XP stays at 0 (no further accumulation)
    if (level >= maxLevel) {
      level = maxLevel;
      xp = 0;
    }

    if (level > currentLevel) {
      const newStats = this.calculateStats(species, level, rarity, ivs);
      return {
        leveledUp: true,
        newLevel: level,
        remainingXp: xp,
        newStats,
      };
    }

    return {
      leveledUp: false,
      newLevel: currentLevel,
      remainingXp: xp,
    };
  }
}
