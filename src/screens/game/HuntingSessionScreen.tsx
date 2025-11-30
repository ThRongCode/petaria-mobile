import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Modal, Animated, ImageBackground, Alert, ActivityIndicator } from 'react-native'
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
        // If regionId is provided, start a new session directly (don't check for existing)
        if (params.regionId) {
          console.log('🚀 Starting new hunt session for region:', params.regionId)
          const startResult = await huntApi.startHunt(params.regionId)
          console.log('✅ Started new session:', startResult)
          
          if (startResult.success && startResult.data) {
            setSession(startResult.data.session)
            setEncounters(startResult.data.encounters || [])
            setMovesLeft(startResult.data.movesLeft || 10)
          } else {
            throw new Error('Failed to start hunt session')
          }
        } else if (params.sessionId) {
          // If sessionId is provided (resuming), get the existing session
          console.log('🔄 Resuming existing session:', params.sessionId)
          const result = await huntApi.getSession()
          console.log('✅ Found existing session:', result)
          
          if (result.success && result.data) {
            setSession(result.data.session)
            setEncounters(result.data.encounters || [])
            setMovesLeft(result.data.movesLeft || 10)
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
  }

  const exitSession = () => {
    // Just navigate back - session remains active for resuming later
    router.back()
  }

  const attemptCapture = async () => {
    if (!currentEncounter || currentEncounter.caught || !session || isCapturing) return

    console.log('🎯 Attempting to catch:', currentEncounter.species)
    setIsCapturing(true)

    try {
      const result = await huntApi.attemptCatch(session.id, currentEncounter.id, 'pokeball')
      console.log('✅ Catch result:', result)
      
      if (result.success && result.data) {
        if (result.data.success && result.data.pet) {
          // Successfully caught
          const updatedEncounters = encounters.map(e => 
            e.id === currentEncounter.id ? { ...e, caught: true } : e
          )
          setEncounters(updatedEncounters)
          
          setSessionRewards(prev => ({ 
            ...prev, 
            petsFound: prev.petsFound + 1 
          }))
          
          showCustomAlert(
            'Capture Successful!',
            `You successfully captured ${currentEncounter.species}!`,
            [{ 
              text: 'Continue', 
              onPress: () => {
                closeEncounter()
                setIsCapturing(false)
              }
            }]
          )
        } else {
          // Failed to catch
          showCustomAlert(
            'Capture Failed!',
            result.data.message || 'The Pokemon escaped!',
            [{ 
              text: 'Try Again', 
              onPress: () => setIsCapturing(false) 
            },
            {
              text: 'Run Away',
              style: 'cancel',
              onPress: () => {
                closeEncounter()
                setIsCapturing(false)
              }
            }]
          )
        }
      }
    } catch (error) {
      console.error('❌ Error attempting catch:', error)
      setIsCapturing(false)
      
      // Handle specific error for no pokeballs
      const errorMessage = error instanceof Error ? error.message : 'Failed to catch Pokemon'
      if (errorMessage.toLowerCase().includes('pokeball')) {
        showCustomAlert(
          'Out of Pokéballs!',
          'You need Pokéballs to catch Pokémon. Visit the Items tab in your collection to purchase more.',
          [
            { text: 'Continue Exploring', style: 'cancel' },
            {
              text: 'Go to Items',
              onPress: () => {
                router.back()
                // Small delay to ensure navigation completes
                setTimeout(() => {
                  router.push('/pets')
                }, 100)
              }
            }
          ]
        )
      } else {
        Alert.alert('Error', errorMessage)
      }
    }
  }

  const fleeEncounter = () => {
    showCustomAlert(
      'Flee?',
      'Are you sure you want to run away from this Pokemon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flee',
          style: 'destructive',
          onPress: () => closeEncounter()
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
        } else {
          // Nothing found
          Alert.alert('Nothing Here', result.data.message || 'Keep exploring!')
        }

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
    
    return (
      <Modal visible={showEncounter} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <Panel variant="dark" style={styles.modalContent}>
            <View style={styles.encounterContent}>
              <ThemedText style={styles.encounterTitle}>
                Wild {currentEncounter.species} Appears!
              </ThemedText>
              <Image source={getPetImageByName(currentEncounter.species)} style={styles.monsterImage} />
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
                    <ThemedText style={styles.buttonText}>
                      {isCapturing ? 'Capturing...' : currentEncounter.caught ? 'Caught' : 'Attempt Capture'}
                    </ThemedText>
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
                    <ThemedText style={styles.buttonText}>Run Away</ThemedText>
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
  monsterImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
