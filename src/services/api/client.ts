import { API_CONFIG } from './config'
import { mockApi } from './mockApi'
import { authApi } from './authApi'
import { userApi } from './userApi'
import { petApi } from './petApi'
import { huntApi } from './huntApi'
import { battleApi } from './battleApi'
import { itemApi } from './itemApi'
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  HuntStartRequest,
  HuntResponse,
  BattleCompleteRequest,
  BattleCompleteResponse,
  CreateAuctionRequest,
  PlaceBidRequest,
} from './types'
import type { Pet, Region, Item, Auction, Battle } from '@/stores/types/game'

/**
 * Unified API client that switches between mock and real API based on configuration
 */
class ApiClient {
  private authToken: string | null = null
  private userId: string | null = null

  setAuthToken(token: string | null, userId: string | null = null) {
    this.authToken = token
    this.userId = userId
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  getUserId(): string | null {
    return this.userId
  }

  /**
   * Make API request - switches between mock and real based on config
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<ApiResponse<T>> {
    if (API_CONFIG.useMock) {
      // Use mock API
      return this.mockRequest<T>(endpoint, method, body)
    } else {
      // Use real API
      return this.realRequest<T>(endpoint, method, body)
    }
  }

  /**
   * Route request to mock API
   */
  private async mockRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<ApiResponse<T>> {
    // Route to appropriate mock API function based on endpoint
    const [path, ...rest] = endpoint.split('?')
    const segments = path.split('/').filter(Boolean)

    // Endpoints that don't require authentication
    const publicEndpoints = ['auth', 'items']
    const isPublicEndpoint = publicEndpoints.includes(segments[0])
    const isItemsCatalog = segments[0] === 'items' && method === 'GET' && !segments[1]

    if (!this.userId && !isPublicEndpoint) {
      throw new Error('Not authenticated')
    }

    // Auth endpoints
    if (segments[0] === 'auth') {
      if (segments[1] === 'login' && method === 'POST') {
        return mockApi.login(body) as Promise<ApiResponse<T>>
      }
      if (segments[1] === 'register' && method === 'POST') {
        return mockApi.register(body) as Promise<ApiResponse<T>>
      }
      if (segments[1] === 'validate' && method === 'GET') {
        if (!this.authToken) throw new Error('No token to validate')
        return mockApi.validateToken(this.authToken) as Promise<ApiResponse<T>>
      }
    }

    // Profile endpoints
    if (segments[0] === 'profile' && method === 'GET') {
      return mockApi.getUserProfile(this.userId!) as Promise<ApiResponse<T>>
    }
    if (segments[0] === 'profile' && method === 'PUT') {
      return mockApi.updateUserProfile(this.userId!, body) as Promise<ApiResponse<T>>
    }

    // Inventory endpoints
    if (segments[0] === 'inventory' && method === 'GET') {
      return mockApi.getUserInventory(this.userId!) as Promise<ApiResponse<T>>
    }

    // Pet endpoints
    if (segments[0] === 'pets') {
      if (method === 'GET' && !segments[1]) {
        return mockApi.getUserPets(this.userId!) as Promise<ApiResponse<T>>
      }
      if (method === 'GET' && segments[1]) {
        return mockApi.getPetDetails(segments[1]) as Promise<ApiResponse<T>>
      }
      if (method === 'PUT' && segments[1]) {
        return mockApi.updatePet(segments[1], body) as Promise<ApiResponse<T>>
      }
      if (method === 'POST' && segments[1] === 'feed' && segments[2]) {
        return mockApi.feedPet(segments[2]) as Promise<ApiResponse<T>>
      }
      if (method === 'POST' && segments[1] === 'release') {
        return mockApi.releasePet(body.petId, this.userId!) as Promise<ApiResponse<T>>
      }
    }

    // Region endpoints
    if (segments[0] === 'regions' && method === 'GET') {
      return mockApi.getRegions() as Promise<ApiResponse<T>>
    }

    // Hunt endpoints
    if (segments[0] === 'hunt' && method === 'POST') {
      return mockApi.startHunt(body, this.userId!) as Promise<ApiResponse<T>>
    }

    // Opponent endpoints
    if (segments[0] === 'opponents' && method === 'GET') {
      return mockApi.getOpponents() as Promise<ApiResponse<T>>
    }

    // Battle endpoints
    if (segments[0] === 'battle') {
      if (segments[1] === 'complete' && method === 'POST') {
        return mockApi.completeBattle(body, this.userId!) as Promise<ApiResponse<T>>
      }
      if (segments[1] === 'history' && method === 'GET') {
        return mockApi.getBattleHistory(this.userId!) as Promise<ApiResponse<T>>
      }
    }

    // Item endpoints
    if (segments[0] === 'items') {
      if (method === 'GET') {
        return mockApi.getItemsCatalog() as Promise<ApiResponse<T>>
      }
      if (segments[1] === 'use' && method === 'POST') {
        return mockApi.useItemOnPet(body.itemId, body.petId, this.userId!) as Promise<ApiResponse<T>>
      }
    }

    // Game endpoints
    if (segments[0] === 'game') {
      if (segments[1] === 'heal-center' && method === 'POST') {
        return mockApi.healAllPets(body.userId) as Promise<ApiResponse<T>>
      }
    }

    // Inventory endpoints
    if (segments[0] === 'inventory') {
      if (segments[1] === 'info' && method === 'GET') {
        return mockApi.getInventoryInfo(body.userId || this.userId!) as Promise<ApiResponse<T>>
      }
    }

    // Auction endpoints
    if (segments[0] === 'auctions') {
      if (method === 'GET') {
        return mockApi.getActiveAuctions() as Promise<ApiResponse<T>>
      }
      if (method === 'POST') {
        return mockApi.createAuction(body, this.userId!) as Promise<ApiResponse<T>>
      }
      if (method === 'DELETE' && segments[1]) {
        // cancelAuction not implemented yet in mockApi
        throw new Error('Cancel auction not yet implemented')
      }
    }

    // Bid endpoints
    if (segments[0] === 'auction' && segments[1] === 'bid' && method === 'POST') {
      return mockApi.placeBid(body, this.userId!) as Promise<ApiResponse<T>>
    }

    throw new Error(`Mock API endpoint not implemented: ${method} ${endpoint}`)
  }

  /**
   * Make request to real API server
   */
  private async realRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Parse endpoint to route to appropriate service
      const [path, ...rest] = endpoint.split('?')
      const segments = path.split('/').filter(Boolean)

      // Auth endpoints
      if (segments[0] === 'auth') {
        if (segments[1] === 'login' && method === 'POST') {
          const result = await authApi.login({ email: body.email, password: body.password })
          if (result.success) {
            this.setAuthToken(result.data.token, result.data.userId)
          }
          return result as ApiResponse<T>
        }
        if (segments[1] === 'register' && method === 'POST') {
          const result = await authApi.register({ 
            email: body.email, 
            password: body.password, 
            username: body.username 
          })
          if (result.success) {
            this.setAuthToken(result.data.token, result.data.userId)
          }
          return result as ApiResponse<T>
        }
        if (segments[1] === 'validate' && method === 'GET') {
          const result = await authApi.validateToken(this.authToken!)
          return result as ApiResponse<T>
        }
      }

      // Profile endpoints (user)
      if (segments[0] === 'profile') {
        if (method === 'GET') {
          const result = await userApi.getProfile()
          return result as ApiResponse<T>
        }
        if (method === 'PUT') {
          const result = await userApi.updateProfile(body)
          return result as ApiResponse<T>
        }
      }

      // Inventory endpoints (user)
      if (segments[0] === 'inventory') {
        if (method === 'GET' && !segments[1]) {
          const result = await userApi.getInventory()
          return result as ApiResponse<T>
        }
        if (segments[1] === 'info' && method === 'GET') {
          // Map to getProfile which returns petCount/itemCount
          const result = await userApi.getProfile()
          if (result.success) {
            return {
              success: true,
              data: {
                pets: { current: result.data.petCount, max: 100 },
                items: { current: result.data.itemCount, max: 500 },
              },
            } as ApiResponse<T>
          }
          return result as ApiResponse<T>
        }
      }

      // Pet endpoints
      if (segments[0] === 'pets') {
        if (method === 'GET' && !segments[1]) {
          const result = await petApi.getUserPets()
          return result as ApiResponse<T>
        }
        if (method === 'GET' && segments[1]) {
          const result = await petApi.getPetDetails(segments[1])
          return result as ApiResponse<T>
        }
        if (method === 'PUT' && segments[1]) {
          const result = await petApi.updatePet(segments[1], body)
          return result as ApiResponse<T>
        }
        if (method === 'POST' && segments[1] === 'feed' && segments[2]) {
          const result = await petApi.feedPet(segments[2])
          return result as ApiResponse<T>
        }
        if (method === 'POST' && segments[1] === 'release') {
          const result = await petApi.releasePet(body.petId)
          return {
            success: result.success,
            data: { coinsEarned: 0 } as any, // Backend doesn't return coins for release
          } as ApiResponse<T>
        }
      }

      // Region endpoints (hunt)
      if (segments[0] === 'regions' && method === 'GET') {
        const result = await huntApi.getRegions()
        return result as ApiResponse<T>
      }

      // Hunt endpoints
      if (segments[0] === 'hunt') {
        if (method === 'POST' && !segments[1]) {
          const result = await huntApi.startHunt(body.regionId)
          return result as ApiResponse<T>
        }
      }

      // Opponent endpoints (battle)
      if (segments[0] === 'opponents' && method === 'GET') {
        const result = await battleApi.listOpponents()
        return result as ApiResponse<T>
      }

      // Battle endpoints
      if (segments[0] === 'battle') {
        if (segments[1] === 'complete' && method === 'POST') {
          // Map old battle complete format to new format
          const victory = body.winner === 'player'
          const result = await battleApi.completeBattle(body.battleId, victory, body.playerPetId)
          return result as ApiResponse<T>
        }
        if (segments[1] === 'history' && method === 'GET') {
          const result = await battleApi.getBattleHistory()
          return result as ApiResponse<T>
        }
      }

      // Item endpoints
      if (segments[0] === 'items') {
        if (method === 'GET' && !segments[1]) {
          const result = await itemApi.getCatalog()
          return result as ApiResponse<T>
        }
        if (segments[1] === 'use' && method === 'POST') {
          const result = await itemApi.useItem(body.itemId, body.petId)
          return result as ApiResponse<T>
        }
      }

      // Game endpoints
      if (segments[0] === 'game') {
        if (segments[1] === 'heal-center' && method === 'POST') {
          // Heal center not implemented in backend - would need to loop through pets
          // For now, return mock response
          return {
            success: true,
            data: { healedCount: 0 },
          } as ApiResponse<T>
        }
      }

      // Auction endpoints - not implemented in backend yet
      if (segments[0] === 'auctions' || segments[0] === 'auction') {
        return {
          success: false,
          error: { code: 'NOT_IMPLEMENTED', message: 'Auction system not yet implemented in backend' },
        }
      }

      return {
        success: false,
        error: { code: 'NOT_FOUND', message: `Real API endpoint not found: ${method} ${endpoint}` },
      }
    } catch (error) {
      console.error('Real API request error:', error)
      if (error instanceof Error) {
        return {
          success: false,
          error: { code: 'NETWORK_ERROR', message: error.message },
        }
      }
      return {
        success: false,
        error: { code: 'UNKNOWN', message: 'Unknown error occurred' },
      }
    }
  }

  // ========== Public API Methods ==========

  /**
   * Authentication
   */
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', 'POST', {
      email,
      password,
    })
    if (response.success && response.data) {
      this.setAuthToken(response.data.token, response.data.userId)
    }
    return response
  }

  async register(email: string, password: string, username: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', 'POST', {
      email,
      password,
      username,
    })
    if (response.success && response.data) {
      this.setAuthToken(response.data.token, response.data.userId)
    }
    return response
  }

  async validateToken(): Promise<ApiResponse<{ userId: string }>> {
    return this.request<{ userId: string }>('/auth/validate', 'GET')
  }

  async logout(): Promise<void> {
    this.setAuthToken(null, null)
  }

  /**
   * User Profile
   */
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/profile', 'GET')
  }

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    return this.request<any>('/profile', 'PUT', updates)
  }

  /**
   * Inventory
   */
  async getInventory(): Promise<ApiResponse<any>> {
    return this.request<any>('/inventory', 'GET')
  }

  /**
   * Pets
   */
  async getPets(): Promise<ApiResponse<Pet[]>> {
    return this.request<Pet[]>('/pets', 'GET')
  }

  async getPetDetails(petId: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/pets/${petId}`, 'GET')
  }

  async updatePet(petId: string, updates: Partial<Pet>): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/pets/${petId}`, 'PUT', updates)
  }

  async feedPet(petId: string): Promise<ApiResponse<Pet>> {
    return this.request<Pet>(`/pets/feed/${petId}`, 'POST')
  }

  /**
   * Hunting
   */
  async getRegions(): Promise<ApiResponse<Region[]>> {
    return this.request<Region[]>('/regions', 'GET')
  }

  async startHunt(regionId: string): Promise<ApiResponse<HuntResponse>> {
    return this.request<HuntResponse>('/hunt', 'POST', { regionId })
  }

  /**
   * Battles
   */
  async getOpponents(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/opponents', 'GET')
  }

  async completeBattle(
    battleId: string,
    winner: 'player' | 'opponent',
    battleLog: any[],
    playerPetId: string,
    opponentId: string
  ): Promise<ApiResponse<BattleCompleteResponse>> {
    return this.request<BattleCompleteResponse>('/battle/complete', 'POST', {
      battleId,
      winner,
      battleLog,
      playerPetId,
      opponentId,
    })
  }

  async getBattleHistory(): Promise<ApiResponse<Battle[]>> {
    return this.request<Battle[]>('/battle/history', 'GET')
  }

  /**
   * Items
   */
  async getItemsCatalog(): Promise<ApiResponse<Item[]>> {
    return this.request<Item[]>('/items', 'GET')
  }

  async useItemOnPet(
    itemId: string,
    petId: string
  ): Promise<ApiResponse<{ pet: Pet; message: string }>> {
    return this.request<{ pet: Pet; message: string }>('/items/use', 'POST', {
      itemId,
      petId,
    })
  }

  /**
   * Heal all user's Pokemon to full HP
   */
  async healAllPets(userId: string): Promise<ApiResponse<{ healedCount: number }>> {
    return this.request<{ healedCount: number }>('/game/heal-center', 'POST', {
      userId,
    })
  }

  /**
   * Release a Pokemon and get coin reward
   */
  async releasePet(petId: string): Promise<ApiResponse<{ coinsEarned: number }>> {
    return this.request<{ coinsEarned: number }>('/pets/release', 'POST', {
      petId,
    })
  }

  /**
   * Get inventory limits and current counts
   */
  async getInventoryInfo(userId: string): Promise<ApiResponse<{
    pets: { current: number; max: number }
    items: { current: number; max: number }
  }>> {
    return this.request<{
      pets: { current: number; max: number }
      items: { current: number; max: number }
    }>('/inventory/info', 'GET', { userId })
  }

  /**
   * Auctions
   */
  async getAuctions(): Promise<ApiResponse<Auction[]>> {
    return this.request<Auction[]>('/auctions', 'GET')
  }

  async createAuction(
    itemType: 'pet' | 'item',
    itemId: string,
    startingBid: number,
    duration: number,
    buyoutPrice?: number
  ): Promise<ApiResponse<Auction>> {
    return this.request<Auction>('/auctions', 'POST', {
      itemType,
      itemId,
      startingBid,
      duration,
      buyoutPrice,
    })
  }

  async placeBid(auctionId: string, amount: number): Promise<ApiResponse<Auction>> {
    return this.request<Auction>('/auction/bid', 'POST', {
      auctionId,
      amount,
    })
  }

  async cancelAuction(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/auctions/${auctionId}`, 'DELETE')
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
