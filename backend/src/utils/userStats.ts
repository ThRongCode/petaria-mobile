/**
 * Utility class for user stat calculations
 */
export class UserStatsUtil {
  /**
   * Calculate XP required for next user level
   * Formula: level * 200
   * 
   * @param currentLevel - Current user level
   * @returns XP required to reach next level
   */
  static calculateXpForNextLevel(currentLevel: number): number {
    return currentLevel * 200;
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
    const xpRequired = this.calculateXpForNextLevel(currentLevel);

    if (currentXp >= xpRequired) {
      return {
        leveledUp: true,
        newLevel: currentLevel + 1,
        remainingXp: currentXp - xpRequired,
      };
    }

    return {
      leveledUp: false,
      newLevel: currentLevel,
      remainingXp: currentXp,
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
