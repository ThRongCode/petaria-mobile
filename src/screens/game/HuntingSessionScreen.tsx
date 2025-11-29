import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Animated, ImageBackground, Alert, ActivityIndicator } from 'react-native'
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
  
  const [currentEncounterIndex, setCurrentEncounterIndex] = useState(0)
  const [showEncounter, setShowEncounter] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
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

  // Load session from API
  useEffect(() => {
    const loadSession = async () => {
      console.log('🎯 Loading hunt session:', params.sessionId)
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await huntApi.getSession()
        console.log('✅ Loaded session:', result)
        
        if (result.success && result.data) {
          setSession(result.data.session)
          setEncounters(result.data.encounters)
          
          // Show first uncaught encounter
          const firstUncaught = result.data.encounters.findIndex((e: BackendEncounter) => !e.caught)
          if (firstUncaught !== -1) {
            setCurrentEncounterIndex(firstUncaught)
            setShowEncounter(true)
          }
        } else {
          throw new Error('Failed to load session')
        }
      } catch (error) {
        console.error('❌ Error loading session:', error)
        setError(error instanceof Error ? error.message : 'Failed to load session')
        Alert.alert('Error', 'Failed to load hunt session', [
          { text: 'Go Back', onPress: () => router.back() }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (params.sessionId) {
      loadSession()
    }
  }, [params.sessionId])

  useEffect(() => {
    if (!sessionStarted && params.regionId) {
      setSessionStarted(true)
    }
  }, [params.sessionId])

  // Calculate actions left based on uncaught encounters
  const actionsLeft = encounters.filter(e => !e.caught).length

  const getCurrentEncounter = (): BackendEncounter | null => {
    return encounters[currentEncounterIndex] || null
  }

  const moveToNextEncounter = () => {
    const nextIndex = encounters.findIndex((e, i) => i > currentEncounterIndex && !e.caught)
    if (nextIndex !== -1) {
      setCurrentEncounterIndex(nextIndex)
      setShowEncounter(true)
    } else {
      // No more encounters, complete session
      completeSession()
    }
  }

  const endSession = () => {
    completeSession()
  }

  const attemptCapture = async () => {
    const currentEncounter = getCurrentEncounter()
    if (!currentEncounter || currentEncounter.caught || !session || isCapturing) return

    console.log('🎯 Attempting to catch:', currentEncounter.species)
    setIsCapturing(true)

    try {
      const result = await huntApi.attemptCatch(session.id, currentEncounter.id, 'pokeball')
      console.log('✅ Catch result:', result)
      
      if (result.success && result.data) {
        if (result.data.success && result.data.pet) {
          // Successfully caught
          const updatedEncounters = [...encounters]
          updatedEncounters[currentEncounterIndex] = { ...currentEncounter, caught: true }
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
                setShowEncounter(false)
                setIsCapturing(false)
                setTimeout(() => moveToNextEncounter(), 300)
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
                setShowEncounter(false)
                setIsCapturing(false)
                setTimeout(() => moveToNextEncounter(), 300)
              }
            }]
          )
        }
      }
    } catch (error) {
      console.error('❌ Error attempting catch:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to catch Pokemon')
      setIsCapturing(false)
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
          onPress: () => {
            setShowEncounter(false)
            setTimeout(() => moveToNextEncounter(), 300)
          }
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

  const makeMove = (direction: 'up' | 'down' | 'left' | 'right') => {
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

    // Show the current encounter
    setShowEncounter(true)
  }

  const EncounterModal = () => {
    const currentEncounter = getCurrentEncounter()
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
        energy={80}
        maxEnergy={100}
        onSettingsPress={() => router.push('/profile')}
      />

      <View style={styles.container}>
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
              style={[styles.movementButton, actionsLeft <= 0 && styles.disabledButton]}
              onPress={() => makeMove('up')}
              disabled={actionsLeft <= 0}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                <Ionicons name="arrow-up" size={28} color="#FFD700" />
                <ThemedText style={styles.movementLabel}>Up</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
          
          {/* Left and Right Buttons */}
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={[styles.movementButton, actionsLeft <= 0 && styles.disabledButton]}
              onPress={() => makeMove('left')}
              disabled={actionsLeft <= 0}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                <Ionicons name="arrow-back" size={28} color="#FFD700" />
                <ThemedText style={styles.movementLabel}>Left</ThemedText>
              </Panel>
            </TouchableOpacity>
            
            <View style={styles.dpadSpacer} />
            
            <TouchableOpacity 
              style={[styles.movementButton, actionsLeft <= 0 && styles.disabledButton]}
              onPress={() => makeMove('right')}
              disabled={actionsLeft <= 0}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                <Ionicons name="arrow-forward" size={28} color="#FFD700" />
                <ThemedText style={styles.movementLabel}>Right</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
          
          {/* Down Button */}
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={[styles.movementButton, actionsLeft <= 0 && styles.disabledButton]}
              onPress={() => makeMove('down')}
              disabled={actionsLeft <= 0}
            >
              <Panel variant="dark" style={styles.buttonPanel}>
                <Ionicons name="arrow-down" size={28} color="#FFD700" />
                <ThemedText style={styles.movementLabel}>Down</ThemedText>
              </Panel>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exit button */}
        <View style={styles.exitContainer}>
          <TouchableOpacity
            onPress={() => {
              showCustomAlert(
                'Exit Hunting Session?',
                'Are you sure you want to exit? You will lose any remaining actions.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', onPress: endSession, style: 'destructive' }
                ]
              )
            }}
            style={styles.exitButtonContainer}
          >
            <LinearGradient
              colors={['#EF5350', '#E53935']}
              style={styles.exitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.exitButtonText}>Exit Session</ThemedText>
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
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
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
