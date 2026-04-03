/**
 * API Request/Response Types
 */

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Request options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
  requiresAuth?: boolean
}

// API Error
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
}

export interface DailyLoginReward {
  day: number
  coins: number
  gems: number
  huntTickets: number
  battleTickets: number
  label: string
}

export interface DailyLoginResult {
  claimed: boolean
  alreadyClaimed: boolean
  currentStreak: number
  reward: DailyLoginReward | null
  nextReward: DailyLoginReward | null
  totalLogins: number
}

export interface AuthResponse {
  token: string
  userId: string
  username: string
  email: string
  user?: {
    id: string
    email: string
    username: string
    level: number
    xp: number
    coins: number
    gems: number
    huntTickets: number
    battleTickets: number
    lastHuntTicketRegen: string
    lastBattleTicketRegen: string
    petCount: number
    itemCount: number
  }
  dailyLogin?: DailyLoginResult
}

// Hunt types
export interface HuntStartRequest {
  regionId: string
}

export interface HuntCompleteRequest {
  regionId: string
  caughtPetId?: string
}

export interface HuntResponse {
  success: boolean
  petCaught?: any
  xpGained: number
  cooldownEnd: number
  updatedCoins: number
}

// Battle types
export interface BattleStartRequest {
  opponentId: string
  playerPetId: string
}

export interface BattleCompleteRequest {
  battleId: string
  winner: 'player' | 'opponent'
  battleLog: any[]
  playerPetId: string
  opponentId: string
}

export interface BattleCompleteResponse {
  rewards: {
    coins: number
    xp: number
    items: string[]
  }
  updatedProfile: any
  battle: any
}

// Evolution types
export interface EvolutionPath {
  evolvesTo: string
  levelRequired: number
  itemRequired: string | null
  description?: string
  hasItem: boolean
  itemQuantity: number | null
}

export interface EvolutionOptions {
  petId: string
  species: string
  level: number
  canEvolve: boolean
  currentStage: number
  maxStage: number
  evolvesFrom: string | null
  availableEvolutions: EvolutionPath[]
}

export interface EvolutionResult {
  message: string
  previousSpecies: string
  newSpecies: string
  pet: {
    id: string
    species: string
    evolutionStage: number
    maxHp: number
    hp: number
    attack: number
    defense: number
    speed: number
  }
  itemUsed: string
  statsChanged: {
    maxHp: { from: number; to: number }
    attack: { from: number; to: number }
    defense: { from: number; to: number }
    speed: { from: number; to: number }
  }
}
