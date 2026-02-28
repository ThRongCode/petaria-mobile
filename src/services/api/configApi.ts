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
      healCost: number
      maxBattleTickets: number
      maxHuntTickets: number
      maxPetSlots: number
      maxItemSlots: number
      ticketResetIntervalHours: number
      xpFormula: string
      maxEvolutionStage: number
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
