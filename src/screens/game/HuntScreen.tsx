import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, Alert } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { 
  getAvailableRegions, 
  getUserCurrency, 
  getRegionHuntingCost,
  canHuntInRegion,
  getUserProfile,
  getHuntingCooldowns
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Region, HuntResult, Pet } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

export const HuntScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const availableRegions = useSelector(getAvailableRegions)
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)
  const huntingCooldowns = useSelector(getHuntingCooldowns)
  
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [showHuntResult, setShowHuntResult] = useState(false)
  const [lastHuntResult, setLastHuntResult] = useState<HuntResult | null>(null)
  const [isHunting, setIsHunting] = useState(false)
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const newTimers: { [key: string]: number } = {}
      
      Object.entries(huntingCooldowns).forEach(([regionId, cooldownEnd]) => {
        if (cooldownEnd > now) {
          newTimers[regionId] = Math.ceil((cooldownEnd - now) / 1000)
        }
      })
      
      setCooldownTimers(newTimers)
    }, 1000)

    return () => clearInterval(interval)
  }, [huntingCooldowns])

  const getRegionHuntCost = (region: Region): number => {
    let cost = region.huntingCost
    if (region.legendPetId && region.legendOwnerId && region.legendOwnerId !== profile.id) {
      cost += region.legendFee
    }
    return cost
  }

  const canAffordHunt = (region: Region): boolean => {
    return currency.coins >= getRegionHuntCost(region)
  }

  const isRegionOnCooldown = (regionId: string): boolean => {
    return cooldownTimers[regionId] > 0
  }

  const generateHuntResult = (region: Region): HuntResult => {
    const random = Math.random()
    
    // 60% chance for pet encounter, 25% for item, 15% for empty
    if (random < 0.6) {
      // Generate a pet based on region's available pets
      const availablePets = region.availablePets
      const totalSpawnRate = availablePets.reduce((sum, pet) => sum + pet.spawnRate, 0)
      const spawnRoll = Math.random() * totalSpawnRate
      
      let currentRate = 0
      let selectedPetType = availablePets[0]
      
      for (const petType of availablePets) {
        currentRate += petType.spawnRate
        if (spawnRoll <= currentRate) {
          selectedPetType = petType
          break
        }
      }

      const newPet: Pet = {
        id: 'pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: selectedPetType.petSpecies + ' #' + Math.floor(Math.random() * 1000),
        species: selectedPetType.petSpecies,
        rarity: selectedPetType.rarity,
        level: Math.max(1, profile.level + Math.floor(Math.random() * 5) - 2),
        xp: 0,
        xpToNext: 100,
        stats: {
          hp: 30 + Math.floor(Math.random() * 20),
          maxHp: 30 + Math.floor(Math.random() * 20),
          attack: 15 + Math.floor(Math.random() * 10),
          defense: 12 + Math.floor(Math.random() * 8),
          speed: 18 + Math.floor(Math.random() * 12),
        },
        image: 'https://via.placeholder.com/120/4CAF50/FFFFFF?text=🐾',
        evolutionStage: 1,
        maxEvolutionStage: 3,
        evolutionRequirements: {
          level: 15,
          itemId: 'item-evo-001'
        },
        isLegendary: false,
        ownerId: profile.id,
        isForSale: false,
        mood: Math.floor(Math.random() * 30) + 70,
        lastFed: Date.now(),
      }

      return {
        type: 'pet',
        pet: newPet,
        xp: 25,
        coins: 10
      }
    } else if (random < 0.85) {
      // Item drop
      const items = ['item-heal-001', 'item-xp-001', 'item-evo-001']
      const randomItem = items[Math.floor(Math.random() * items.length)]
      
      return {
        type: 'item',
        item: {
          id: randomItem,
          name: 'Found Item',
          description: 'An item found while hunting',
          type: 'Consumable',
          rarity: 'Common',
          effects: {},
          price: { coins: 100 },
          image: 'https://via.placeholder.com/80/2196F3/FFFFFF?text=📦'
        },
        xp: 15,
        coins: 5
      }
    } else {
      // Empty run
      return {
        type: 'empty',
        xp: 5,
        coins: 0
      }
    }
  }

  const startHunt = async (region: Region) => {
    if (!canAffordHunt(region) || isRegionOnCooldown(region.id)) {
      return
    }

    setIsHunting(true)
    const huntCost = getRegionHuntCost(region)
    
    // Simulate hunting delay
    setTimeout(() => {
      const result = generateHuntResult(region)
      
      // Process hunt result
      dispatch(gameActions.processHuntResult({
        regionId: region.id,
        result,
        cost: huntCost
      }))
      
      // Add pet if found
      if (result.type === 'pet' && result.pet) {
        dispatch(gameActions.addPet(result.pet))
      }
      
      // Add item if found
      if (result.type === 'item' && result.item) {
        dispatch(gameActions.addItem({ itemId: result.item.id, quantity: 1 }))
      }
      
      // Set cooldown (30 seconds for demo, would be longer in real game)
      dispatch(gameActions.setHuntingCooldown({
        regionId: region.id,
        cooldownEnd: Date.now() + 30000
      }))
      
      // Transfer legend fee if applicable
      if (region.legendOwnerId && region.legendOwnerId !== profile.id) {
        // In real implementation, this would transfer to the legend owner
        dispatch(gameActions.addNotification({
          id: 'notif-' + Date.now(),
          type: 'hunt_result',
          title: 'Someone hunted in your region!',
          message: `You received ${region.legendFee} coins from ${region.name}`,
          data: { regionId: region.id, fee: region.legendFee },
          read: false,
          timestamp: Date.now()
        }))
      }
      
      setLastHuntResult(result)
      setIsHunting(false)
      setShowHuntResult(true)
    }, 2000)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderRegionCard = ({ item: region }: { item: Region }) => {
    const huntCost = getRegionHuntCost(region)
    const canAfford = canAffordHunt(region)
    const onCooldown = isRegionOnCooldown(region.id)
    const cooldownTime = cooldownTimers[region.id] || 0
    
    return (
      <TouchableOpacity 
        style={[
          styles.regionCard,
          (!canAfford || onCooldown) && styles.disabledRegionCard
        ]}
        onPress={() => setSelectedRegion(region)}
        disabled={!canAfford || onCooldown}
      >
        <Image source={{ uri: region.image }} style={styles.regionImage} />
        <View style={styles.regionInfo}>
          <ThemedText type="defaultSemiBold" style={styles.regionName}>
            {region.name}
          </ThemedText>
          <ThemedText style={styles.regionDescription} numberOfLines={2}>
            {region.description}
          </ThemedText>
          
          <View style={styles.regionStats}>
            <View style={styles.costContainer}>
              <ThemedText style={styles.costText}>
                💰 {huntCost} coins
              </ThemedText>
              {region.legendPetId && (
                <ThemedText style={styles.legendFeeText}>
                  (👑 +{region.legendFee} legend fee)
                </ThemedText>
              )}
            </View>
            
            {onCooldown ? (
              <View style={styles.cooldownContainer}>
                <ThemedText style={styles.cooldownText}>
                  ⏰ {formatTime(cooldownTime)}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.petsContainer}>
                <ThemedText style={styles.petsText}>
                  🐾 {region.availablePets.length} species
                </ThemedText>
              </View>
            )}
          </View>
          
          {region.legendOwnerId === profile.id && (
            <View style={styles.ownedBadge}>
              <ThemedText style={styles.ownedText}>👑 Your Region</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const RegionDetailsModal = () => (
    <Modal visible={!!selectedRegion} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedRegion && (
            <>
              <Image source={{ uri: selectedRegion.image }} style={styles.modalRegionImage} />
              <ThemedText type="title" style={styles.modalRegionName}>
                {selectedRegion.name}
              </ThemedText>
              <ThemedText style={styles.modalRegionDescription}>
                {selectedRegion.description}
              </ThemedText>
              
              <View style={styles.modalSection}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Available Pets
                </ThemedText>
                {selectedRegion.availablePets.map((pet, index) => (
                  <View key={index} style={styles.petTypeRow}>
                    <ThemedText style={styles.petTypeName}>{pet.petSpecies}</ThemedText>
                    <ThemedText style={[
                      styles.petTypeRarity,
                      { color: getRarityColor(pet.rarity) }
                    ]}>
                      {pet.rarity} ({(pet.spawnRate * 100).toFixed(1)}%)
                    </ThemedText>
                  </View>
                ))}
              </View>
              
              <View style={styles.modalSection}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Hunt Cost
                </ThemedText>
                <ThemedText style={styles.costBreakdown}>
                  Base Cost: {selectedRegion.huntingCost} coins
                </ThemedText>
                {selectedRegion.legendPetId && selectedRegion.legendOwnerId !== profile.id && (
                  <ThemedText style={styles.costBreakdown}>
                    Legend Fee: {selectedRegion.legendFee} coins
                  </ThemedText>
                )}
                <ThemedText style={styles.totalCost}>
                  Total: {getRegionHuntCost(selectedRegion)} coins
                </ThemedText>
              </View>
              
              <View style={styles.modalActions}>
                <ButtonPrimary 
                  style={styles.huntButton}
                  onPress={() => {
                    setSelectedRegion(null)
                    startHunt(selectedRegion)
                  }}
                  disabled={
                    !canAffordHunt(selectedRegion) || 
                    isRegionOnCooldown(selectedRegion.id) ||
                    isHunting
                  }
                >
                  {isRegionOnCooldown(selectedRegion.id) 
                    ? `Cooldown: ${formatTime(cooldownTimers[selectedRegion.id] || 0)}`
                    : 'Start Hunt'
                  }
                </ButtonPrimary>
                <ButtonSecondary 
                  style={styles.closeButton}
                  onPress={() => setSelectedRegion(null)}
                >
                  Close
                </ButtonSecondary>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )

  const HuntResultModal = () => (
    <Modal visible={showHuntResult} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.resultModalContent}>
          {lastHuntResult && (
            <>
              <ThemedText type="title" style={styles.resultTitle}>
                Hunt Complete!
              </ThemedText>
              
              {lastHuntResult.type === 'pet' && lastHuntResult.pet && (
                <View style={styles.resultContent}>
                  <Image source={{ uri: lastHuntResult.pet.image }} style={styles.resultImage} />
                  <ThemedText type="defaultSemiBold" style={styles.resultText}>
                    You found a {lastHuntResult.pet.rarity} {lastHuntResult.pet.species}!
                  </ThemedText>
                  <ThemedText style={styles.resultName}>
                    {lastHuntResult.pet.name}
                  </ThemedText>
                </View>
              )}
              
              {lastHuntResult.type === 'item' && lastHuntResult.item && (
                <View style={styles.resultContent}>
                  <Image source={{ uri: lastHuntResult.item.image }} style={styles.resultImage} />
                  <ThemedText type="defaultSemiBold" style={styles.resultText}>
                    You found an item!
                  </ThemedText>
                  <ThemedText style={styles.resultName}>
                    {lastHuntResult.item.name}
                  </ThemedText>
                </View>
              )}
              
              {lastHuntResult.type === 'empty' && (
                <View style={styles.resultContent}>
                  <ThemedText style={styles.emptyResultText}>
                    🔍 No pets or items found this time...
                  </ThemedText>
                  <ThemedText style={styles.emptyResultSubtext}>
                    Better luck next hunt!
                  </ThemedText>
                </View>
              )}
              
              <View style={styles.rewardsContainer}>
                <ThemedText style={styles.rewardsText}>
                  +{lastHuntResult.xp} XP  •  +{lastHuntResult.coins} Coins
                </ThemedText>
              </View>
              
              <ButtonPrimary onPress={() => setShowHuntResult(false)}>
                Continue
              </ButtonPrimary>
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
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Hunting Grounds</ThemedText>
          <View style={styles.currencyContainer}>
            <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
            <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
          </View>
        </View>

        {isHunting && (
          <View style={styles.huntingIndicator}>
            <ThemedText style={styles.huntingText}>🔍 Hunting in progress...</ThemedText>
          </View>
        )}

        <FlatList
          data={availableRegions}
          renderItem={renderRegionCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.regionsList}
        />

        <RegionDetailsModal />
        <HuntResultModal />
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
  },
  title: {
    color: colors.primary,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: metrics.small,
  },
  currency: {
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  huntingIndicator: {
    backgroundColor: colors.primary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
    alignItems: 'center',
  },
  huntingText: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  regionsList: {
    paddingBottom: metrics.huge,
  },
  regionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    marginBottom: metrics.medium,
    elevation: 3,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledRegionCard: {
    opacity: 0.6,
  },
  regionImage: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius,
  },
  regionInfo: {
    flex: 1,
    marginLeft: metrics.medium,
  },
  regionName: {
    fontSize: fontSizes.large,
    marginBottom: metrics.tiny,
    color: colors.primary,
  },
  regionDescription: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
    lineHeight: 18,
  },
  regionStats: {
    marginBottom: metrics.small,
  },
  costContainer: {
    marginBottom: metrics.tiny,
  },
  costText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
  legendFeeText: {
    fontSize: fontSizes.small,
    color: colors.warning,
    fontStyle: 'italic',
  },
  cooldownContainer: {
    backgroundColor: colors.error,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
    alignSelf: 'flex-start',
  },
  cooldownText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  petsContainer: {
    backgroundColor: colors.info,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
    alignSelf: 'flex-start',
  },
  petsText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  ownedBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
    alignSelf: 'flex-start',
  },
  ownedText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.large,
  },
  modalRegionImage: {
    width: '100%',
    height: 150,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  modalRegionName: {
    textAlign: 'center',
    marginBottom: metrics.small,
    color: colors.primary,
  },
  modalRegionDescription: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: metrics.large,
    lineHeight: 20,
  },
  modalSection: {
    marginBottom: metrics.large,
  },
  sectionTitle: {
    fontSize: fontSizes.body,
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  petTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: metrics.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  petTypeName: {
    fontSize: fontSizes.body,
  },
  petTypeRarity: {
    fontSize: fontSizes.span,
    fontWeight: '600',
  },
  costBreakdown: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.tiny,
  },
  totalCost: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
    marginTop: metrics.small,
  },
  modalActions: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  huntButton: {
    flex: 2,
  },
  closeButton: {
    flex: 1,
  },
  resultModalContent: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.large,
    alignItems: 'center',
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: metrics.large,
    color: colors.primary,
  },
  resultContent: {
    alignItems: 'center',
    marginBottom: metrics.large,
  },
  resultImage: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  resultText: {
    textAlign: 'center',
    fontSize: fontSizes.large,
    marginBottom: metrics.small,
  },
  resultName: {
    textAlign: 'center',
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  emptyResultText: {
    textAlign: 'center',
    fontSize: fontSizes.large,
    marginBottom: metrics.small,
    color: colors.gray,
  },
  emptyResultSubtext: {
    textAlign: 'center',
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  rewardsContainer: {
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
  },
  rewardsText: {
    textAlign: 'center',
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
  },
})
