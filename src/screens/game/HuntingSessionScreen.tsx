import React, { useState, useEffect, useRef, useCallback } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, Animated, ImageBackground, Alert, ActivityIndicator, Easing } from 'react-native'
import { ThemedText } from '@/components'
import { Panel, TopBar, IconButton, CustomAlert } from '@/components/ui'
import { useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getUserCurrency, getUserProfile } from '@/stores/selectors'
import { Pet, Item } from '@/stores/types/game'
import { useAppDispatch, RootState } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { getPetImageByName } from '@/assets/images'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { huntApi } from '@/services/api'

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

// Capture state for animation
type CaptureState = 'idle' | 'throwing' | 'shaking' | 'success' | 'failed'

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
  const pokeballAnim = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pokemonOpacity = useRef(new Animated.Value(1)).current
  const pokemonScale = useRef(new Animated.Value(1)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current

  const showCustomAlert = (
    title: string,
    message?: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  ) => {
    setAlertConfig({ title, message, buttons })
    setShowAlert(true)
  }

  // Load or start session
  useEffect(() => {
    const initSession = async () => {
      console.log('🎯 Initializing hunt session...')
      console.log('🎯 params.sessionId:', params.sessionId)
      console.log('🎯 params.regionId:', params.regionId)
      setIsLoading(true)
      setError(null)
      
      try {
        // If regionId is provided, start a new session
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
            // If there's an existing session, auto-complete it and start fresh
            const errorMsg = startError?.message || ''
            if (errorMsg.toLowerCase().includes('already have an active')) {
              console.log('⚠️ Existing session found, auto-completing it...')
              
              // Get the existing session to complete it
              const existingResult = await huntApi.getSession()
              
              if (existingResult.success && existingResult.data) {
                // Auto-complete the old session
                try {
                  await huntApi.completeSession(existingResult.data.session.id)
                  console.log('✅ Auto-completed old session')
                } catch (completeError) {
                  console.log('⚠️ Could not complete old session, canceling it...')
                  await huntApi.cancelSession(existingResult.data.session.id)
                }
                
                // Now start the new session
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
          // If sessionId is provided (resuming), get the existing session
          console.log('🔄 Resuming existing session:', params.sessionId)
          const result = await huntApi.getSession()
          console.log('✅ Found existing session:', result)
          
          if (result.success && result.data) {
            const loadedMovesLeft = result.data.movesLeft ?? 0
            
            // If session has 0 moves, auto-complete it and go back
            if (loadedMovesLeft === 0) {
              console.log('🏁 Session has 0 moves, auto-completing...')
              const caughtCount = (result.data.encounters || []).filter((e: any) => e.caught).length
              
              try {
                await huntApi.completeSession(result.data.session.id)
                console.log('✅ Session auto-completed')
              } catch (e) {
                console.log('⚠️ Could not complete session:', e)
              }
              
              // Show summary and go back
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
  }, [params.sessionId, params.regionId])

  useEffect(() => {
    if (!sessionStarted && params.regionId) {
      setSessionStarted(true)
    }
  }, [params.sessionId])

  // Actions left is now movesLeft from session
  const actionsLeft = movesLeft

  const closeEncounter = () => {
    setShowEncounter(false)
    setCurrentEncounter(null)
    // Reset capture animations when closing
    resetCaptureAnimations()
  }

  const exitSession = () => {
    // Just navigate back - session remains active for resuming later
    router.back()
  }

  // Reset capture animations
  const resetCaptureAnimations = () => {
    pokeballAnim.setValue(0)
    shakeAnim.setValue(0)
    pokemonOpacity.setValue(1)
    pokemonScale.setValue(1)
    sparkleAnim.setValue(0)
    setCaptureState('idle')
  }

  // Play capture animation sequence
  const playCaptureAnimation = (success: boolean): Promise<void> => {
    return new Promise((resolve) => {
      console.log('🎬 Starting capture animation, success:', success)
      
      // Phase 1: Throw pokeball (pokeball flies in)
      setCaptureState('throwing')
      
      Animated.timing(pokeballAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        console.log('🎬 Phase 1 complete - pokeball thrown')
        
        // Phase 2: Pokemon shrinks and fades (being captured)
        Animated.parallel([
          Animated.timing(pokemonOpacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pokemonScale, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          console.log('🎬 Phase 2 complete - pokemon captured')
          
          // Phase 3: Shake animation
          setCaptureState('shaking')
          
          const shakeCount = success ? 3 : 2
          
          // Create shake animation
          const createShake = () => Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 1,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -1,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.delay(200),
          ])
          
          // Build shake sequence
          const shakeSequence = Array(shakeCount).fill(null).map(() => createShake())
          
          Animated.sequence(shakeSequence).start(() => {
            console.log('🎬 Phase 3 complete - shaking done')
            
            if (success) {
              // Phase 4: Success - sparkle animation
              setCaptureState('success')
              Animated.timing(sparkleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start(() => {
                console.log('🎬 Phase 4 complete - success!')
                setTimeout(resolve, 300)
              })
            } else {
              // Phase 4: Failed - Pokemon breaks free
              setCaptureState('failed')
              Animated.parallel([
                Animated.timing(pokemonOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(pokemonScale, {
                  toValue: 1,
                  duration: 300,
                  easing: Easing.bounce,
                  useNativeDriver: true,
                }),
                Animated.timing(pokeballAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                console.log('🎬 Phase 4 complete - escaped!')
                setTimeout(resolve, 300)
              })
            }
          })
        })
      })
    })
  }

  // Refresh user profile to get updated pokeball count
  const refreshProfile = useCallback(() => {
    dispatch(gameActions.loadUserData())
  }, [dispatch])

  const attemptCapture = async () => {
    if (!currentEncounter || currentEncounter.caught || !session || isCapturing) return

    console.log('🎯 Attempting to catch:', currentEncounter.species)
    setIsCapturing(true)
    setCaptureState('throwing')
    
    // Store encounter data before any state changes
    const speciesName = currentEncounter.species
    const encounterId = currentEncounter.id
    const encounterData = { ...currentEncounter } // Clone to preserve data

    try {
      // Call API with minimum delay for UX
      const [result] = await Promise.all([
        huntApi.attemptCatch(session.id, encounterId, 'pokeball'),
        new Promise(resolve => setTimeout(resolve, 1500)) // Show loading for 1.5s
      ])
      
      console.log('✅ Catch result:', result)
      
      // Reset capture state immediately
      setIsCapturing(false)
      setCaptureState('idle')
      
      // Refresh profile to update pokeball count in TopBar
      refreshProfile()
      
      if (result.success && result.data) {
        // Check if catch was successful
        const catchSuccess = result.data.success === true && result.data.pet != null
        
        console.log('🎯 Catch success:', catchSuccess, 'has pet:', !!result.data.pet)
        
        if (catchSuccess) {
          // Successfully caught - update state and close modal
          const updatedEncounters = encounters.map(e => 
            e.id === encounterId ? { ...e, caught: true } : e
          )
          setEncounters(updatedEncounters)
          
          setSessionRewards(prev => ({ 
            ...prev, 
            petsFound: prev.petsFound + 1 
          }))
          
          // Close modal and clear encounter
          setShowEncounter(false)
          setCurrentEncounter(null)
          resetCaptureAnimations()
          
          // Show success alert
          Alert.alert(
            '🎉 Capture Successful!',
            `You caught ${speciesName}!\nIt has been added to your collection.`,
            [{ text: 'Awesome!' }]
          )
        } else {
          // Failed to catch - close modal, then show options
          setShowEncounter(false)
          resetCaptureAnimations()
          
          Alert.alert(
            '💨 It Escaped!',
            result.data.message || `${speciesName} broke free from the Pokéball!`,
            [
              { 
                text: 'Try Again',
                onPress: () => {
                  // Ensure encounter data is still valid, then reopen modal
                  if (encounterData && !encounterData.caught) {
                    setCurrentEncounter(encounterData)
                    setShowEncounter(true)
                  }
                }
              },
              {
                text: 'Give Up',
                style: 'cancel',
                onPress: () => {
                  setCurrentEncounter(null)
                }
              }
            ]
          )
        }
      } else {
        console.log('❌ API call failed or no data')
        Alert.alert('Error', 'Something went wrong. Please try again.')
      }
    } catch (error) {
      // Reset states
      setIsCapturing(false)
      setCaptureState('idle')
      resetCaptureAnimations()
      
      // Refresh profile in case pokeball was deducted
      refreshProfile()
      
      // Get error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to catch Pokemon'
      
      // Check if it's the "no pokeballs" case - this is expected, not an error
      if (errorMessage.toLowerCase().includes('pokeball')) {
        console.log('ℹ️ User has no pokeballs')
        
        // Close encounter modal and clear encounter
        setShowEncounter(false)
        setCurrentEncounter(null)
        
        // Show friendly message
        Alert.alert(
          'Out of Pokéballs!',
          'You need Pokéballs to catch Pokémon. Visit the Shop to purchase more.',
          [
            { text: 'Continue Hunting' },
            {
              text: 'Go to Shop',
              onPress: () => {
                // Navigate to shop (will go back from hunt session first)
                router.replace('/shop')
              }
            }
          ]
        )
      } else {
        // Actual error - log it
        console.error('❌ Error attempting catch:', error)
        Alert.alert('Error', errorMessage)
      }
    }
  }

  const fleeEncounter = () => {
    // Store current encounter data before closing modal
    const encounterData = currentEncounter ? { ...currentEncounter } : null
    
    // Hide encounter modal first to prevent stacking modals
    setShowEncounter(false)
    
    Alert.alert(
      'Run Away?',
      'Are you sure you want to run away from this Pokemon?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            // Re-show encounter if cancelled
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
  }

  const completeSession = async () => {
    if (!session) return

    console.log('🏁 Completing hunt session')
    
    try {
      const result = await huntApi.completeSession(session.id)
      console.log('✅ Session completed:', result)
      
      const caughtCount = encounters.filter(e => e.caught).length
      
      showCustomAlert(
        'Hunting Session Complete!',
        `Session Summary:\n• Region: ${session.region.name}\n• Encounters: ${encounters.length}\n• Pets Captured: ${caughtCount}`,
        [
          {
            text: 'Return to Hunting Grounds',
            onPress: () => router.back()
          }
        ]
      )
    } catch (error) {
      console.error('❌ Error completing session:', error)
      Alert.alert('Error', 'Failed to complete session', [
        { text: 'Go Back Anyway', onPress: () => router.back() }
      ])
    }
  }

  const makeMove = async (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log('🎯 makeMove called with direction:', direction)
    console.log('🎯 session:', session?.id)
    console.log('🎯 isMoving:', isMoving)
    console.log('🎯 movesLeft:', movesLeft)
    
    if (!session || isMoving || movesLeft <= 0) {
      console.log('❌ Move blocked:', { hasSession: !!session, isMoving, movesLeft })
      return
    }

    console.log('✅ Move allowed, calling API...')
    setIsMoving(true)

    // Animate movement
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
      console.log('📡 Calling huntApi.move with sessionId:', session.id, 'direction:', direction)
      const result = await huntApi.move(session.id, direction)
      console.log('🚶 Move result:', result)

      if (result.success && result.data) {
        setMovesLeft(result.data.movesLeft)

        if (result.data.encounter) {
          // Found a Pokemon!
          const newEncounter = result.data.encounter
          setEncounters(prev => [...prev, newEncounter])
          setCurrentEncounter(newEncounter)
          setShowEncounter(true)
        }
        // Nothing found - silent, just continue exploring (no annoying alerts)

        // Auto-complete if no moves left
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
  }

  const EncounterModal = () => {
    if (!currentEncounter) return null
    
    // Animation interpolations
    const pokeballTranslateY = pokeballAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    })
    
    const pokeballScale = pokeballAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1.2, 1],
    })
    
    const shakeRotate = shakeAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-20deg', '0deg', '20deg'],
    })
    
    const sparkleScale = sparkleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1.5, 1],
    })
    
    const getCaptureStatusText = () => {
      switch (captureState) {
        case 'throwing': return '🔴 Throwing Pokéball...'
        case 'shaking': return '⏳ Come on...'
        case 'success': return '✨ Gotcha!'
        case 'failed': return '💨 Oh no!'
        default: return `Wild ${currentEncounter.species} Appears!`
      }
    }
    
    return (
      <Modal visible={showEncounter} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <Panel variant="dark" style={styles.modalContent}>
            <View style={styles.encounterContent}>
              <ThemedText style={[
                styles.encounterTitle,
                captureState === 'success' && { color: '#4CAF50' },
                captureState === 'failed' && { color: '#FF5722' }
              ]}>
                {getCaptureStatusText()}
              </ThemedText>
              
              {/* Pokemon with animations */}
              <View style={styles.pokemonContainer}>
                <Animated.View style={[
                  styles.pokemonWrapper,
                  {
                    opacity: pokemonOpacity,
                    transform: [{ scale: pokemonScale }]
                  }
                ]}>
                  <Image source={getPetImageByName(currentEncounter.species)} style={styles.monsterImage} />
                </Animated.View>
                
                {/* Pokeball animation overlay */}
                {isCapturing && captureState !== 'idle' && (
                  <Animated.View style={[
                    styles.pokeballOverlay,
                    {
                      opacity: pokeballAnim,
                      transform: [
                        { translateY: pokeballTranslateY },
                        { scale: pokeballScale },
                        { rotate: captureState === 'shaking' ? shakeRotate : '0deg' }
                      ]
                    }
                  ]}>
                    <View style={styles.pokeballIcon}>
                      <View style={styles.pokeballTop} />
                      <View style={styles.pokeballMiddle}>
                        <View style={styles.pokeballButton} />
                      </View>
                      <View style={styles.pokeballBottom} />
                    </View>
                  </Animated.View>
                )}
                
                {/* Success sparkles */}
                {captureState === 'success' && (
                  <Animated.View style={[
                    styles.sparkleContainer,
                    {
                      opacity: sparkleAnim,
                      transform: [{ scale: sparkleScale }]
                    }
                  ]}>
                    <ThemedText style={styles.sparkle}>✨</ThemedText>
                    <ThemedText style={[styles.sparkle, styles.sparkle2]}>⭐</ThemedText>
                    <ThemedText style={[styles.sparkle, styles.sparkle3]}>✨</ThemedText>
                    <ThemedText style={[styles.sparkle, styles.sparkle4]}>⭐</ThemedText>
                  </Animated.View>
                )}
              </View>
              
              <ThemedText style={styles.monsterName}>
                {currentEncounter.species} (Level {currentEncounter.level})
              </ThemedText>
              <ThemedText style={[styles.monsterRarity, { color: getRarityColor(currentEncounter.rarity) }]}>
                {currentEncounter.rarity}
              </ThemedText>
              
              <View style={styles.captureInfo}>
                <ThemedText style={styles.captureText}>
                  HP: {currentEncounter.hp}/{currentEncounter.maxHp}
                </ThemedText>
                <ThemedText style={styles.captureRate}>
                  Attack: {currentEncounter.attack} | Defense: {currentEncounter.defense}
                </ThemedText>
              </View>

              <View style={styles.encounterActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, (currentEncounter.caught || isCapturing) && styles.disabledButton]}
                  onPress={attemptCapture}
                  disabled={currentEncounter.caught || isCapturing}
                >
                  <LinearGradient
                    colors={currentEncounter.caught || isCapturing ? ['#666', '#444'] : ['#4CAF50', '#45a049']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isCapturing ? (
                      <View style={styles.capturingContainer}>
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                        <ThemedText style={styles.buttonText}>
                          {captureState === 'throwing' ? 'Throwing...' : 
                           captureState === 'shaking' ? 'Catching...' : 'Capturing...'}
                        </ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.buttonText}>
                        {currentEncounter.caught ? '✓ Caught' : '⚾ Throw Pokéball'}
                      </ThemedText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, isCapturing && styles.disabledButton]}
                  onPress={fleeEncounter}
                  disabled={isCapturing}
                >
                  <LinearGradient
                    colors={isCapturing ? ['#666', '#444'] : ['#FF9800', '#F57C00']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText style={styles.buttonText}>🏃 Run Away</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Panel>
        </View>
      </Modal>
    )
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#9E9E9E'
      case 'Rare': return '#2196F3'
      case 'Epic': return '#9C27B0'
      case 'Legendary': return '#FF9800'
      default: return '#9E9E9E'
    }
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
        energy={80}
        maxEnergy={100}
        battleTickets={profile?.battleTickets}
        huntTickets={profile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header Panel */}
        <Panel variant="dark" style={styles.headerPanel}>
          <View style={styles.headerContent}>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.regionName}>
                {params.regionName}
              </ThemedText>
              <ThemedText style={styles.sessionSubtitle}>Dungeon Exploration</ThemedText>
            </View>
            <View style={styles.actionsCounter}>
              <ThemedText style={styles.actionsText}>Actions Left</ThemedText>
              <ThemedText style={styles.actionsNumber}>{actionsLeft}</ThemedText>
            </View>
          </View>
        </Panel>

        {/* Session rewards summary */}
        <Panel variant="dark" style={styles.rewardsPanel}>
          <View style={styles.rewardsBar}>
            <View style={styles.rewardItem}>
              <ThemedText style={styles.rewardLabel}>XP</ThemedText>
              <ThemedText style={styles.rewardValue}>{sessionRewards.totalXp}</ThemedText>
            </View>
            <View style={styles.rewardItem}>
              <ThemedText style={styles.rewardLabel}>Coins</ThemedText>
              <ThemedText style={styles.rewardValue}>{sessionRewards.totalCoins}</ThemedText>
            </View>
            <View style={styles.rewardItem}>
              <ThemedText style={styles.rewardLabel}>Pets</ThemedText>
              <ThemedText style={styles.rewardValue}>{sessionRewards.petsFound}</ThemedText>
            </View>
            <View style={styles.rewardItem}>
              <ThemedText style={styles.rewardLabel}>Items</ThemedText>
              <ThemedText style={styles.rewardValue}>{sessionRewards.itemsFound}</ThemedText>
            </View>
          </View>
        </Panel>

        {/* Exploration area */}
        <View style={styles.explorationArea}>
          <Animated.View 
            style={[
              styles.explorerIcon,
              {
                transform: [{
                  scale: moveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2]
                  })
                }]
              }
            ]}
          >
            <ThemedText style={styles.explorerEmoji}>🧙‍♂️</ThemedText>
          </Animated.View>
          
          <ThemedText style={styles.explorationHint}>
            Choose a direction to explore
          </ThemedText>
        </View>

        {/* Movement controls - D-Pad Layout */}
        <View style={styles.movementControls}>
          {/* Up Button */}
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={[styles.movementButton, (actionsLeft <= 0 || isMoving) && styles.disabledButton]}
              onPress={() => makeMove('up')}
              disabled={actionsLeft <= 0 || isMoving}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                {isMoving ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  <Ionicons name="arrow-up" size={28} color="#FFD700" />
                )}
                <ThemedText style={styles.movementLabel}>Up</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
          
          {/* Left and Right Buttons */}
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={[styles.movementButton, (actionsLeft <= 0 || isMoving) && styles.disabledButton]}
              onPress={() => makeMove('left')}
              disabled={actionsLeft <= 0 || isMoving}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                {isMoving ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  <Ionicons name="arrow-back" size={28} color="#FFD700" />
                )}
                <ThemedText style={styles.movementLabel}>Left</ThemedText>
              </Panel>
            </TouchableOpacity>
            
            <View style={styles.dpadSpacer} />
            
            <TouchableOpacity 
              style={[styles.movementButton, (actionsLeft <= 0 || isMoving) && styles.disabledButton]}
              onPress={() => makeMove('right')}
              disabled={actionsLeft <= 0 || isMoving}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                {isMoving ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  <Ionicons name="arrow-forward" size={28} color="#FFD700" />
                )}
                <ThemedText style={styles.movementLabel}>Right</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
          
          {/* Down Button */}
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={[styles.movementButton, (actionsLeft <= 0 || isMoving) && styles.disabledButton]}
              onPress={() => makeMove('down')}
              disabled={actionsLeft <= 0 || isMoving}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                {isMoving ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  <Ionicons name="arrow-down" size={28} color="#FFD700" />
                )}
                <ThemedText style={styles.movementLabel}>Down</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exit button */}
        <View style={styles.exitContainer}>
          <TouchableOpacity
            onPress={exitSession}
            style={styles.exitButtonContainer}
          >
            <LinearGradient
              colors={['#757575', '#616161']}
              style={styles.exitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-back" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <ThemedText style={styles.exitButtonText}>Save & Exit</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <EncounterModal />
        
        {/* Custom Alert Dialog */}
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
  headerPanel: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  actionsCounter: {
    alignItems: 'center',
  },
  actionsText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  actionsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rewardsPanel: {
    marginBottom: 16,
  },
  rewardsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  explorationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  explorerIcon: {
    marginBottom: 16,
  },
  explorerEmoji: {
    fontSize: 60,
  },
  explorationHint: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  movementControls: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  movementButton: {
    width: 100,
    height: 90,
  },
  dpadSpacer: {
    width: 40,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  movementLabel: {
    fontSize: 13,
    color: '#FFD700',
    marginTop: 6,
    fontWeight: '600',
  },
  exitContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  exitButtonContainer: {
    width: '100%',
  },
  exitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  encounterContent: {
    alignItems: 'center',
  },
  encounterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD700',
  },
  pokemonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  pokemonWrapper: {
    width: '100%',
    height: '100%',
  },
  monsterImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pokeballOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#333',
  },
  pokeballTop: {
    flex: 1,
    backgroundColor: '#EF5350',
  },
  pokeballMiddle: {
    height: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#333',
    position: 'absolute',
  },
  pokeballBottom: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  sparkle2: {
    top: 10,
    right: 20,
  },
  sparkle3: {
    bottom: 10,
    left: 20,
  },
  sparkle4: {
    bottom: 20,
    right: 30,
  },
  capturingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  monsterRarity: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  captureInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  captureText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  captureRate: {
    textAlign: 'center',
    fontSize: 14,
    color: '#B0B0B0',
  },
  encounterActions: {
    gap: 12,
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  gradientButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  treasureIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  treasureText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#B0B0B0',
    marginBottom: 20,
  },
})
