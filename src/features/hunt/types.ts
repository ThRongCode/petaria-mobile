/**
 * Hunt Feature Types
 * Single Responsibility: Define all types for the hunt feature
 */

// Backend encounter type from API
export interface Encounter {
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
}

// Hunt session from API
export interface HuntSession {
  id: string
  userId: string
  regionId: string
  encountersData: unknown
  createdAt: string
  region: {
    id: string
    name: string
    description: string
  }
}

// Region from API
export interface Region {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  energyCost: number
  coinsCost: number
  imageUrl: string
  unlockLevel: number
}

// Capture animation state
export type CaptureState = 'idle' | 'throwing' | 'shaking' | 'success' | 'failed'

// Direction for movement
export type Direction = 'up' | 'down' | 'left' | 'right'

// Session rewards tracking
export interface SessionRewards {
  totalXp: number
  totalCoins: number
  petsFound: number
  itemsFound: number
}

// Hunt session params from navigation
export interface HuntSessionParams {
  sessionId?: string
  regionName?: string
  regionId?: string
}

// Capture result from API
export interface CaptureResult {
  success: boolean
  message: string
  pet?: {
    id: string
    species: string
    rarity: string
    level: number
  }
}

// Move result from API
export interface MoveResult {
  direction: string
  movesLeft: number
  encounter: Encounter | null
  message: string
}
