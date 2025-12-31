import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ImageBackground, Alert, Animated } from 'react-native'
import { ThemedText } from '@/components'
import { Panel, TopBar, CustomAlert, LoadingContainer } from '@/components/ui'
import { useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getUserCurrency, getUserProfile } from '@/stores/selectors'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { huntApi } from '@/services/api'
import { 
  EncounterModal, 
  HuntingControls, 
  HuntingSessionHeader,
  useCaptureAnimation,
  CaptureState 
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
    itemsFound: 0
  })
  
  // Custom alert states
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message?: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  }>({ title: '' })
  
  // Animation values
  const [moveAnimation] = useState(new Animated.Value(0))
  
  // Use capture animation hook
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
      console.log('🎯 Initializing hunt session...')
      setIsLoading(true)
      setError(null)
      
      try {
        if (params.regionId) {
          console.log('🚀 Starting new hunt session for region:', params.regionId)
          
          try {
            const startResult = await huntApi.startHunt(params.regionId)
            console.log('✅ Started new session:', startResult)
            
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
              console.log('⚠️ Existing session found, auto-completing it...')
              
              const existingResult = await huntApi.getSession()
              
              if (existingResult.success && existingResult.data) {
                try {
                  await huntApi.completeSession(existingResult.data.session.id)
                  console.log('✅ Auto-completed old session')
                } catch (completeError) {
                  console.log('⚠️ Could not complete old session, canceling it...')
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
          console.log('🔄 Resuming existing session:', params.sessionId)
          const result = await huntApi.getSession()
          console.log('✅ Found existing session:', result)
          
          if (result.success && result.data) {
            const loadedMovesLeft = result.data.movesLeft ?? 0
            
            if (loadedMovesLeft === 0) {
              console.log('🏁 Session has 0 moves, auto-completing...')
              const caughtCount = (result.data.encounters || []).filter((e: any) => e.caught).length
              
              try {
                await huntApi.completeSession(result.data.session.id)
                console.log('✅ Session auto-completed')
              } catch (e) {
                console.log('⚠️ Could not complete session:', e)
              }
              
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
      } catch (error) {
        console.error('❌ Error initializing session:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize hunt session')
        Alert.alert('Error', 'Failed to start hunt session', [
          { text: 'Go Back', onPress: () => router.back() }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    initSession()
  }, [params.sessionId, params.regionId, router])

  useEffect(() => {
    if (!sessionStarted && params.regionId) {
      setSessionStarted(true)
    }
  }, [params.sessionId, sessionStarted, params.regionId])

  const closeEncounter = useCallback(() => {
    setShowEncounter(false)
    setCurrentEncounter(null)
    resetCaptureAnimations()
  }, [resetCaptureAnimations])

  const exitSession = useCallback(() => {
    router.back()
  }, [router])

  const refreshProfile = useCallback(() => {
    dispatch(gameActions.loadUserData())
  }, [dispatch])

  const attemptCapture = useCallback(async () => {
    if (!currentEncounter || currentEncounter.caught || !session || isCapturing) return

    console.log('🎯 Attempting to catch:', currentEncounter.species)
    setIsCapturing(true)
    setCaptureState('throwing')
    
    const speciesName = currentEncounter.species
    const encounterId = currentEncounter.id
    const encounterData = { ...currentEncounter }

    try {
      const [result] = await Promise.all([
        huntApi.attemptCatch(session.id, encounterId, 'pokeball'),
        new Promise(resolve => setTimeout(resolve, 1500))
      ])
      
      console.log('✅ Catch result:', result)
      
      setIsCapturing(false)
      setCaptureState('idle')
      refreshProfile()
      
      if (result.success && result.data) {
        const catchSuccess = result.data.success === true && result.data.pet != null
        
        if (catchSuccess) {
          const updatedEncounters = encounters.map(e => 
            e.id === encounterId ? { ...e, caught: true } : e
          )
          setEncounters(updatedEncounters)
          
          setSessionRewards(prev => ({ 
            ...prev, 
            petsFound: prev.petsFound + 1 
          }))
          
          setShowEncounter(false)
          setCurrentEncounter(null)
          resetCaptureAnimations()
          
          Alert.alert(
            '🎉 Capture Successful!',
            `You caught ${speciesName}!\nIt has been added to your collection.`,
            [{ text: 'Awesome!' }]
          )
        } else {
          setShowEncounter(false)
          resetCaptureAnimations()
          
          Alert.alert(
            '💨 It Escaped!',
            result.data.message || `${speciesName} broke free from the Pokéball!`,
            [
              { 
                text: 'Try Again',
                onPress: () => {
                  if (encounterData && !encounterData.caught) {
                    setCurrentEncounter(encounterData)
                    setShowEncounter(true)
                  }
                }
              },
              {
                text: 'Give Up',
                style: 'cancel',
                onPress: () => setCurrentEncounter(null)
              }
            ]
          )
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setIsCapturing(false)
      setCaptureState('idle')
      resetCaptureAnimations()
      refreshProfile()
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to catch Pokemon'
      
      if (errorMessage.toLowerCase().includes('pokeball')) {
        setShowEncounter(false)
        setCurrentEncounter(null)
        
        Alert.alert(
          'Out of Pokéballs!',
          'You need Pokéballs to catch Pokémon. Visit the Shop to purchase more.',
          [
            { text: 'Continue Hunting' },
            { text: 'Go to Shop', onPress: () => router.replace('/shop') }
          ]
        )
      } else {
        console.error('❌ Error attempting catch:', error)
        Alert.alert('Error', errorMessage)
      }
    }
  }, [currentEncounter, session, isCapturing, encounters, refreshProfile, resetCaptureAnimations, router])

  const fleeEncounter = useCallback(() => {
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
          }
        },
        {
          text: 'Run Away',
          style: 'destructive',
          onPress: () => setCurrentEncounter(null)
        }
      ]
    )
  }, [currentEncounter])

  const completeSession = useCallback(async () => {
    if (!session) return

    console.log('🏁 Completing hunt session')
    
    try {
      const result = await huntApi.completeSession(session.id)
      console.log('✅ Session completed:', result)
      
      const caughtCount = encounters.filter(e => e.caught).length
      
      let summaryMessage = `Session Summary:\n• Region: ${session.region.name}\n• Encounters: ${encounters.length}\n• Pets Captured: ${caughtCount}`
      
      if (result.data?.xpEarned) {
        summaryMessage += `\n\n⭐ ${result.data.xpEarned} XP earned!`
      }
      
      if (result.data?.user?.leveledUp) {
        summaryMessage += `\n\n🎉 LEVEL UP! You are now Lv.${result.data.user.level}!`
      }
      
      dispatch(gameActions.loadUserData())
      
      showCustomAlert(
        'Hunting Session Complete!',
        summaryMessage,
        [{ text: 'Return to Hunting Grounds', onPress: () => router.back() }]
      )
    } catch (error) {
      console.error('❌ Error completing session:', error)
      Alert.alert('Error', 'Failed to complete session', [
        { text: 'Go Back Anyway', onPress: () => router.back() }
      ])
    }
  }, [session, encounters, dispatch, showCustomAlert, router])

  const makeMove = useCallback(async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!session || isMoving || movesLeft <= 0) return

    setIsMoving(true)

    Animated.sequence([
      Animated.timing(moveAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()

    try {
      const result = await huntApi.move(session.id, direction)
      console.log('🚶 Move result:', result)

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
            showCustomAlert(
              'Out of Moves!',
              'You\'ve used all your moves. Time to complete the session.',
              [{ text: 'Complete Session', onPress: completeSession }]
            )
          }, 1000)
        }
      }
    } catch (error) {
      console.error('❌ Error moving:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to move')
    } finally {
      setIsMoving(false)
    }
  }, [session, isMoving, movesLeft, moveAnimation, showCustomAlert, completeSession])

  // Get animation interpolations
  const { pokeballTranslateY, pokeballScale, shakeRotate, sparkleScale } = getAnimationInterpolations()

  // Show loading state
  if (isLoading) {
    return (
      <ImageBackground 
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar
          username={profile?.username || 'Trainer'}
          coins={currency?.coins || 0}
          gems={currency?.gems || 0}
          pokeballs={currency?.pokeballs || 0}
          battleTickets={profile?.battleTickets}
          huntTickets={profile?.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />
        <LoadingContainer message="Starting hunt session..." />
      </ImageBackground>
    )
  }

  // Show error state
  if (error) {
    return (
      <ImageBackground 
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar
          username={profile?.username || 'Trainer'}
          coins={currency?.coins || 0}
          gems={currency?.gems || 0}
          pokeballs={currency?.pokeballs || 0}
          battleTickets={profile?.battleTickets}
          huntTickets={profile?.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />
        <View style={styles.errorContainer}>
          <Panel variant="dark" style={styles.errorPanel}>
            <ThemedText style={styles.errorTitle}>⚠️ Error</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
              <ThemedText style={styles.errorButtonText}>Go Back</ThemedText>
            </TouchableOpacity>
          </Panel>
        </View>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground 
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        username={profile?.username || 'Trainer'}
        coins={currency?.coins || 0}
        gems={currency?.gems || 0}
        pokeballs={currency?.pokeballs || 0}
        battleTickets={profile?.battleTickets}
        huntTickets={profile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorPanel: {
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  errorButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
})
