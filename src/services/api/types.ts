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
    lastTicketReset: string
    petCount: number
    itemCount: number
  }
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

// Auction types
export interface CreateAuctionRequest {
  itemType: 'pet' | 'item'
  itemId: string
  startingBid: number
  buyoutPrice?: number
  duration: number // hours
}

export interface PlaceBidRequest {
  auctionId: string
  amount: number
}
