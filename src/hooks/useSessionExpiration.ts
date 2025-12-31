import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useDispatch } from 'react-redux'
import { authEventEmitter } from '@/services/api/authEventEmitter'
import { userActions } from '@/stores/reducers/user'
import { RouteKeys } from '@/routes/RouteKeys'

/**
 * Hook to handle session expiration globally
 * Should be used in the root layout or main app component
 */
export function useSessionExpiration() {
  const router = useRouter()
  const dispatch = useDispatch()
  const isHandlingExpiration = useRef(false)

  useEffect(() => {
    // Subscribe to session expired events
    const unsubscribe = authEventEmitter.on('sessionExpired', () => {
      // Prevent multiple alerts if multiple 401s fire simultaneously
      if (isHandlingExpiration.current) {
        return
      }
      isHandlingExpiration.current = true

      // Clear Redux auth state
      dispatch(userActions.logout())

      // Show alert and redirect to login
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              isHandlingExpiration.current = false
              router.replace(RouteKeys.SignIn)
            },
          },
        ],
        { cancelable: false }
      )
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [dispatch, router])
}
