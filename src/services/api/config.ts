/**
 * API Configuration
 * Toggle useMock to switch between mock and real backend
 */

export const API_CONFIG = {
  // Set to false when real backend is ready
  useMock: true,
  
  // Real backend URL (for future)
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api'
    : 'https://api.vnpeteria.com/api',
  
  // Request timeout
  timeout: 10000,
  
  // Simulated network delay for mock (ms)
  mockDelay: {
    min: 300,
    max: 800,
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
  },
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_ID: '@user_id',
}
