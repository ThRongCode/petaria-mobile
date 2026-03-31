import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, STORAGE_KEYS } from './config'
import { ApiError } from './types'
import { authEventEmitter } from './authEventEmitter'
import { logRequest, logResponse, logError } from './logger'

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

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.authToken) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${this.authToken}`
        }

        logRequest(config)
        return config
      },
      (error) => {
        logError('?', '?', undefined, error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logResponse(response)
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Expected errors that don't need noisy logging
        const isExpected404 = error.response?.status === 404 &&
          (error.config?.url?.includes('/hunt/session') ||
           error.config?.url?.includes('/battle/session'))
        const isExpected400 = error.response?.status === 400 &&
          (error.config?.url?.includes('/hunt/catch'))

        if (!isExpected404 && !isExpected400) {
          logError(
            error.config?.method,
            error.config?.url,
            error.response?.status,
            error.response?.data,
            error.config,
          )
        }

        // Handle 401 — session expired
        if (error.response?.status === 401 && originalRequest) {
          await this.clearAuth()
          authEventEmitter.emit('sessionExpired')

          throw new ApiError(
            'UNAUTHORIZED',
            'Session expired. Please login again.',
            401
          )
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const status = error.response.status
      const data: any = error.response.data

      return new ApiError(
        data?.error?.code || `HTTP_${status}`,
        data?.message || error.message || 'An error occurred',
        status,
        data?.error?.details
      )
    } else if (error.request) {
      return new ApiError(
        'NETWORK_ERROR',
        'Network error. Please check your connection.',
        0
      )
    } else {
      return new ApiError(
        'UNKNOWN_ERROR',
        error.message || 'An unknown error occurred',
        0
      )
    }
  }

  async setAuthToken(token: string | null) {
    this.authToken = token
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  async loadAuthToken() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      this.authToken = token
    }
    return token
  }

  async clearAuth() {
    this.authToken = null
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID)
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get(endpoint, { params })
    return response.data
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post(endpoint, data)
    return response.data
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put(endpoint, data)
    return response.data
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch(endpoint, data)
    return response.data
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete(endpoint)
    return response.data
  }
}

export const realApiClient = new RealApiClient()
