import { realApiClient } from './realApiClient'

/**
 * User API Service
 * Handles user profile, inventory, and stats
 */
export const userApi = {
  /**
   * Get user profile
   */
  async getProfile() {
    const response = await realApiClient.get<{
      id: string
      email: string
      username: string
      level: number
      xp: number
      coins: number
      gems: number
      pokeballs: number
      huntTickets: number
      battleTickets: number
      lastHuntTicketRegen: string
      lastBattleTicketRegen: string
      maxBattleTickets: number
      maxHuntTickets: number
      nextHuntTicketAt: string | null
      nextBattleTicketAt: string | null
      huntRegenMinutes: number
      battleRegenMinutes: number
      petCount: number
      itemCount: number
      battlesWon: number
      battlesLost: number
      huntsCompleted: number
      avatarUrl: string | null
      title: string | null
      lastHealTime: string | null
      maxPetSlots: number
      maxItemSlots: number
      xpToNext: number
      settings: {
        notifications: boolean
        autoFeed: boolean
        battleAnimations: boolean
        soundEnabled: boolean
        musicEnabled: boolean
        language: string
      }
      createdAt: string
      updatedAt: string
    }>('/user/profile')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { username?: string }) {
    const response = await realApiClient.patch('/user/profile', data)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get user inventory
   */
  async getInventory() {
    const response = await realApiClient.get<Array<{
      itemId: string
      quantity: number
      item: {
        id: string
        name: string
        description: string
        type: string
        rarity: string
        imageUrl: string
        effectHp?: number
        effectAttack?: number
        effectDefense?: number
        effectSpeed?: number
        effectXpBoost?: number
        isPermanent: boolean
        priceCoins?: number
        priceGems?: number
      }
    }>>('/user/inventory')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get user stats
   */
  async getStats() {
    const response = await realApiClient.get<{
      battlesWon: number
      battlesLost: number
      huntsCompleted: number
    }>('/user/stats')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Check and reset tickets if needed
   */
  async checkTickets() {
    const response = await realApiClient.post<{
      huntTickets: number
      battleTickets: number
      maxHuntTickets: number
      maxBattleTickets: number
      nextHuntTicketAt: string | null
      nextBattleTicketAt: string | null
      huntRegenMinutes: number
      battleRegenMinutes: number
    }>('/user/check-tickets')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * DEV ONLY: Add 5 battle tickets for testing
   */
  async addBattleTickets() {
    const response = await realApiClient.post<{
      message: string
      battleTickets: number
    }>('/user/dev/add-battle-tickets')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * DEV ONLY: Add 5 hunt tickets for testing
   */
  async addHuntTickets() {
    const response = await realApiClient.post<{
      message: string
      huntTickets: number
    }>('/user/dev/add-hunt-tickets')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Claim daily login reward
   */
  async claimDailyLogin() {
    const response = await realApiClient.post<{
      claimed: boolean
      alreadyClaimed: boolean
      currentStreak: number
      reward: { day: number; coins: number; gems: number; huntTickets: number; battleTickets: number; label: string } | null
      nextReward: { day: number; coins: number; gems: number; huntTickets: number; battleTickets: number; label: string } | null
      totalLogins: number
    }>('/user/daily-login')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get daily login streak status
   */
  async getDailyLoginStatus() {
    const response = await realApiClient.get<{
      currentStreak: number
      currentDay: number
      totalLogins: number
      claimedToday: boolean
      rewards: Array<{ day: number; coins: number; gems: number; huntTickets: number; battleTickets: number; label: string }>
    }>('/user/daily-login')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get user settings
   */
  async getSettings() {
    const response = await realApiClient.get<{
      notifications: boolean
      autoFeed: boolean
      battleAnimations: boolean
      soundEnabled: boolean
      musicEnabled: boolean
      language: string
    }>('/user/settings')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Update user settings
   */
  async updateSettings(settings: {
    notifications?: boolean
    autoFeed?: boolean
    battleAnimations?: boolean
    soundEnabled?: boolean
    musicEnabled?: boolean
    language?: string
  }) {
    const response = await realApiClient.patch<{
      notifications: boolean
      autoFeed: boolean
      battleAnimations: boolean
      soundEnabled: boolean
      musicEnabled: boolean
      language: string
    }>('/user/settings', settings)

    return {
      success: true,
      data: response,
    }
  },
}
