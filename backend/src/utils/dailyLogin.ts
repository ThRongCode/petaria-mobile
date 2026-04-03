import { PrismaClient } from '@prisma/client';
import { ConfigLoaderService } from '../config/config-loader.service';

export interface DailyLoginReward {
  day: number;
  coins: number;
  gems: number;
  huntTickets: number;
  battleTickets: number;
  label: string;
}

export interface DailyLoginResult {
  claimed: boolean;
  alreadyClaimed: boolean;
  currentStreak: number;
  reward: DailyLoginReward | null;
  nextReward: DailyLoginReward | null;
  totalLogins: number;
}

function getUTCDateString(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export class DailyLoginUtil {
  /**
   * Check and claim daily login reward.
   * - If already logged in today: return alreadyClaimed=true
   * - If last login was yesterday: increment streak, grant reward
   * - If last login was older or never: reset streak to 1, grant day-1 reward
   * - After day 7, cycle back to day 1
   */
  static async claimDailyLogin(
    prisma: PrismaClient | any,
    userId: string,
  ): Promise<DailyLoginResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true,
        lastLoginDate: true,
        totalLogins: true,
        huntTickets: true,
        battleTickets: true,
      },
    });

    if (!user) {
      return {
        claimed: false,
        alreadyClaimed: false,
        currentStreak: 0,
        reward: null,
        nextReward: null,
        totalLogins: 0,
      };
    }

    const loader = ConfigLoaderService.getInstance();
    const dailyLoginConfig = loader?.getGameConstants()?.dailyLogin;
    const streakLength = dailyLoginConfig?.streakLength ?? 7;
    const rewards = dailyLoginConfig?.rewards ?? [];

    const now = new Date();
    const todayStr = getUTCDateString(now);

    // Check if already claimed today
    if (user.lastLoginDate) {
      const lastLoginStr = getUTCDateString(new Date(user.lastLoginDate));
      if (lastLoginStr === todayStr) {
        // Already claimed today
        const currentDay = ((user.loginStreak - 1) % streakLength) + 1;
        const nextDay = (currentDay % streakLength) + 1;
        return {
          claimed: false,
          alreadyClaimed: true,
          currentStreak: user.loginStreak,
          reward: rewards.find((r: DailyLoginReward) => r.day === currentDay) ?? null,
          nextReward: rewards.find((r: DailyLoginReward) => r.day === nextDay) ?? null,
          totalLogins: user.totalLogins,
        };
      }

      // Check if yesterday (streak continues) or older (streak resets)
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = getUTCDateString(yesterday);

      if (lastLoginStr === yesterdayStr) {
        // Streak continues
        user.loginStreak += 1;
      } else {
        // Streak broken — reset to 1
        user.loginStreak = 1;
      }
    } else {
      // First ever login
      user.loginStreak = 1;
    }

    // Calculate which day reward to give (1-based, cycling)
    const rewardDay = ((user.loginStreak - 1) % streakLength) + 1;
    const reward = rewards.find((r: DailyLoginReward) => r.day === rewardDay) ?? {
      day: rewardDay,
      coins: 200,
      gems: 0,
      huntTickets: 1,
      battleTickets: 2,
      label: `Day ${rewardDay}`,
    };

    const gc = loader?.getGameConstants();
    const maxHuntTickets = gc?.tickets?.maxHuntTickets ?? 5;
    const maxBattleTickets = gc?.tickets?.maxBattleTickets ?? 20;

    // Grant rewards — tickets are capped at max
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginStreak: user.loginStreak,
        lastLoginDate: now,
        totalLogins: { increment: 1 },
        coins: { increment: reward.coins },
        gems: { increment: reward.gems },
        huntTickets: Math.min(user.huntTickets + reward.huntTickets, maxHuntTickets),
        battleTickets: Math.min(user.battleTickets + reward.battleTickets, maxBattleTickets),
      },
    });

    const nextDay = (rewardDay % streakLength) + 1;

    return {
      claimed: true,
      alreadyClaimed: false,
      currentStreak: user.loginStreak,
      reward,
      nextReward: rewards.find((r: DailyLoginReward) => r.day === nextDay) ?? null,
      totalLogins: user.totalLogins + 1,
    };
  }

  /**
   * Get current streak status without claiming (for UI display)
   */
  static async getStreakStatus(
    prisma: PrismaClient | any,
    userId: string,
  ): Promise<{
    currentStreak: number;
    currentDay: number;
    totalLogins: number;
    claimedToday: boolean;
    rewards: DailyLoginReward[];
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true,
        lastLoginDate: true,
        totalLogins: true,
      },
    });

    const loader = ConfigLoaderService.getInstance();
    const dailyLoginConfig = loader?.getGameConstants()?.dailyLogin;
    const streakLength = dailyLoginConfig?.streakLength ?? 7;
    const rewards = dailyLoginConfig?.rewards ?? [];

    if (!user) {
      return { currentStreak: 0, currentDay: 0, totalLogins: 0, claimedToday: false, rewards };
    }

    const todayStr = getUTCDateString(new Date());
    let claimedToday = false;
    let streak = user.loginStreak;

    if (user.lastLoginDate) {
      const lastLoginStr = getUTCDateString(new Date(user.lastLoginDate));
      claimedToday = lastLoginStr === todayStr;

      // If not claimed today and not yesterday, streak would reset
      if (!claimedToday) {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        if (lastLoginStr !== getUTCDateString(yesterday)) {
          streak = 0; // Will be 1 when they claim
        }
      }
    }

    const currentDay = streak > 0 ? ((streak - 1) % streakLength) + 1 : 0;

    return {
      currentStreak: streak,
      currentDay,
      totalLogins: user.totalLogins,
      claimedToday,
      rewards,
    };
  }
}
