import { realApiClient } from './realApiClient'

/**
 * Game Config API Service
 * Handles global game configuration from server
 */
export const configApi = {
  /**
   * Get global game configuration
   */
  async getGameConfig() {
    const response = await realApiClient.get<{
      maxPetLevel: number
      maxUserLevel: number
      petXpPerLevel: number
      userXpPerLevel: number
      maxBattleTickets: number
      maxHuntTickets: number
      maxPetSlots: number
      maxItemSlots: number
      ticketResetIntervalHours: number
      huntMovesPerSession: number
      encounterChance: number
      huntSessionExpiryHours: number
      catchRates: Record<string, number>
      rarityCatchModifiers: Record<string, number>
      battleLossRewardPercent: number
      healAllCost: number
      rarityMultipliers: Record<string, number>
      currencies: string[]
    }>('/config/game')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get all known species types
   */
  async getSpeciesTypes() {
    const response = await realApiClient.get<string[]>('/config/species')

    return {
      success: true,
      data: response,
    }
  },
}
