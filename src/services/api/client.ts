import { API_CONFIG } from './config'
import { mockApi } from './mockApi'
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
    const url = `${API_CONFIG.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || { code: 'UNKNOWN', message: `Request failed with status ${response.status}` },
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: { code: 'TIMEOUT', message: 'Request timeout' },
          }
        }
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
