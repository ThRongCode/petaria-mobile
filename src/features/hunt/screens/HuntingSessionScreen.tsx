/**
 * HuntingSessionScreen — "Lapis Glassworks" redesign
 *
 * Full-screen immersive hunting session with glass panels, explorer area,
 * D-pad controls, and pause/exit.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React, { useCallback, useState } from 'react'
import { StyleSheet, View, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getUserCurrency, getUserProfile } from '@/stores/selectors'
import { CustomAlert, LoadingContainer } from '@/components/ui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { colors } from '@/themes/colors'
import { spacing } from '@/themes/metrics'

// Feature-module imports
import {
  useHuntSession,
  useCapture,
  EncounterModal,
  DirectionControls,
  SessionStats,
  SessionHeader,
  SessionActions,
  Direction,
} from '../index'

export const HuntingSessionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ sessionId?: string; regionName?: string; regionId?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)

  // Custom alert state
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message?: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  }>({ title: '' })

  // Hunt session hook
  const {
    session,
    movesLeft,
    isLoading,
    isMoving,
    sessionRewards,
    makeMove,
    completeSession,
    exitSession,
    currentEncounter,
    setCurrentEncounter,
    showEncounter,
    setShowEncounter,
    updateEncounterAsCaught,
    incrementPetsFound,
  } = useHuntSession({ params })

  // Capture hook
  const {
    isCapturing,
    captureState,
    pokeballAnim,
    shakeAnim,
    pokemonOpacity,
    pokemonScale,
    sparkleAnim,
    attemptCapture,
    resetCaptureAnimations,
  } = useCapture({
    sessionId: session?.id,
    onCaptureSuccess: (encounterId) => {
      updateEncounterAsCaught(encounterId)
      incrementPetsFound()
    },
    onEncounterClose: () => {
      setShowEncounter(false)
      setCurrentEncounter(null)
    },
  })

  // Handle movement
  const handleMove = useCallback(async (direction: Direction) => {
    const encounter = await makeMove(direction)

    if (!encounter) {
      if (movesLeft - 1 === 0) {
        setTimeout(() => {
          Alert.alert(
            'Out of Moves!',
            "You've used all your moves. Time to complete the session.",
            [{ text: 'Complete Session', onPress: completeSession }],
          )
        }, 300)
      } else {
        Alert.alert(
          '🔍 Nothing Here',
          'You searched the area but found nothing. Keep exploring!',
          [{ text: 'Continue' }],
        )
      }
    }
  }, [makeMove, movesLeft, completeSession])

  // Handle capture attempt
  const handleCapture = useCallback(async () => {
    if (!currentEncounter) return
    await attemptCapture(currentEncounter)
  }, [currentEncounter, attemptCapture])

  // Handle flee
  const handleFlee = useCallback(() => {
    const encounterData = currentEncounter ? { ...currentEncounter } : null
    setShowEncounter(false)

    Alert.alert(
      'Run Away?',
      'Are you sure you want to run away from this Pokémon?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (encounterData) {
              setCurrentEncounter(encounterData)
              setShowEncounter(true)
            }
          },
        },
        {
          text: 'Run Away',
          style: 'destructive',
          onPress: () => {
            setCurrentEncounter(null)
            resetCaptureAnimations()
          },
        },
      ],
    )
  }, [currentEncounter, setShowEncounter, setCurrentEncounter, resetCaptureAnimations])

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
        <LoadingContainer message="Starting hunt session..." />
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header + Stats */}
        <SessionHeader
          session={session}
          regionName={params.regionName}
          movesLeft={movesLeft}
          onComplete={completeSession}
          onExit={exitSession}
        />

        <SessionStats rewards={sessionRewards} />

        {/* Explorer + D-Pad + Exit */}
        <DirectionControls
          onMove={handleMove}
          disabled={isMoving || movesLeft <= 0}
          isMoving={isMoving}
        />

        {/* Session Actions (Pause/Complete) */}
        <SessionActions
          movesLeft={movesLeft}
          onComplete={completeSession}
          onExit={exitSession}
        />
      </ScrollView>

      {/* Encounter Modal */}
      <EncounterModal
        visible={showEncounter}
        encounter={currentEncounter}
        isCapturing={isCapturing}
        captureState={captureState}
        pokeballAnim={pokeballAnim}
        pokemonOpacity={pokemonOpacity}
        pokemonScale={pokemonScale}
        shakeAnim={shakeAnim}
        sparkleAnim={sparkleAnim}
        onCapture={handleCapture}
        onFlee={handleFlee}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setShowAlert(false)}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
})
