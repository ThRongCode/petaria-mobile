/**
 * HuntingSessionScreen — "Lapis Glassworks" redesign
 *
 * Fully inline hunting flow using InlineEventCard.
 * No modal dialogs for encounters or results.
 */

import React, { useCallback, useState } from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAlert, LoadingContainer } from '@/components/ui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { backgrounds } from '@/assets/images/backgrounds'
import { spacing } from '@/themes/metrics'
import { globalAlert } from '@/components/ui/AlertProvider'
import { InlineEventCard, EventState } from '@/screens/game/components/InlineEventCard'

// Feature-module imports
import {
  useHuntSession,
  DirectionControls,
  SessionStats,
  SessionHeader,
  SessionActions,
  Direction,
} from '../index'
import { huntApi } from '@/services/api'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'

export const HuntingSessionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ sessionId?: string; regionName?: string; regionId?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const alert = useAlert()
  const dispatch = useAppDispatch()

  const [eventState, setEventState] = useState<EventState>('scouting')
  const [captureEncounter, setCaptureEncounter] = useState<any>(null)

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
    updateEncounterAsCaught,
    incrementPetsFound,
  } = useHuntSession({ params })

  const refreshProfile = useCallback(() => { dispatch(gameActions.loadUserData()) }, [dispatch])

  // Handle movement — inline results, no dialogs
  const handleMove = useCallback(async (direction: Direction) => {
    if (eventState === 'encounter' || eventState === 'capturing') return
    setEventState('scouting')
    setCaptureEncounter(null)
    setCurrentEncounter(null)
    const encounter = await makeMove(direction)

    if (!encounter) {
      if (movesLeft - 1 === 0) {
        setTimeout(completeSession, 2000)
      }
      setEventState('nothing')
    } else {
      setCaptureEncounter(encounter)
      setEventState('encounter')
    }
  }, [makeMove, movesLeft, completeSession, eventState])

  // Direct capture — no confirmation dialog
  const handleCapture = useCallback(async () => {
    if (!captureEncounter || !session) return
    setEventState('capturing')

    try {
      const [result] = await Promise.all([
        huntApi.attemptCatch(session.id, captureEncounter.id, 'pokeball'),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ])
      refreshProfile()

      if (result.success && result.data) {
        const catchSuccess = result.data.success === true && result.data.pet != null
        if (catchSuccess) {
          updateEncounterAsCaught(captureEncounter.id)
          incrementPetsFound()
          setEventState('caught')
        } else {
          setEventState('escaped')
        }
      } else {
        setEventState('escaped')
      }
    } catch (err) {
      refreshProfile()
      const errorMessage = err instanceof Error ? err.message : ''
      if (errorMessage.toLowerCase().includes('pokeball')) {
        setEventState('no_balls')
      } else {
        setEventState('escaped')
      }
    }
  }, [captureEncounter, session, refreshProfile, updateEncounterAsCaught, incrementPetsFound])

  // Direct flee — no confirmation dialog
  const handleFlee = useCallback(() => {
    setEventState('fled')
  }, [])

  const controlsDisabled = eventState === 'encounter' || eventState === 'capturing'

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer backgroundImage={backgrounds.huntingSession}>
        <LoadingContainer message="Starting hunt session..." />
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer backgroundImage={backgrounds.huntingSession}>
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

        {/* Inline event area — replaces modal encounters */}
        <InlineEventCard
          eventState={eventState}
          encounter={captureEncounter}
          onThrow={handleCapture}
          onRun={handleFlee}
          onGoToShop={() => router.replace('/shop')}
        />

        {/* D-Pad Controls */}
        <DirectionControls
          onMove={handleMove}
          disabled={controlsDisabled || isMoving || movesLeft <= 0}
          isMoving={isMoving}
        />

        {/* Session Actions (Pause/Complete) */}
        <SessionActions
          movesLeft={movesLeft}
          onComplete={completeSession}
          onExit={exitSession}
        />
      </ScrollView>
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
