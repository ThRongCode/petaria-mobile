import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, STORAGE_KEYS } from './config'
import { ApiError } from './types'
import { authEventEmitter } from './authEventEmitter'

/**
 * Real API Client using Axios
 * Handles authentication, request/response interceptors, and error handling
 */
class RealApiClient {
  private axiosInstance: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${this.authToken}`
        }

        // Log request in development
        if (__DEV__) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response in development
        if (__DEV__) {
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Determine if this is an expected error (not a real API issue)
        const isExpected404 = error.response?.status === 404 && 
          (error.config?.url?.includes('/hunt/session') || 
           error.config?.url?.includes('/battle/session'))
        
        // Expected 400 errors (user-facing validation like "no pokeballs")
        const isExpected400 = error.response?.status === 400 &&
          (error.config?.url?.includes('/hunt/catch'))
        
        // Only log unexpected errors in development
        if (__DEV__ && !isExpected404 && !isExpected400) {
          console.error('[API Response Error]', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
          })
        }

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401 && originalRequest) {
          // Clear auth token
          await this.clearAuth()
          
          // Emit session expired event for global handling
          authEventEmitter.emit('sessionExpired')
          
          throw new ApiError(
            'UNAUTHORIZED',
            'Session expired. Please login again.',
            401
          )
        }

        // Handle other errors
        return Promise.reject(this.handleError(error))
      }
    )
  }

  /**
   * Handle and transform axios errors to ApiError
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data: any = error.response.data

      return new ApiError(
        data?.error?.code || `HTTP_${status}`,
        data?.message || error.message || 'An error occurred',
        status,
        data?.error?.details
      )
    } else if (error.request) {
      // Request was made but no response received
      return new ApiError(
        'NETWORK_ERROR',
        'Network error. Please check your connection.',
        0
      )
    } else {
      // Something else happened
      return new ApiError(
        'UNKNOWN_ERROR',
        error.message || 'An unknown error occurred',
        0
      )
    }
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string | null) {
    this.authToken = token
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.authToken
  }

  /**
   * Load auth token from storage
   */
  async loadAuthToken() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      this.authToken = token
    }
    return token
  }

  /**
   * Clear authentication
   */
  async clearAuth() {
    this.authToken = null
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID)
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get(endpoint, { params })
    return response.data
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post(endpoint, data)
    return response.data
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put(endpoint, data)
    return response.data
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch(endpoint, data)
    return response.data
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete(endpoint)
    return response.data
  }
}

// Export singleton instance
export const realApiClient = new RealApiClient()
