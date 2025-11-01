import { realApiClient } from './realApiClient'

/**
 * Battle API Service
 * Handles PvE battles against opponents
 */
export const battleApi = {
  /**
   * Get list of available opponents
   */
  async listOpponents() {
    const response = await realApiClient.get<Array<{
      id: string
      name: string
      description: string
      difficulty: string
      level: number
      coinReward: number
      xpReward: number
      imageUrl: string
      unlockLevel: number
      pets: Array<{
        species: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
      }>
    }>>('/battle/opponents')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get opponent details by ID
   */
  async getOpponent(opponentId: string) {
    const response = await realApiClient.get<{
      id: string
      name: string
      description: string
      difficulty: string
      level: number
      coinReward: number
      xpReward: number
      imageUrl: string
      unlockLevel: number
      pets: Array<{
        species: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
      }>
    }>(`/battle/opponent/${opponentId}`)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Start battle with opponent
   */
  async startBattle(opponentId: string, petId: string) {
    const response = await realApiClient.post<{
      battle: {
        id: string
        userId: string
        opponentId: string
        petId: string
        battleData: any
        completed: boolean
        victory: boolean | null
        createdAt: string
      }
      opponent: {
        id: string
        name: string
        level: number
        pets: Array<{
          species: string
          level: number
          hp: number
          maxHp: number
          attack: number
          defense: number
          speed: number
        }>
      }
      pet: {
        id: string
        species: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
      }
      message: string
    }>('/battle/start', {
      opponentId,
      petId,
    })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Complete battle
   */
  async completeBattle(battleId: string, victory: boolean, petId: string) {
    const response = await realApiClient.post<{
      battle: {
        id: string
        completed: boolean
        victory: boolean
      }
      rewards?: {
        coins: number
        xp: number
      }
      levelUp?: boolean
      newStats?: {
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
      }
      statChanges?: {
        maxHp: number
        attack: number
        defense: number
        speed: number
      }
      message: string
    }>('/battle/complete', {
      battleId,
      victory,
      petId,
    })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Get battle history
   */
  async getBattleHistory() {
    const response = await realApiClient.get<Array<{
      id: string
      userId: string
      opponentId: string
      petId: string
      completed: boolean
      victory: boolean | null
      createdAt: string
      opponent: {
        id: string
        name: string
        level: number
      }
      pet: {
        id: string
        species: string
        level: number
      }
    }>>('/battle/history')

    return {
      success: true,
      data: response,
    }
  },
}
