import { realApiClient } from './realApiClient'

/**
 * Event API Service
 * Handles time-limited events with special spawns and bonuses
 */

// Event types
export interface EventSpawn {
  species: string
  rarity: string
  spawnRate: number
  minLevel: number
  maxLevel: number
  isGuaranteed: boolean
}

export interface EventConfig {
  spawnBonus?: number
  xpMultiplier?: number
  featuredSpecies?: string[]
  guaranteedEncounter?: string
}

export interface GameEvent {
  id: string
  name: string
  description: string
  type: 'hunt_boost' | 'rare_spawn' | 'double_xp' | 'special_hunt' | 'shiny_chance'
  startTime: string
  endTime: string
  timeRemaining: string
  regionId: string | null
  bannerUrl: string | null
  config: EventConfig
  spawns: EventSpawn[]
}

export interface UpcomingEvent {
  id: string
  name: string
  description: string
  type: string
  startTime: string
  endTime: string
  startsIn: string
  bannerUrl: string | null
}

export const eventApi = {
  /**
   * Get all currently active events
   */
  async getActiveEvents() {
    const response = await realApiClient.get<GameEvent[]>('/event/active')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get upcoming events (not started yet)
   */
  async getUpcomingEvents() {
    const response = await realApiClient.get<UpcomingEvent[]>('/event/upcoming')

    return {
      success: true,
      data: response,
    }
  },
}
