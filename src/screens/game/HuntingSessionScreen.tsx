import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Alert, Animated } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getUserCurrency, getUserProfile, getRegionById } from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Item } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

type EncounterType = 'nothing' | 'monster' | 'treasure'

interface Monster {
  id: string
  name: string
  species: string
  image: string
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
  const router = useRouter()
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams()
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
  
  // Animation values
  const [moveAnimation] = useState(new Animated.Value(0))

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
      const monsters: Monster[] = [
        {
          id: 'monster-1',
          name: 'Wild Fluffy',
          species: 'Fluffball',
          image: 'https://via.placeholder.com/120/4CAF50/FFFFFF?text=🐾',
          rarity: 'Common',
          level: Math.max(1, profile.level + Math.floor(Math.random() * 3) - 1),
          captureRate: 0.7
        },
        {
          id: 'monster-2', 
          name: 'Forest Sprite',
          species: 'Woodling',
          image: 'https://via.placeholder.com/120/8BC34A/FFFFFF?text=🌱',
          rarity: 'Rare',
          level: Math.max(1, profile.level + Math.floor(Math.random() * 5) - 2),
          captureRate: 0.5
        },
        {
          id: 'monster-3',
          name: 'Mystic Beast',
          species: 'Shadowfang',
          image: 'https://via.placeholder.com/120/9C27B0/FFFFFF?text=⚡',
          rarity: 'Epic',
          level: Math.max(1, profile.level + Math.floor(Math.random() * 7) - 3),
          captureRate: 0.3
        }
      ]
      
      const randomMonster = monsters[Math.floor(Math.random() * monsters.length)]
      
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
    if (!currentEncounter?.monster || captureAttempts >= 5) return

    setIsCapturing(true)
    setCaptureAttempts(prev => prev + 1)

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
          moves: [], // Will be assigned properly in real implementation
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
        
