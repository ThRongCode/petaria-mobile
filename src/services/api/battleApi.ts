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
      session: {
        id: string
        userId: string
        opponentId: string
        petId: string
        battleType: string
        createdAt: string
      }
      opponent: {
        id: string
        name: string
        level: number
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
      data: {
        battle: response.session, // Map session to battle for backward compatibility
        opponent: response.opponent,
        pet: response.pet,
        message: response.message,
      },
      message: response.message,
    }
  },

  /**
   * Complete battle
   */
  async completeBattle(
    sessionId: string, 
    won: boolean, 
    damageDealt: number, 
    damageTaken: number,
    finalHp: number
  ) {
    const response = await realApiClient.post<{
      won: boolean
      xpReward: number
      coinReward: number
      pet: {
        leveledUp: boolean
        newLevel: number
        currentHp: number
        statChanges?: {
          maxHp: number
          attack: number
          defense: number
          speed: number
        }
      }
      user: {
        leveledUp: boolean
        newLevel: number
      }
      message: string
    }>('/battle/complete', {
      sessionId,
      won,
      damageDealt,
      damageTaken,
      finalHp,
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
