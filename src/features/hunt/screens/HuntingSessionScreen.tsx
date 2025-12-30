/**
 * HuntingSessionScreen (Refactored)
 * 
 * This is a clean, SOLID-compliant version of the hunting session screen.
 * It uses the modular hunt feature components and hooks.
 * 
 * To use this version, update the import in app/hunting-session.tsx:
 * - from: import { HuntingSessionScreen } from '@/screens/game'
 * - to:   import { HuntingSessionScreen } from '@/features/hunt/screens/HuntingSessionScreen'
 */

import React, { useCallback, useState } from 'react'
import { StyleSheet, View, ImageBackground, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSelector } from 'react-redux'
import { getUserCurrency, getUserProfile } from '@/stores/selectors'
import { TopBar, CustomAlert } from '@/components/ui'
import { ThemedText } from '@/components'

// Import from hunt feature module
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
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)

  // Custom alert state
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message?: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  }>({ title: '' })

  // Use hunt session hook
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

  // Use capture hook
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
    
    // Show dialog when nothing happens (no encounter found)
    if (!encounter) {
      // Check if out of moves after this move
      if (movesLeft - 1 === 0) {
        setTimeout(() => {
          Alert.alert(
            'Out of Moves!',
            "You've used all your moves. Time to complete the session.",
            [{ text: 'Complete Session', onPress: completeSession }]
          )
        }, 300)
      } else {
        // Show "nothing happened" dialog
        Alert.alert(
          '🔍 Nothing Here',
          'You searched the area but found nothing. Keep exploring!',
          [{ text: 'Continue' }]
        )
      }
    }
  }, [makeMove, movesLeft, completeSession])

  // Handle capture attempt
  const handleCapture = useCallback(async () => {
    if (!currentEncounter) return
    
    const success = await attemptCapture(currentEncounter)
    // Result is handled by the hook
  }, [currentEncounter, attemptCapture])

  // Handle flee
  const handleFlee = useCallback(() => {
    // Store encounter data before closing
    const encounterData = currentEncounter ? { ...currentEncounter } : null
    
    setShowEncounter(false)
    
    Alert.alert(
      'Run Away?',
      'Are you sure you want to run away from this Pokemon?',
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
      ]
    )
  }, [currentEncounter, setShowEncounter, setCurrentEncounter, resetCaptureAnimations])

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <ThemedText style={styles.loadingText}>Loading hunt session...</ThemedText>
      </View>
    )
  }

  return (
    <ImageBackground
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Top Bar */}
      <TopBar
        username={profile?.username || 'Trainer'}
        coins={currency?.coins || 0}
        gems={currency?.gems || 0}
        pokeballs={currency?.pokeballs || 0}
        energy={80}
        maxEnergy={100}
        battleTickets={profile?.battleTickets}
        huntTickets={profile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />

      {/* Session Header */}
      <SessionHeader
        session={session}
        regionName={params.regionName}
        movesLeft={movesLeft}
        onComplete={completeSession}
        onExit={exitSession}
      />

      {/* Session Stats */}
      <SessionStats rewards={sessionRewards} />

      {/* Direction Controls */}
      <View style={styles.controlsContainer}>
        <DirectionControls
          onMove={handleMove}
          disabled={isMoving || movesLeft <= 0}
        />
      </View>

      {/* Session Actions */}
      <SessionActions
        movesLeft={movesLeft}
        onComplete={completeSession}
        onExit={exitSession}
      />

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
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#1a0a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0a2e',
  },
  loadingText: {
    marginTop: 16,
    color: '#FFD700',
    fontSize: 16,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