        Alert.alert(
          'Capture Successful!',
          `You successfully captured ${currentEncounter.monster!.name}!`,
          [{ text: 'Continue', onPress: () => setShowEncounter(false) }]
        )
      } else {
        if (captureAttempts >= 4) {
          // Monster escapes after 5 failed attempts
          Alert.alert(
            'Monster Escaped!',
            `${currentEncounter.monster!.name} escaped after ${captureAttempts + 1} attempts!`,
            [{ text: 'Continue', onPress: () => setShowEncounter(false) }]
          )
        } else {
          Alert.alert(
            'Capture Failed!',
            `Capture attempt failed! ${5 - (captureAttempts + 1)} attempts remaining.`,
            [{ text: 'Try Again' }]
          )
        }
      }
      
      setIsCapturing(false)
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
    Alert.alert(
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

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '⬆️'
      case 'down': return '⬇️'
      case 'left': return '⬅️'
      case 'right': return '➡️'
      default: return '❓'
    }
  }

  const EncounterModal = () => (
    <Modal visible={showEncounter} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {currentEncounter && (
            <>
              {currentEncounter.type === 'monster' && currentEncounter.monster && (
                <View style={styles.encounterContent}>
                  <ThemedText type="title" style={styles.encounterTitle}>
                    Wild {currentEncounter.monster.species} Appears!
                  </ThemedText>
                  <Image source={{ uri: currentEncounter.monster.image }} style={styles.monsterImage} />
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
                    <ButtonPrimary 
                      style={styles.captureButton}
                      onPress={attemptCapture}
                      disabled={captureAttempts >= 5 || isCapturing}
                    >
                      {isCapturing ? 'Capturing...' : captureAttempts >= 5 ? 'Escaped' : 'Attempt Capture'}
                    </ButtonPrimary>
                    <ButtonSecondary 
                      style={styles.runButton}
                      onPress={() => setShowEncounter(false)}
                      disabled={isCapturing}
                    >
                      Run Away
                    </ButtonSecondary>
                  </View>
                </View>
              )}

              {currentEncounter.type === 'treasure' && currentEncounter.treasure && (
                <View style={styles.encounterContent}>
                  <ThemedText type="title" style={styles.encounterTitle}>
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
                  <ButtonPrimary onPress={handleTreasureReward}>
                    Collect Reward
                  </ButtonPrimary>
                </View>
              )}

              {currentEncounter.type === 'nothing' && (
                <View style={styles.encounterContent}>
                  <ThemedText type="title" style={styles.encounterTitle}>
                    Nothing Here...
                  </ThemedText>
                  <ThemedText style={styles.emptyIcon}>🕳️</ThemedText>
                  <ThemedText style={styles.emptyText}>
                    You explore the area but find nothing of interest.
                  </ThemedText>
                  <ButtonPrimary onPress={() => setShowEncounter(false)}>
                    Continue Exploring
                  </ButtonPrimary>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  )

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return colors.gray
      case 'Rare': return colors.info
      case 'Epic': return colors.warning
      case 'Legendary': return colors.error
      default: return colors.gray
    }
  }

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        {/* Header with session info */}
        <View style={styles.header}>
          <View style={styles.sessionInfo}>
            <ThemedText type="title" style={styles.regionName}>
              {params.regionName}
            </ThemedText>
            <ThemedText style={styles.sessionSubtitle}>Dungeon Exploration</ThemedText>
          </View>
          <View style={styles.actionsCounter}>
            <ThemedText style={styles.actionsText}>Actions Left</ThemedText>
            <ThemedText style={styles.actionsNumber}>{actionsLeft}</ThemedText>
          </View>
        </View>

        {/* Session rewards summary */}
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

        {/* Movement controls */}
        <View style={styles.movementControls}>
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={styles.movementButton}
              onPress={() => makeMove('up')}
              disabled={actionsLeft <= 0}
            >
              <ThemedText style={styles.movementIcon}>{getDirectionIcon('up')}</ThemedText>
              <ThemedText style={styles.movementLabel}>Up</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={styles.movementButton}
              onPress={() => makeMove('left')}
              disabled={actionsLeft <= 0}
            >
              <ThemedText style={styles.movementIcon}>{getDirectionIcon('left')}</ThemedText>
              <ThemedText style={styles.movementLabel}>Left</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.movementButton}
              onPress={() => makeMove('right')}
              disabled={actionsLeft <= 0}
            >
              <ThemedText style={styles.movementIcon}>{getDirectionIcon('right')}</ThemedText>
              <ThemedText style={styles.movementLabel}>Right</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.movementRow}>
            <TouchableOpacity 
              style={styles.movementButton}
              onPress={() => makeMove('down')}
              disabled={actionsLeft <= 0}
            >
              <ThemedText style={styles.movementIcon}>{getDirectionIcon('down')}</ThemedText>
              <ThemedText style={styles.movementLabel}>Down</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exit button */}
        <View style={styles.exitContainer}>
          <ButtonSecondary 
            onPress={() => {
              Alert.alert(
                'Exit Hunting Session?',
                'Are you sure you want to exit? You will lose any remaining actions.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', onPress: endSession }
                ]
              )
            }}
          >
            Exit Session
          </ButtonSecondary>
        </View>

        <EncounterModal />
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: metrics.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.large,
    paddingBottom: metrics.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  sessionInfo: {
    flex: 1,
  },
  regionName: {
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  sessionSubtitle: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  actionsCounter: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.small,
    borderRadius: metrics.borderRadius,
  },
  actionsText: {
    color: colors.white,
    fontSize: fontSizes.small,
    marginBottom: metrics.tiny,
  },
  actionsNumber: {
    color: colors.white,
    fontSize: fontSizes.title,
    fontWeight: 'bold',
  },
  rewardsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: fontSizes.small,
    color: colors.gray,
    marginBottom: metrics.tiny,
  },
  rewardValue: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.primary,
  },
  explorationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: metrics.large,
  },
  explorerIcon: {
    marginBottom: metrics.medium,
  },
  explorerEmoji: {
    fontSize: 60,
  },
  explorationHint: {
    fontSize: fontSizes.body,
    color: colors.gray,
    textAlign: 'center',
  },
  movementControls: {
    alignItems: 'center',
    marginBottom: metrics.large,
  },
  movementRow: {
    flexDirection: 'row',
    gap: metrics.large,
    marginVertical: metrics.small,
  },
  movementButton: {
    backgroundColor: colors.white,
    padding: metrics.large,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 80,
    minHeight: 80,
  },
  movementIcon: {
    fontSize: 24,
    marginBottom: metrics.small,
  },
  movementLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  exitContainer: {
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.large,
  },
  encounterContent: {
    alignItems: 'center',
  },
  encounterTitle: {
    textAlign: 'center',
    marginBottom: metrics.large,
    color: colors.primary,
  },
  monsterImage: {
    width: 120,
    height: 120,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  monsterName: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: metrics.small,
  },
  monsterRarity: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: metrics.large,
  },
  captureInfo: {
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
    width: '100%',
  },
  captureText: {
    textAlign: 'center',
    fontSize: fontSizes.body,
    marginBottom: metrics.small,
  },
  captureRate: {
    textAlign: 'center',
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  encounterActions: {
    flexDirection: 'row',
    gap: metrics.medium,
    width: '100%',
  },
  captureButton: {
    flex: 2,
  },
  runButton: {
    flex: 1,
  },
  treasureIcon: {
    fontSize: 60,
    marginBottom: metrics.medium,
  },
  treasureText: {
    fontSize: fontSizes.large,
    textAlign: 'center',
    marginBottom: metrics.large,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: metrics.medium,
  },
  emptyText: {
    fontSize: fontSizes.body,
    textAlign: 'center',
    color: colors.gray,
    marginBottom: metrics.large,
  },
})
