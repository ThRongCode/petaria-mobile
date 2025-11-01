import { realApiClient } from './realApiClient'
import type { LoginRequest, RegisterRequest } from './types'

/**
 * Authentication API Service
 * Handles login, register, and token validation
 */
export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest) {
    const response = await realApiClient.post<{
      accessToken: string
      user: {
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
    }>('/auth/login', credentials)

    // Save token
    await realApiClient.setAuthToken(response.accessToken)

    return {
      success: true,
      data: {
        token: response.accessToken,
        userId: response.user.id,
        username: response.user.username,
        email: response.user.email,
        user: response.user,
      },
    }
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest) {
    const response = await realApiClient.post<{
      accessToken: string
      user: {
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
    }>('/auth/register', userData)

    // Save token
    await realApiClient.setAuthToken(response.accessToken)

    return {
      success: true,
      data: {
        token: response.accessToken,
        userId: response.user.id,
        username: response.user.username,
        email: response.user.email,
        user: response.user,
      },
    }
  },

  /**
   * Validate current token
   */
  async validateToken(token: string) {
    await realApiClient.setAuthToken(token)
    
    try {
      // Backend doesn't have explicit validate endpoint, so we'll get user profile
      const response = await realApiClient.get<{
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
        battlesWon: number
        battlesLost: number
        huntsCompleted: number
        createdAt: string
        updatedAt: string
      }>('/user/profile')

      return {
        success: true,
        data: {
          valid: true,
          userId: response.id,
          username: response.username,
          email: response.email,
          user: response,
        },
      }
    } catch (error) {
      return {
        success: false,
        data: {
          valid: false,
        },
      }
    }
  },

  /**
   * Logout user
   */
  async logout() {
    await realApiClient.clearAuth()
    return {
      success: true,
      data: null,
    }
  },
}
