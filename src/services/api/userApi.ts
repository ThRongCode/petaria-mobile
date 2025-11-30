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
      lastTicketReset: string
      petCount: number
      itemCount: number
      battlesWon: number
      battlesLost: number
      huntsCompleted: number
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
      reset: boolean
      message: string
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
}
