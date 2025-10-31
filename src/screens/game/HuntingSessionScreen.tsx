import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Animated, ImageBackground } from 'react-native'
import { ThemedText } from '@/components'
import { Panel, TopBar, IconButton, CustomAlert } from '@/components/ui'
import { useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getUserCurrency, getUserProfile, getRegionById } from '@/stores/selectors'
import { Pet, Item } from '@/stores/types/game'
import { useAppDispatch, RootState } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { getPetImageByName } from '@/assets/images'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

type EncounterType = 'nothing' | 'monster' | 'treasure'

interface Monster {
  id: string
  name: string
  species: string
  image: any  // Image require() object from getPetImageByName
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  level: number
  captureRate: number
}

interface TreasureReward {
  type: 'coins' | 'item'
  amount?: number
  item?: Item
}

interface EncounterResult {
  type: EncounterType
  monster?: Monster
  treasure?: TreasureReward
  xp: number
}

export const HuntingSessionScreen: React.FC = () => {
  const params = useLocalSearchParams<{ regionName: string; regionId: string; huntCost?: string }>()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userProfile = useSelector((state: RootState) => state.game.userProfile)
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)
  const region = useSelector(getRegionById(params.regionId as string))
  
  const [actionsLeft, setActionsLeft] = useState(20) // 20 actions per session
  const [currentEncounter, setCurrentEncounter] = useState<EncounterResult | null>(null)
  const [showEncounter, setShowEncounter] = useState(false)
  const [captureAttempts, setCaptureAttempts] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [sessionRewards, setSessionRewards] = useState({
    totalXp: 0,
    totalCoins: 0,
    petsFound: 0,
    itemsFound: 0
  })
  const [sessionStarted, setSessionStarted] = useState(false)
  
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

  useEffect(() => {
    if (!sessionStarted && params.regionId) {
      // Deduct hunt cost when session starts
      const huntCost = parseInt(params.huntCost as string) || 0
      dispatch(gameActions.spendCurrency({ coins: huntCost }))
      setSessionStarted(true)
    }
  }, [params.regionId, params.huntCost, sessionStarted, dispatch])

  const generateRandomEncounter = (): EncounterResult => {
    const random = Math.random()
    
    if (random < 0.4) {
      // 40% chance for monster encounter
      const monsterData = [
        { species: 'Rattata', rarity: 'Common' as const, captureRate: 0.7 },
        { species: 'Pidgey', rarity: 'Common' as const, captureRate: 0.7 },
        { species: 'Caterpie', rarity: 'Common' as const, captureRate: 0.8 },
        { species: 'Oddish', rarity: 'Rare' as const, captureRate: 0.5 },
        { species: 'Bellsprout', rarity: 'Rare' as const, captureRate: 0.5 },
        { species: 'Scyther', rarity: 'Epic' as const, captureRate: 0.3 },
        { species: 'Pinsir', rarity: 'Epic' as const, captureRate: 0.3 },
      ]
      
      const randomMonsterData = monsterData[Math.floor(Math.random() * monsterData.length)]
      
      const monsters: Monster[] = [
        {
          id: 'monster-' + Date.now(),
          name: randomMonsterData.species,
          species: randomMonsterData.species,
          image: getPetImageByName(randomMonsterData.species),
          rarity: randomMonsterData.rarity,
          level: Math.max(1, profile.level + Math.floor(Math.random() * 3) - 1),
          captureRate: randomMonsterData.captureRate
        }
      ]
      
      const randomMonster = monsters[0]
      
      return {
        type: 'monster',
        monster: randomMonster,
        xp: 15 + Math.floor(Math.random() * 10)
      }
    } else if (random < 0.7) {
      // 30% chance for treasure
      const treasureType = Math.random() < 0.6 ? 'coins' : 'item'
      
      if (treasureType === 'coins') {
        return {
          type: 'treasure',
          treasure: {
            type: 'coins',
            amount: 50 + Math.floor(Math.random() * 100)
          },
          xp: 10
        }
      } else {
        const items = [
          { id: 'item-heal-001', name: 'Health Potion' },
          { id: 'item-xp-001', name: 'XP Boost' },
          { id: 'item-evo-001', name: 'Evolution Stone' }
        ]
        const randomItem = items[Math.floor(Math.random() * items.length)]
        
        return {
          type: 'treasure',
          treasure: {
            type: 'item',
            item: {
              id: randomItem.id,
              name: randomItem.name,
              description: 'Found during hunting',
              type: 'Consumable',
              rarity: 'Common',
              effects: {},
              price: { coins: 100 },
              image: 'https://via.placeholder.com/80/2196F3/FFFFFF?text=📦'
            } as Item
          },
          xp: 8
        }
      }
    } else {
      // 30% chance for nothing
      return {
        type: 'nothing',
        xp: 5
      }
    }
  }

  const makeMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (actionsLeft <= 0) return

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

    const encounter = generateRandomEncounter()
    setCurrentEncounter(encounter)
    setShowEncounter(true)
    setActionsLeft(prev => prev - 1)
    setCaptureAttempts(0)
    
    // Update session rewards
    setSessionRewards(prev => ({
      ...prev,
      totalXp: prev.totalXp + encounter.xp
    }))
    
    // Award XP to player
    dispatch(gameActions.addXp({ amount: encounter.xp }))
  }

  const attemptCapture = () => {
    if (!currentEncounter?.monster || captureAttempts >= 5 || isCapturing) return

    setIsCapturing(true)
    const newAttemptCount = captureAttempts + 1
    setCaptureAttempts(newAttemptCount)

    setTimeout(() => {
      const success = Math.random() < currentEncounter.monster!.captureRate
      
      if (success) {
        // Successfully captured the monster
        const newPet: Pet = {
          id: 'pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          name: currentEncounter.monster!.name,
          species: currentEncounter.monster!.species,
          rarity: currentEncounter.monster!.rarity,
          level: currentEncounter.monster!.level,
          xp: 0,
          xpToNext: 100,
          stats: {
            hp: 30 + Math.floor(Math.random() * 20),
            maxHp: 30 + Math.floor(Math.random() * 20),
            attack: 15 + Math.floor(Math.random() * 10),
            defense: 12 + Math.floor(Math.random() * 8),
            speed: 18 + Math.floor(Math.random() * 12),
          },
          moves: [], // Moves will be assigned based on species
          image: currentEncounter.monster!.image,
          evolutionStage: 1,
          maxEvolutionStage: 3,
          evolutionRequirements: { level: 15, itemId: 'item-evo-001' },
          isLegendary: false,
          ownerId: profile.id,
          isForSale: false,
          mood: Math.floor(Math.random() * 30) + 70,
          lastFed: Date.now(),
        }

        dispatch(gameActions.addPet(newPet))
        setSessionRewards(prev => ({ ...prev, petsFound: prev.petsFound + 1 }))
        
        showCustomAlert(
          'Capture Successful!',
          `You successfully captured ${currentEncounter.monster!.name}!`,
          [{ text: 'Continue', onPress: () => {
            setShowEncounter(false)
            setIsCapturing(false)
          }}]
        )
      } else {
        if (newAttemptCount >= 5) {
          // Monster escapes after 5 failed attempts
          showCustomAlert(
            'Monster Escaped!',
            `${currentEncounter.monster!.name} escaped after ${newAttemptCount} attempts!`,
            [{ text: 'Continue', onPress: () => {
              setShowEncounter(false)
              setIsCapturing(false)
            }}]
          )
        } else {
          showCustomAlert(
            'Capture Failed!',
            `Capture attempt failed! ${5 - newAttemptCount} attempts remaining.`,
            [{ text: 'Try Again', onPress: () => setIsCapturing(false) }]
          )
        }
      }
    }, 1000)
  }

  const handleTreasureReward = () => {
    if (currentEncounter?.treasure) {
      if (currentEncounter.treasure.type === 'coins') {
        dispatch(gameActions.addCurrency({ coins: currentEncounter.treasure.amount! }))
        setSessionRewards(prev => ({ 
          ...prev, 
          totalCoins: prev.totalCoins + currentEncounter.treasure!.amount! 
        }))
      } else if (currentEncounter.treasure.item) {
        dispatch(gameActions.addItem({ itemId: currentEncounter.treasure.item.id, quantity: 1 }))
        setSessionRewards(prev => ({ ...prev, itemsFound: prev.itemsFound + 1 }))
      }
    }
    setShowEncounter(false)
  }

  const endSession = () => {
    showCustomAlert(
      'Hunting Session Complete!',
      `Session Summary:\n• ${sessionRewards.totalXp} Total XP\n• ${sessionRewards.totalCoins} Coins Found\n• ${sessionRewards.petsFound} Pets Captured\n• ${sessionRewards.itemsFound} Items Found`,
      [
        {
          text: 'Return to Hunting Grounds',
          onPress: () => router.back()
        }
      ]
    )
  }

  useEffect(() => {
    if (actionsLeft === 0 && !showEncounter) {
      endSession()
    }
  }, [actionsLeft, showEncounter])

  const EncounterModal = () => (
    <Modal visible={showEncounter} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Panel variant="dark" style={styles.modalContent}>
          {currentEncounter && (
            <>
              {currentEncounter.type === 'monster' && currentEncounter.monster && (
                <View style={styles.encounterContent}>
                  <ThemedText style={styles.encounterTitle}>
                    Wild {currentEncounter.monster.species} Appears!
                  </ThemedText>
                  <Image source={currentEncounter.monster.image} style={styles.monsterImage} />
                  <ThemedText style={styles.monsterName}>
                    {currentEncounter.monster.name} (Level {currentEncounter.monster.level})
                  </ThemedText>
                  <ThemedText style={[styles.monsterRarity, { color: getRarityColor(currentEncounter.monster.rarity) }]}>
                    {currentEncounter.monster.rarity}
                  </ThemedText>
                  
                  <View style={styles.captureInfo}>
                    <ThemedText style={styles.captureText}>
                      Capture Attempts: {captureAttempts}/5
                    </ThemedText>
                    <ThemedText style={styles.captureRate}>
                      Capture Rate: {(currentEncounter.monster.captureRate * 100).toFixed(0)}%
                    </ThemedText>
                  </View>

                  <View style={styles.encounterActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, (captureAttempts >= 5 || isCapturing) && styles.disabledButton]}
                      onPress={attemptCapture}
                      disabled={captureAttempts >= 5 || isCapturing}
                    >
                      <LinearGradient
                        colors={captureAttempts >= 5 || isCapturing ? ['#666', '#444'] : ['#4CAF50', '#45a049']}
                        style={styles.gradientButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <ThemedText style={styles.buttonText}>
                          {isCapturing ? 'Capturing...' : captureAttempts >= 5 ? 'Escaped' : 'Attempt Capture'}
                        </ThemedText>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, isCapturing && styles.disabledButton]}
                      onPress={() => setShowEncounter(false)}
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
              )}

              {currentEncounter.type === 'treasure' && currentEncounter.treasure && (
                <View style={styles.encounterContent}>
                  <ThemedText style={styles.encounterTitle}>
                    Treasure Found!
                  </ThemedText>
                  <ThemedText style={styles.treasureIcon}>💎</ThemedText>
                  {currentEncounter.treasure.type === 'coins' ? (
                    <ThemedText style={styles.treasureText}>
                      You found {currentEncounter.treasure.amount} coins!
                    </ThemedText>
                  ) : (
                    <ThemedText style={styles.treasureText}>
                      You found a {currentEncounter.treasure.item?.name}!
                    </ThemedText>
                  )}
                  <TouchableOpacity style={styles.actionButton} onPress={handleTreasureReward}>
                    <LinearGradient
                      colors={['#4CAF50', '#45a049']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.buttonText}>Collect Reward</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {currentEncounter.type === 'nothing' && (
                <View style={styles.encounterContent}>
                  <ThemedText style={styles.encounterTitle}>
                    Nothing Here...
                  </ThemedText>
                  <ThemedText style={styles.emptyIcon}>🕳️</ThemedText>
                  <ThemedText style={styles.emptyText}>
                    You explore the area but find nothing of interest.
                  </ThemedText>
                  <TouchableOpacity style={styles.actionButton} onPress={() => setShowEncounter(false)}>
                    <LinearGradient
                      colors={['#2196F3', '#1976D2']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.buttonText}>Continue Exploring</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </Panel>
      </View>
    </Modal>
  )

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
