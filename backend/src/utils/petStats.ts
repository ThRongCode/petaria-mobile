/**
 * Utility class for pet stat calculations
 */
export class PetStatsUtil {
  /**
   * Calculate stat growth on level up with random 5-10% increase
   * 
   * @param currentStat - Current stat value
   * @returns New stat value after growth
   */
  static calculateStatGrowth(currentStat: number): number {
    // Random growth between 5% and 10%
    const growthPercent = 0.05 + Math.random() * 0.05; // 5-10%
    const increase = Math.ceil(currentStat * growthPercent);
    
    // Ensure at least +1 growth even for low stats
    return currentStat + Math.max(1, increase);
  }

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
   * Check if pet should level up and calculate new stats
   * 
   * @param currentXp - Current pet XP
   * @param currentLevel - Current pet level
   * @param currentStats - Current pet stats (hp, attack, defense, speed)
   * @returns Level up information
   */
  static checkLevelUp(
    currentXp: number,
    currentLevel: number,
    currentStats: {
      maxHp: number;
      attack: number;
      defense: number;
      speed: number;
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
      const newStats = {
        maxHp: this.calculateStatGrowth(currentStats.maxHp),
        attack: this.calculateStatGrowth(currentStats.attack),
        defense: this.calculateStatGrowth(currentStats.defense),
        speed: this.calculateStatGrowth(currentStats.speed),
      };

      return {
        leveledUp: true,
        newLevel: currentLevel + 1,
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
