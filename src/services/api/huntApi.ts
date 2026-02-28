import { realApiClient } from './realApiClient'

/**
 * Hunt API Service
 * Handles hunting sessions, encounters, and pet catching
 */
export const huntApi = {
  /**
   * Get available regions
   */
  async getRegions() {
    if (__DEV__) console.log('🔵 [huntApi] getRegions() called')
    
    const response = await realApiClient.get<Array<{
      id: string
      name: string
      description: string
      difficulty: string
      energyCost: number
      coinsCost: number
      imageUrl: string
      unlockLevel: number
      locked: boolean
      featuredSpawns: Array<{
        species: string
        rarity: string
        spawnRate: number
      }>
      rareSpawns: Array<{
        species: string
        rarity: string
        spawnRate: number
      }>
    }>>('/region')

    if (__DEV__) console.log('🔵 [huntApi] Regions loaded:', response?.length || 0)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Start hunt session
   */
  async startHunt(regionId: string) {
    const response = await realApiClient.post<{
      session: {
        id: string
        userId: string
        regionId: string
        encountersData: any
        createdAt: string
        region: {
          id: string
          name: string
          description: string
          difficulty: string
          energyCost: number
          coinsCost: number
          imageUrl: string
          unlockLevel: number
        }
      }
      encounters: Array<{
        id: string
        species: string
        rarity: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
        caught: boolean
      }>
      movesLeft: number
      message: string
    }>('/hunt/start', { regionId })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Get current hunt session
   */
  async getSession() {
    const response = await realApiClient.get<{
      session: {
        id: string
        userId: string
        regionId: string
        encountersData: any
        createdAt: string
        region: {
          id: string
          name: string
          description: string
        }
      }
      encounters: Array<{
        id: string
        species: string
        rarity: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
        caught: boolean
      }>
      movesLeft: number
    }>('/hunt/session')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Attempt to catch pet
   */
  async attemptCatch(sessionId: string, encounterId: string, ballType: string = 'pokeball') {
    const response = await realApiClient.post<{
      success: boolean
      message: string
      pet?: {
        id: string
        species: string
        rarity: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
      }
    }>('/hunt/catch', {
      sessionId,
      encounterId,
      ballType,
    })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Flee from hunt
   */
  async flee(sessionId: string) {
    const response = await realApiClient.post<{
      message: string
    }>(`/hunt/flee/${sessionId}`)

    return {
      success: true,
      data: null,
      message: response.message,
    }
  },

  /**
   * Cancel hunt session
   */
  async cancelSession(sessionId: string) {
    const response = await realApiClient.delete<{
      message: string
    }>(`/hunt/session/${sessionId}`)

    return {
      success: true,
      data: null,
      message: response.message,
    }
  },

  /**
   * Make a move in the hunt session
   */
  async move(sessionId: string, direction: 'up' | 'down' | 'left' | 'right') {
    if (__DEV__) console.log('🔵 [huntApi] move()', { sessionId, direction })
    
    const response = await realApiClient.post<{
      direction: string
      movesLeft: number
      encounter: {
        id: string
        species: string
        rarity: string
        level: number
        hp: number
        maxHp: number
        attack: number
        defense: number
        speed: number
        caught: boolean
      } | null
      message: string
    }>('/hunt/move', { sessionId, direction })

    if (__DEV__) console.log('🔵 [huntApi] Move response received')

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Complete hunt session
   */
  async completeSession(sessionId: string) {
    const response = await realApiClient.post<{
      message: string
      region: string
      petsCaught: number
      totalEncounters: number
      xpEarned: number
      user: {
        level: number
        xp: number
        leveledUp: boolean
      }
    }>(`/hunt/complete/${sessionId}`)

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },
}
