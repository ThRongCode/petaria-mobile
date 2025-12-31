import { realApiClient } from './realApiClient'

/**
 * Quest API Service
 * Handles daily quests, progress tracking, and reward claiming
 */

// Quest types
export interface QuestRewards {
  coins: number
  gems: number
  xp: number
  itemId: string | null
  itemQty: number | null
}

export interface Quest {
  id: string
  questId: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'special'
  category: string
  targetType: string
  targetCount: number
  targetSpecies: string | null
  targetRarity: string | null
  progress: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  difficulty: string
  rewards: QuestRewards
  expiresAt: string | null
  completedAt: string | null
  claimedAt: string | null
}

export interface ClaimRewardResponse {
  message: string
  rewards: {
    coins: number
    gems: number
    xp: number
    item: {
      item: { id: string; name: string }
      quantity: number
    } | null
  }
  user: {
    coins: number
    gems: number
    xp: number
    leveledUp?: boolean
    newLevel?: number
  }
}

export const questApi = {
  /**
   * Get all daily quests for current user
   * Also triggers daily reset check on backend
   */
  async getQuests() {
    const response = await realApiClient.get<Quest[]>('/quest')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Claim rewards for a completed quest
   */
  async claimReward(userQuestId: string) {
    const response = await realApiClient.post<ClaimRewardResponse>(
      `/quest/${userQuestId}/claim`
    )

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Force refresh daily quests (for testing/debugging)
   */
  async refreshQuests() {
    const response = await realApiClient.post<Quest[]>('/quest/refresh')

    return {
      success: true,
      data: response,
    }
  },
}
