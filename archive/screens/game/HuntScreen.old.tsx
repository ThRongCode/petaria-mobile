import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, Alert, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer, HeaderBase } from '@/components'
import { HEADER_GRADIENTS } from '@/constants/headerGradients'
import { useSelector } from 'react-redux'
import { 
  getUserCurrency, 
  getUserProfile,
  getHuntingCooldowns
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Region, HuntResult, Pet } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'
import { useRouter } from 'expo-router'
import { getPetImageByName } from '@/assets/images'
import { huntApi } from '@/services/api'

// Backend region type
interface BackendRegion {
  id: string
  name: string
  description: string
  difficulty: string
  energyCost: number
  coinsCost: number
  imageUrl: string
  unlockLevel: number
}

export const HuntScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currency = useSelector(getUserCurrency)
  const profile = useSelector(getUserProfile)
  const huntingCooldowns = useSelector(getHuntingCooldowns)
  
  // API state
  const [regions, setRegions] = useState<BackendRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [regionsError, setRegionsError] = useState<string | null>(null)
  const [isStartingHunt, setIsStartingHunt] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [selectedRegion, setSelectedRegion] = useState<BackendRegion | null>(null)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [showHuntResult, setShowHuntResult] = useState(false)
  const [lastHuntResult, setLastHuntResult] = useState<HuntResult | null>(null)
  const [isHunting, setIsHunting] = useState(false)
  const [cooldownTimers, setCooldownTimers] = useState<{ [key: string]: number }>({})

  // Load regions from API
  const loadRegions = async () => {
    console.log('🗺️ Loading regions from API...')
    setIsLoadingRegions(true)
    setRegionsError(null)
    
    try {
      const result = await huntApi.getRegions()
      if (result.success && result.data) {
        console.log('✅ Loaded regions:', result.data.length)
        setRegions(result.data)
      } else {
        throw new Error('Failed to load regions')
      }
    } catch (error) {
      console.error('❌ Error loading regions:', error)
      setRegionsError(error instanceof Error ? error.message : 'Failed to load regions')
    } finally {
      setIsLoadingRegions(false)
    }
  }

  // Pull to refresh handler
  const onRefresh = async () => {
    console.log('\n🔄 ========== PULL TO REFRESH ==========')
    console.log('🔄 Pull to refresh triggered')
    console.log('📍 API Config useMock:', require('@/services/api/config').API_CONFIG.useMock)
    console.log('🌐 API URL:', require('@/services/api/config').API_CONFIG.baseURL)
    
    setIsRefreshing(true)
    setRegionsError(null)
    
    try {
      console.log('📡 Calling huntApi.getRegions()...')
      const result = await huntApi.getRegions()
      console.log('📦 API Response:', JSON.stringify(result, null, 2))
      
      if (result.success && result.data) {
        console.log('✅ Refreshed regions:', result.data.length)
        console.log('📋 Region names:', result.data.map(r => r.name).join(', '))
        setRegions(result.data)
      } else {
        throw new Error('Failed to refresh regions')
      }
    } catch (error) {
      console.error('❌ Error refreshing regions:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      setRegionsError(error instanceof Error ? error.message : 'Failed to refresh regions')
    } finally {
      setIsRefreshing(false)
      console.log('🔄 ========== REFRESH COMPLETE ==========\n')
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownTimers(prevTimers => {
        const now = Date.now()
        const newTimers: { [key: string]: number } = {}
        
        Object.entries(huntingCooldowns).forEach(([regionId, cooldownEnd]) => {
          const endTime = typeof cooldownEnd === 'number' ? cooldownEnd : Number(cooldownEnd)
          if (endTime > now) {
            newTimers[regionId] = Math.ceil((endTime - now) / 1000)
          }
        })
        
        // Only update if timers have actually changed
        const hasChanged = Object.keys(newTimers).length !== Object.keys(prevTimers).length ||
          Object.entries(newTimers).some(([key, value]) => prevTimers[key] !== value)
        
        return hasChanged ? newTimers : prevTimers
      })
    }, 1000)

    return () => clearInterval(interval)
  }, []) // Remove huntingCooldowns dependency

  const getRegionHuntCost = (region: BackendRegion): number => {
    // Backend uses coinsCost
    return region.coinsCost
  }

  const canAffordHunt = (region: BackendRegion): boolean => {
    return currency.coins >= getRegionHuntCost(region)
  }

  const isRegionOnCooldown = (regionId: string): boolean => {
    return cooldownTimers[regionId] > 0
  }

  const handleStartHunt = async (region: BackendRegion) => {
    console.log('🎯 Starting hunt in region:', region.name)
    
    // Check if user has tickets
    if (profile.huntTickets <= 0) {
      Alert.alert('No Hunt Tickets', 'You need hunt tickets to start hunting. Tickets reset daily at midnight UTC.')
      return
    }
    
    // Check if can afford
    if (!canAffordHunt(region)) {
      Alert.alert('Insufficient Coins', `You need ${getRegionHuntCost(region)} coins to hunt in this region.`)
      return
    }
    
    setIsStartingHunt(true)
    
    try {
      const result = await huntApi.startHunt(region.id)
      console.log('✅ Hunt session started:', result)
      
      if (result.success && result.data) {
        // Navigate to hunting session with session ID
        router.push({
          pathname: '/hunting-session',
          params: {
            sessionId: result.data.session.id,
            regionId: region.id,
            regionName: region.name,
          }
        })
        
        // Close modal
        setShowRegionModal(false)
        setSelectedRegion(null)
      } else {
        Alert.alert('Error', result.message || 'Failed to start hunt session')
      }
    } catch (error) {
      console.error('❌ Error starting hunt:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start hunt')
    } finally {
      setIsStartingHunt(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderRegionCard = ({ item: region }: { item: BackendRegion }) => {
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
        onPress={() => {
          setSelectedRegion(region)
          setShowRegionModal(true)
        }}
        disabled={!canAfford || onCooldown}
      >
        <Image source={{ uri: region.imageUrl }} style={styles.regionImage} />
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
                  � {region.difficulty}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const RegionDetailsModal = () => (
    <Modal visible={showRegionModal} animationType="slide" transparent>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setShowRegionModal(false)
          setSelectedRegion(null)
        }}
      >
        <View style={styles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedRegion && (
                <>
                  <Image source={{ uri: selectedRegion.imageUrl }} style={styles.modalRegionImage} />
                  <ThemedText type="title" style={styles.modalRegionName}>
                    {selectedRegion.name}
                  </ThemedText>
                  <ThemedText style={styles.modalRegionDescription}>
                    {selectedRegion.description}
                  </ThemedText>
                  
                  <View style={styles.modalSection}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                      Region Info
                    </ThemedText>
                    <View style={styles.petTypeRow}>
                      <ThemedText style={styles.petTypeName}>Difficulty</ThemedText>
                      <ThemedText style={[
                        styles.petTypeRarity,
                        { color: getDifficultyColor(selectedRegion.difficulty) }
                      ]}>
                        {selectedRegion.difficulty}
                      </ThemedText>
                    </View>
                    <View style={styles.petTypeRow}>
                      <ThemedText style={styles.petTypeName}>Unlock Level</ThemedText>
                      <ThemedText style={styles.petTypeRarity}>
                        Level {selectedRegion.unlockLevel}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                      Hunt Cost
                    </ThemedText>
                    <ThemedText style={styles.costBreakdown}>
                      Coins Cost: {selectedRegion.coinsCost} 💰
                    </ThemedText>
                    <ThemedText style={styles.costBreakdown}>
                      Energy Cost: {selectedRegion.energyCost} ⚡
                    </ThemedText>
                    <ThemedText style={styles.totalCost}>
                      Total: {getRegionHuntCost(selectedRegion)} coins
                    </ThemedText>
                  </View>
                  
                  <View style={styles.modalActions}>
                    <ButtonPrimary 
                      style={styles.huntButton}
                      onPress={() => {
                        if (selectedRegion) {
                          handleStartHunt(selectedRegion)
                        }
                      }}
                      disabled={
                        !canAffordHunt(selectedRegion) || 
                        isRegionOnCooldown(selectedRegion.id) ||
                        isStartingHunt ||
                        profile.huntTickets <= 0
                      }
                    >
                      {isStartingHunt 
                        ? 'Starting...'
                        : isRegionOnCooldown(selectedRegion.id) 
                          ? `Cooldown: ${formatTime(cooldownTimers[selectedRegion.id] || 0)}`
                          : profile.huntTickets <= 0
                            ? 'No Tickets'
                            : 'Enter Dungeon'
                      }
                    </ButtonPrimary>
                    <ButtonSecondary 
                      style={styles.closeButton}
                      onPress={() => {
                        setShowRegionModal(false)
                        setSelectedRegion(null)
                      }}
                    >
                      Close
                    </ButtonSecondary>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return colors.success
      case 'medium': return colors.warning
      case 'hard': return colors.error
      case 'expert': return colors.error
      default: return colors.gray
    }
  }

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
    <ScreenContainer style={styles.screenContainer}>
      <HeaderBase title="Hunt" gradientColors={HEADER_GRADIENTS.hunt}>
        <View style={styles.headerContent}>
          <View style={styles.currencyContainer}>
            <ThemedText style={styles.currency}>🎫 {profile.huntTickets}/5</ThemedText>
            <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
            <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            disabled={isRefreshing}
          >
            <ThemedText style={styles.refreshButtonText}>
              {isRefreshing ? '🔄 Loading...' : '🔄 Refresh'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </HeaderBase>

      <ThemedView style={styles.container}>
        {isLoadingRegions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading regions...</ThemedText>
          </View>
        ) : regionsError ? (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>❌ {regionsError}</ThemedText>
            <ButtonPrimary onPress={loadRegions}>
              Retry
            </ButtonPrimary>
          </View>
        ) : (
          <>
            {isRefreshing && (
              <View style={styles.refreshingIndicator}>
                <ActivityIndicator size="large" color={colors.white} />
                <ThemedText style={styles.refreshingText}>🔄 Refreshing regions from API...</ThemedText>
              </View>
            )}
            
            {isHunting && (
              <View style={styles.huntingIndicator}>
                <ThemedText style={styles.huntingText}>🔍 Hunting in progress...</ThemedText>
              </View>
            )}

            <FlatList
              data={regions}
              renderItem={renderRegionCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.regionsList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                  title="Pull to refresh regions"
                  titleColor={colors.gray}
                />
              }
            />
          </>
        )}

        <RegionDetailsModal />
        <HuntResultModal />
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: metrics.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.medium,
  },
  loadingText: {
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.medium,
    padding: metrics.large,
  },
  errorText: {
    fontSize: fontSizes.body,
    color: colors.error,
    textAlign: 'center',
  },
  headerContent: {
    flexDirection: 'column',
    gap: metrics.small,
    alignItems: 'center',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: metrics.small,
    justifyContent: 'center',
  },
  currency: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.white,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: fontSizes.span,
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
  refreshingIndicator: {
    backgroundColor: colors.info,
    padding: metrics.large,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: metrics.medium,
  },
  refreshingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: metrics.large,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: metrics.borderRadius,
    margin: metrics.medium,
  },
  refreshingText: {
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
