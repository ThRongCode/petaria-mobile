/**
 * API Service - Exports
 * 
 * Central export point for all API-related functionality
 */

export { apiClient } from './client'
export { API_CONFIG } from './config'
export * from './types'

// Real API services
export { authApi } from './authApi'
export { userApi } from './userApi'
export { petApi } from './petApi'
export { huntApi } from './huntApi'
export { battleApi } from './battleApi'
export { itemApi } from './itemApi'
export { questApi } from './questApi'
export { eventApi } from './eventApi'
export { configApi } from './configApi'
export { realApiClient } from './realApiClient'
