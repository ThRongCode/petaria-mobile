import { ConfigLoaderService } from '../config/config-loader.service';

/** Maximum level a user can reach — reads from game-constants.json, fallback 100 */
export function getMaxUserLevel(): number {
  const loader = ConfigLoaderService.getInstance();
  return loader?.getGameConstants()?.levels?.maxUserLevel ?? 100;
}

/** @deprecated Use getMaxUserLevel() — kept for backward compat */
export const MAX_USER_LEVEL = 100;

/**
 * Utility class for user stat calculations
 */
export class UserStatsUtil {
  /**
   * Calculate XP required for next user level
   * Reads userXpPerLevel from game-constants.json (default: level * 200)
   * 
   * @param currentLevel - Current user level
   * @returns XP required to reach next level
   */
  static calculateXpForNextLevel(currentLevel: number): number {
    const loader = ConfigLoaderService.getInstance();
    const xpPerLevel = loader?.getGameConstants()?.levels?.userXpPerLevel ?? 200;
    return currentLevel * xpPerLevel;
  }

  /**
   * Check if user should level up and calculate remaining XP
   * 
   * @param currentXp - Current user XP
   * @param currentLevel - Current user level
   * @returns Level up information
   */
  static checkLevelUp(
    currentXp: number,
    currentLevel: number,
  ): {
    leveledUp: boolean;
    newLevel: number;
    remainingXp: number;
  } {
    let level = currentLevel;
    let xp = currentXp;
    const maxLevel = getMaxUserLevel();

    // Allow multiple level-ups in one go, capped at max level
    while (level < maxLevel) {
      const xpRequired = this.calculateXpForNextLevel(level);
      if (xp < xpRequired) break;
      xp -= xpRequired;
      level += 1;
    }

    // If at max level, XP stays at 0
    if (level >= maxLevel) {
      level = maxLevel;
      xp = 0;
    }

    return {
      leveledUp: level > currentLevel,
      newLevel: level,
      remainingXp: xp,
    };
  }

  /**
   * Calculate total XP earned across all levels
   * Useful for leaderboards or stats
   * 
   * @param level - Current level
   * @param currentXp - Current XP in this level
   * @returns Total XP earned
   */
  static calculateTotalXp(level: number, currentXp: number): number {
    let totalXp = currentXp;
    
    // Sum XP from all previous levels
    for (let i = 1; i < level; i++) {
      totalXp += this.calculateXpForNextLevel(i);
    }
    
    return totalXp;
  }
}
