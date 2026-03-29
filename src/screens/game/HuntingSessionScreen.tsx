/**
 * Hunting Session Screen — "Lapis Glassworks" redesign
 *
 * Active hunting session with move controls and encounter modals.
 * Design ref: desgin/hunting_session/code.html
 */

import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native'
import { ThemedText } from '@/components'
import { CustomAlert, LoadingContainer } from '@/components/ui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getUserCurrency, getUserProfile } from '@/stores/selectors'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { huntApi } from '@/services/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import {
  EncounterModal,
  HuntingControls,
  HuntingSessionHeader,
  useCaptureAnimation,
  CaptureState,
} from './components'

// Backend encounter type
interface BackendEncounter {
  id: string
  species: string
  rarity: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  caught: boolean
}

interface HuntSession {
  id: string
  userId: string
  regionId: string
  encountersData: any
  createdAt: string
  region: {
    id: string
    name: string
    description: string
  }
}

export const HuntingSessionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ sessionId: string; regionName: string; regionId: string }>()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)

  // API state
  const [session, setSession] = useState<HuntSession | null>(null)
  const [encounters, setEncounters] = useState<BackendEncounter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [movesLeft, setMovesLeft] = useState(10)
  const [currentEncounter, setCurrentEncounter] = useState<BackendEncounter | null>(null)
  const [showEncounter, setShowEncounter] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [isMoving, setIsMoving] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionRewards, setSessionRewards] = useState({
    totalXp: 0,
    totalCoins: 0,
    petsFound: 0,
    itemsFound: 0,
  })

  // Custom alert
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message?: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  }>({ title: '' })

  const [moveAnimation] = useState(new Animated.Value(0))

  const {
    pokeballAnim,
    pokemonOpacity,
    pokemonScale,
    sparkleAnim,
    resetCaptureAnimations,
    getAnimationInterpolations,
  } = useCaptureAnimation()

  const showCustomAlert = useCallback((
    title: string,
    message?: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  ) => {
    setAlertConfig({ title, message, buttons })
    setShowAlert(true)
  }, [])

  // Load or start session
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (params.regionId) {
          try {
            const startResult = await huntApi.startHunt(params.regionId)
            if (startResult.success && startResult.data) {
              setSession(startResult.data.session)
              setEncounters(startResult.data.encounters || [])
              setMovesLeft(startResult.data.movesLeft ?? 10)
            } else {
              throw new Error('Failed to start hunt session')
            }
          } catch (startError: any) {
            const errorMsg = startError?.message || ''
            if (errorMsg.toLowerCase().includes('already have an active')) {
              const existingResult = await huntApi.getSession()
              if (existingResult.success && existingResult.data) {
                try {
                  await huntApi.completeSession(existingResult.data.session.id)
                } catch {
                  await huntApi.cancelSession(existingResult.data.session.id)
                }
                const newStartResult = await huntApi.startHunt(params.regionId)
                if (newStartResult.success && newStartResult.data) {
                  setSession(newStartResult.data.session)
                  setEncounters(newStartResult.data.encounters || [])
                  setMovesLeft(newStartResult.data.movesLeft ?? 10)
                } else {
                  throw new Error('Failed to start new hunt session')
                }
              } else {
                throw startError
              }
            } else {
              throw startError
            }
          }
        } else if (params.sessionId) {
          const result = await huntApi.getSession()
          if (result.success && result.data) {
            const loadedMovesLeft = result.data.movesLeft ?? 0
            if (loadedMovesLeft === 0) {
              const caughtCount = (result.data.encounters || []).filter((e: any) => e.caught).length
              try { await huntApi.completeSession(result.data.session.id) } catch {}
              Alert.alert(
                'Hunt Complete!',
                `Session Summary:\n• Region: ${result.data.session.region.name}\n• Encounters: ${result.data.encounters?.length || 0}\n• Pets Captured: ${caughtCount}`,
                [{ text: 'OK', onPress: () => router.back() }]
              )
              return
            }
            setSession(result.data.session)
            setEncounters(result.data.encounters || [])
            setMovesLeft(loadedMovesLeft)
          } else {
            throw new Error('Session not found')
          }
        } else {
          throw new Error('No region or session specified')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize hunt session')
        Alert.alert('Error', 'Failed to start hunt session', [
          { text: 'Go Back', onPress: () => router.back() },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    initSession()
  }, [params.sessionId, params.regionId, router])

  useEffect(() => {
    if (!sessionStarted && params.regionId) setSessionStarted(true)
  }, [params.sessionId, sessionStarted, params.regionId])

  const closeEncounter = useCallback(() => {
    setShowEncounter(false)
    setCurrentEncounter(null)
    resetCaptureAnimations()
  }, [resetCaptureAnimations])

  const exitSession = useCallback(() => { router.back() }, [router])

  const refreshProfile = useCallback(() => { dispatch(gameActions.loadUserData()) }, [dispatch])

  const attemptCapture = useCallback(async () => {
    if (!currentEncounter || currentEncounter.caught || !session || isCapturing) return
    setIsCapturing(true)
    setCaptureState('throwing')
    const speciesName = currentEncounter.species
    const encounterId = currentEncounter.id
    const encounterData = { ...currentEncounter }

    try {
      const [result] = await Promise.all([
        huntApi.attemptCatch(session.id, encounterId, 'pokeball'),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ])
      setIsCapturing(false)
      setCaptureState('idle')
      refreshProfile()

      if (result.success && result.data) {
        const catchSuccess = result.data.success === true && result.data.pet != null
        if (catchSuccess) {
          setEncounters(prev => prev.map(e => e.id === encounterId ? { ...e, caught: true } : e))
          setSessionRewards(prev => ({ ...prev, petsFound: prev.petsFound + 1 }))
          setShowEncounter(false)
          setCurrentEncounter(null)
          resetCaptureAnimations()
          Alert.alert('🎉 Capture Successful!', `You caught ${speciesName}!`, [{ text: 'Awesome!' }])
        } else {
          setShowEncounter(false)
          resetCaptureAnimations()
          Alert.alert('💨 It Escaped!', result.data.message || `${speciesName} broke free!`, [
            { text: 'Try Again', onPress: () => { if (encounterData && !encounterData.caught) { setCurrentEncounter(encounterData); setShowEncounter(true) } } },
            { text: 'Give Up', style: 'cancel', onPress: () => setCurrentEncounter(null) },
          ])
        }
      } else {
        Alert.alert('Error', 'Something went wrong.')
      }
    } catch (err) {
      setIsCapturing(false)
      setCaptureState('idle')
      resetCaptureAnimations()
      refreshProfile()
      const errorMessage = err instanceof Error ? err.message : 'Failed to catch'
      if (errorMessage.toLowerCase().includes('pokeball')) {
        setShowEncounter(false)
        setCurrentEncounter(null)
        Alert.alert('Out of Pokéballs!', 'Visit the Shop to purchase more.', [
          { text: 'Continue Hunting' },
          { text: 'Go to Shop', onPress: () => router.replace('/shop') },
        ])
      } else {
        Alert.alert('Error', errorMessage)
      }
    }
  }, [currentEncounter, session, isCapturing, encounters, refreshProfile, resetCaptureAnimations, router])

  const fleeEncounter = useCallback(() => {
    const encounterData = currentEncounter ? { ...currentEncounter } : null
    setShowEncounter(false)
    Alert.alert('Run Away?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel', onPress: () => { if (encounterData) { setCurrentEncounter(encounterData); setShowEncounter(true) } } },
      { text: 'Run Away', style: 'destructive', onPress: () => setCurrentEncounter(null) },
    ])
  }, [currentEncounter])

  const completeSession = useCallback(async () => {
    if (!session) return
    try {
      const result = await huntApi.completeSession(session.id)
      const caughtCount = encounters.filter(e => e.caught).length
      let summaryMessage = `• Region: ${session.region.name}\n• Encounters: ${encounters.length}\n• Pets Captured: ${caughtCount}`
      if (result.data?.xpEarned) summaryMessage += `\n\n⭐ ${result.data.xpEarned} XP earned!`
      if (result.data?.user?.leveledUp) summaryMessage += `\n\n🎉 LEVEL UP! Lv.${result.data.user.level}!`
      dispatch(gameActions.loadUserData())
      showCustomAlert('Hunting Session Complete!', summaryMessage, [
        { text: 'Return to Hunting Grounds', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('Error', 'Failed to complete session', [
        { text: 'Go Back Anyway', onPress: () => router.back() },
      ])
    }
  }, [session, encounters, dispatch, showCustomAlert, router])

  const makeMove = useCallback(async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!session || isMoving || movesLeft <= 0) return
    setIsMoving(true)
    Animated.sequence([
      Animated.timing(moveAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(moveAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()

    try {
      const result = await huntApi.move(session.id, direction)
      if (result.success && result.data) {
        setMovesLeft(result.data.movesLeft)
        if (result.data.encounter) {
          const newEncounter = result.data.encounter
          setEncounters(prev => [...prev, newEncounter])
          setCurrentEncounter(newEncounter)
          setShowEncounter(true)
        }
        if (result.data.movesLeft === 0) {
          setTimeout(() => {
            showCustomAlert('Out of Moves!', 'Time to complete the session.', [
              { text: 'Complete Session', onPress: completeSession },
            ])
          }, 1000)
        }
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to move')
    } finally {
      setIsMoving(false)
    }
  }, [session, isMoving, movesLeft, moveAnimation, showCustomAlert, completeSession])

  const { pokeballTranslateY, pokeballScale, shakeRotate, sparkleScale } = getAnimationInterpolations()

  if (isLoading) {
    return (
      <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
        <LoadingContainer message="Starting hunt session..." />
      </ScreenContainer>
    )
  }

  if (error) {
    return (
      <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
        <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
          <View style={styles.errorPanel}>
            <ThemedText style={styles.errorTitle}>⚠️ Error</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
              <ThemedText style={styles.errorButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.md }]}>
        <HuntingSessionHeader
          regionName={params.regionName || 'Unknown Region'}
          actionsLeft={movesLeft}
          sessionRewards={sessionRewards}
        />

        <HuntingControls
          actionsLeft={movesLeft}
          isMoving={isMoving}
          moveAnimation={moveAnimation}
          onMove={makeMove}
          onExit={exitSession}
        />

        <EncounterModal
          visible={showEncounter}
          encounter={currentEncounter}
          isCapturing={isCapturing}
          captureState={captureState}
          pokemonOpacity={pokemonOpacity}
          pokemonScale={pokemonScale}
          pokeballAnim={pokeballAnim}
          shakeRotate={shakeRotate}
          pokeballTranslateY={pokeballTranslateY}
          pokeballScaleInterp={pokeballScale}
          sparkleAnim={sparkleAnim}
          sparkleScale={sparkleScale}
          onCapture={attemptCapture}
          onFlee={fleeEncounter}
        />

        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setShowAlert(false)}
        />
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorPanel: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  errorTitle: { fontSize: fontSizes.title, fontFamily: fonts.bold, color: colors.error, marginBottom: spacing.md },
  errorText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: 'rgba(255, 219, 60, 0.15)',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.secondaryContainer,
  },
  errorButtonText: { color: colors.secondaryContainer, fontFamily: fonts.bold, fontSize: fontSizes.span },
})