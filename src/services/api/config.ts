/**
 * API Configuration
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || (__DEV__ ? 'http://localhost:3000/api' : 'https://api.vnpeteria.com/api')

export const API_CONFIG = {
  baseURL: API_BASE_URL,

  /** Request timeout in milliseconds (60s to handle Render free tier cold starts) */
  timeout: 60000,

  /** Retry configuration */
  retry: {
    attempts: 3,
    delay: 1000,
  },
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_ID: '@user_id',
}
