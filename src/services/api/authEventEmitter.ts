/**
 * Auth Event Emitter
 * Global event system to handle authentication events across the app
 */

type AuthEventCallback = () => void

class AuthEventEmitter {
  private listeners: Map<string, Set<AuthEventCallback>> = new Map()

  /**
   * Subscribe to an auth event
   */
  on(event: 'sessionExpired' | 'logout', callback: AuthEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Emit an auth event
   */
  emit(event: 'sessionExpired' | 'logout') {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback())
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.listeners.clear()
  }
}

// Export singleton instance
export const authEventEmitter = new AuthEventEmitter()

// Event types
export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'sessionExpired',
  LOGOUT: 'logout',
} as const
