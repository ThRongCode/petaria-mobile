/**
 * useCapture Hook
 * Single Responsibility: Handle Pokemon capture logic and animation state
 * 
 * This hook handles:
 * - Capture attempts via API
 * - Capture state management
 * - Animation state reset
 * - Error handling (including no pokeballs)
 */

import { useState, useCallback, useRef } from 'react'
import { Alert, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { huntApi } from '@/services/api'
import type { Encounter, CaptureState } from '../types'
import { isNoPokeBallsError } from '../utils'

interface UseCaptureOptions {
  sessionId: string | undefined
  onCaptureSuccess: (encounterId: string) => void
  onEncounterClose: () => void
}

interface UseCaptureReturn {
  // State
  isCapturing: boolean
  captureState: CaptureState
  
  // Animation refs
  pokeballAnim: Animated.Value
  shakeAnim: Animated.Value
  pokemonOpacity: Animated.Value
  pokemonScale: Animated.Value
  sparkleAnim: Animated.Value
  
  // Actions
  attemptCapture: (encounter: Encounter) => Promise<boolean>
  resetCaptureAnimations: () => void
}

export const useCapture = ({
  sessionId,
  onCaptureSuccess,
  onEncounterClose,
}: UseCaptureOptions): UseCaptureReturn => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Capture state
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  
  // Animation values
  const pokeballAnim = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pokemonOpacity = useRef(new Animated.Value(1)).current
  const pokemonScale = useRef(new Animated.Value(1)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current

  // Reset all animation values
  const resetCaptureAnimations = useCallback(() => {
    pokeballAnim.setValue(0)
    shakeAnim.setValue(0)
    pokemonOpacity.setValue(1)
    pokemonScale.setValue(1)
    sparkleAnim.setValue(0)
    setCaptureState('idle')
  }, [pokeballAnim, shakeAnim, pokemonOpacity, pokemonScale, sparkleAnim])

  // Refresh user profile to update pokeball count
  const refreshProfile = useCallback(() => {
    dispatch(gameActions.loadUserData())
  }, [dispatch])

  // Main capture function
  const attemptCapture = useCallback(async (encounter: Encounter): Promise<boolean> => {
    if (!encounter || encounter.caught || !sessionId || isCapturing) {
      return false
    }

    console.log('🎯 Attempting to catch:', encounter.species)
    setIsCapturing(true)
    setCaptureState('throwing')

    // Clone encounter data to preserve for retry
    const speciesName = encounter.species
    const encounterId = encounter.id
    const encounterData = { ...encounter }

    try {
      // Call API with minimum delay for UX
      const [result] = await Promise.all([
        huntApi.attemptCatch(sessionId, encounterId, 'pokeball'),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ])

      console.log('✅ Catch result:', result)

      // Reset capture state
      setIsCapturing(false)
      setCaptureState('idle')
      resetCaptureAnimations()

      // Refresh profile to update pokeball count
      refreshProfile()

      if (result.success && result.data) {
        const catchSuccess = result.data.success === true && result.data.pet != null

        if (catchSuccess) {
          // Success - notify parent and close
          onCaptureSuccess(encounterId)
          onEncounterClose()

          Alert.alert(
            '🎉 Capture Successful!',
            `You caught ${speciesName}!\nIt has been added to your collection.`,
            [{ text: 'Awesome!' }]
          )
          return true
        } else {
          // Failed - show retry options
          handleCaptureFailure(speciesName, encounterData, result.data.message)
          return false
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.')
        return false
      }
    } catch (error) {
      // Reset states
      setIsCapturing(false)
      setCaptureState('idle')
      resetCaptureAnimations()

      // Refresh profile in case pokeball was deducted
      refreshProfile()

      handleCaptureError(error, encounterData)
      return false
    }
  }, [sessionId, isCapturing, resetCaptureAnimations, refreshProfile, onCaptureSuccess, onEncounterClose])

  // Handle capture failure (Pokemon escaped and runs away - no retry)
  const handleCaptureFailure = useCallback((
    speciesName: string,
    _encounterData: Encounter,
    message?: string
  ) => {
    onEncounterClose()

    Alert.alert(
      '💨 It Ran Away!',
      message || `${speciesName} broke free and escaped! The wild Pokemon fled.`,
      [{ text: 'Continue Hunting' }]
    )
  }, [onEncounterClose])

  // Handle capture errors
  const handleCaptureError = useCallback((error: unknown, encounterData: Encounter) => {
    if (isNoPokeBallsError(error)) {
      console.log('ℹ️ User has no pokeballs')
      onEncounterClose()

      Alert.alert(
        'Out of Pokéballs!',
        'You need Pokéballs to catch Pokémon. Visit the Shop to purchase more.',
        [
          { text: 'Continue Hunting' },
          {
            text: 'Go to Shop',
            onPress: () => router.replace('/shop'),
          },
        ]
      )
    } else {
      console.error('❌ Error attempting catch:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to catch Pokemon'
      Alert.alert('Error', errorMessage)
    }
  }, [router, onEncounterClose])

  return {
    isCapturing,
    captureState,
    pokeballAnim,
    shakeAnim,
    pokemonOpacity,
    pokemonScale,
    sparkleAnim,
    attemptCapture,
    resetCaptureAnimations,
  }
}
