import React, { useState } from 'react'
import { StyleSheet, FlatList, TouchableOpacity, Image, View, Modal } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { 
  GameCard, 
  PokemonSprite, 
  StatBar, 
  RarityBadge, 
  LevelBadge, 
  CurrencyDisplay,
  RARITY_COLORS 
} from '@/components/GameUI'
import { useSelector } from 'react-redux'
import { getOwnedPets, getOwnedItems, getUserCurrency, getPetsReadyToEvolve, getUserProfile } from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Item } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'
import { getPokemonImage } from '@/assets/images'

export const PetManagementScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const ownedPets = useSelector(getOwnedPets)
  const ownedItems = useSelector(getOwnedItems)
  const currency = useSelector(getUserCurrency)
  const petsReadyToEvolve = useSelector(getPetsReadyToEvolve)
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [showPetDetails, setShowPetDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'pets' | 'items'>('pets')

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet)
    setShowPetDetails(true)
  }

  const handleFeedPet = (petId: string) => {
    // Use health potion if available
    const healthPotion = ownedItems.find(item => item.type === 'Consumable' && item.effects.hp)
    if (healthPotion && healthPotion.quantity > 0) {
      dispatch(gameActions.useItem({ 
        itemId: healthPotion.id, 
        petId: petId, 
        quantity: 1 
      }))
      dispatch(gameActions.updatePet({
        petId,
        updates: { mood: Math.min(100, (selectedPet?.mood || 0) + 20), lastFed: Date.now() }
      }))
    }
  }

  const handleEvolvePet = (pet: Pet) => {
    if (pet.evolutionRequirements) {
      dispatch(gameActions.useItem({ 
        itemId: pet.evolutionRequirements.itemId, 
        quantity: 1 
      }))
      dispatch(gameActions.updatePet({
        petId: pet.id,
        updates: { 
          evolutionStage: pet.evolutionStage + 1,
          stats: {
            ...pet.stats,
            maxHp: pet.stats.maxHp + 20,
            hp: pet.stats.maxHp + 20,
            attack: pet.stats.attack + 10,
            defense: pet.stats.defense + 8,
            speed: pet.stats.speed + 5,
          }
        }
      }))
    }
  }

  const renderPetCard = ({ item: pet }: { item: Pet }) => {
    const petImage = getPokemonImage(pet.species)
    
    return (
      <GameCard style={styles.petCard} onPress={() => handlePetSelect(pet)}>
        <View style={styles.petCardContent}>
          <PokemonSprite 
            image={petImage}
            size={100}
            rarity={pet.rarity}
            showRarityBorder
          />
          <View style={styles.petInfo}>
            <View style={styles.petHeader}>
              <View>
                <ThemedText type="defaultSemiBold" style={styles.petName}>{pet.name}</ThemedText>
                <ThemedText style={styles.petSpecies}>{pet.species}</ThemedText>
              </View>
              <View style={styles.badges}>
                <LevelBadge level={pet.level} />
                <RarityBadge rarity={pet.rarity} />
              </View>
            </View>
            
            <StatBar 
              label="HP"
              current={pet.stats.hp}
              max={pet.stats.maxHp}
              color={pet.stats.hp > pet.stats.maxHp * 0.5 ? colors.success : colors.error}
            />
            
            <StatBar 
              label="Mood"
              current={pet.mood}
              max={100}
              color={pet.mood > 70 ? '#4CAF50' : pet.mood > 40 ? '#FF9800' : '#F44336'}
            />
            
            {petsReadyToEvolve.some(p => p.id === pet.id) && (
              <View style={styles.evolutionBadge}>
                <ThemedText style={styles.evolutionText}>✨ Ready to Evolve!</ThemedText>
              </View>
            )}
          </View>
        </View>
      </GameCard>
    )
  }

  const renderItemCard = ({ item }: { item: Item & { quantity: number } }) => (
    <GameCard style={styles.itemCard}>
      <View style={styles.itemCardContent}>
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <RarityBadge rarity={item.rarity} style={styles.itemRarityBadge} />
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <ThemedText type="defaultSemiBold" style={styles.itemName}>{item.name}</ThemedText>
            <View style={styles.quantityBadge}>
              <ThemedText style={styles.quantityText}>×{item.quantity}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.itemDescription} numberOfLines={2}>{item.description}</ThemedText>
          <View style={styles.itemFooter}>
            <ThemedText style={styles.itemType}>{item.type}</ThemedText>
          </View>
        </View>
      </View>
    </GameCard>
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

  const PetDetailsModal = () => (
    <Modal visible={showPetDetails} animationType="slide" transparent>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPetDetails(false)}
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {selectedPet && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPetDetails(false)}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
                <Image source={{ uri: selectedPet.image }} style={styles.modalPetImage} />
                <View style={styles.modalPetInfo}>
                  <ThemedText type="title" style={styles.modalPetName}>
                    {selectedPet.name}
                  </ThemedText>
                  <ThemedText style={styles.modalPetSpecies}>
                    {selectedPet.species} • Level {selectedPet.level}
                  </ThemedText>
                  <ThemedText style={[styles.rarityText, { color: getRarityColor(selectedPet.rarity) }]}>
                    {selectedPet.rarity}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Stats</ThemedText>
                
                {/* HP with progress bar */}
                <View style={styles.statWithProgressContainer}>
                  <View style={styles.statRow}>
                    <ThemedText style={styles.statLabel}>HP</ThemedText>
                    <ThemedText style={styles.statValue}>
                      {selectedPet.stats.hp}/{selectedPet.stats.maxHp}
                    </ThemedText>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(selectedPet.stats.hp / selectedPet.stats.maxHp) * 100}%`,
                          backgroundColor: selectedPet.stats.hp > selectedPet.stats.maxHp * 0.5 ? colors.success : 
                                         selectedPet.stats.hp > selectedPet.stats.maxHp * 0.25 ? colors.warning : colors.error
                        }
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Attack</ThemedText>
                    <ThemedText style={styles.statValue}>{selectedPet.stats.attack}</ThemedText>
                    <View style={styles.miniProgressBar}>
                      <View 
                        style={[
                          styles.miniProgressFill, 
                          { 
                            width: `${Math.min((selectedPet.stats.attack / 100) * 100, 100)}%`,
                            backgroundColor: colors.error
                          }
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Defense</ThemedText>
                    <ThemedText style={styles.statValue}>{selectedPet.stats.defense}</ThemedText>
                    <View style={styles.miniProgressBar}>
                      <View 
                        style={[
                          styles.miniProgressFill, 
                          { 
                            width: `${Math.min((selectedPet.stats.defense / 100) * 100, 100)}%`,
                            backgroundColor: colors.info
                          }
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Speed</ThemedText>
                    <ThemedText style={styles.statValue}>{selectedPet.stats.speed}</ThemedText>
                    <View style={styles.miniProgressBar}>
                      <View 
                        style={[
                          styles.miniProgressFill, 
                          { 
                            width: `${Math.min((selectedPet.stats.speed / 100) * 100, 100)}%`,
                            backgroundColor: colors.warning
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.xpContainer}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Experience</ThemedText>
                <View style={styles.xpBar}>
                  <View 
                    style={[styles.xpFill, { width: `${(selectedPet.xp / selectedPet.xpToNext) * 100}%` }]}
                  />
                  <ThemedText style={styles.xpText}>
                    {selectedPet.xp}/{selectedPet.xpToNext} XP
                  </ThemedText>
                </View>
              </View>

              {selectedPet.evolutionRequirements && selectedPet.evolutionStage < selectedPet.maxEvolutionStage && (
                <View style={styles.evolutionContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Evolution</ThemedText>
                  <ThemedText style={styles.evolutionRequirement}>
                    Requires Level {selectedPet.evolutionRequirements.level}
                  </ThemedText>
                  {petsReadyToEvolve.some(p => p.id === selectedPet.id) && (
                    <ButtonPrimary 
                      style={styles.evolveButton}
                      onPress={() => handleEvolvePet(selectedPet)}
                    >
                      Evolve Pet!
                    </ButtonPrimary>
                  )}
                </View>
              )}

              <View style={styles.modalActions}>
                <ButtonSecondary 
                  style={styles.actionButton}
                  onPress={() => handleFeedPet(selectedPet.id)}
                >
                  Feed Pet
                </ButtonSecondary>
                <ButtonSecondary 
                  style={styles.actionButton}
                  onPress={() => setShowPetDetails(false)}
                >
                  Close
                </ButtonSecondary>
              </View>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )

  return (
    <ScreenContainer>
            <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>My Collection</ThemedText>
          <CurrencyDisplay coins={currency.coins} gems={currency.gems} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pets' && styles.activeTab]}
            onPress={() => setActiveTab('pets')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'pets' && styles.activeTabText]}>
              Pets ({ownedPets.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
              Items ({ownedItems.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {petsReadyToEvolve.length > 0 && activeTab === 'pets' && (
          <View style={styles.notificationBanner}>
            <ThemedText style={styles.notificationText}>
              🌟 {petsReadyToEvolve.length} pet(s) ready to evolve!
            </ThemedText>
          </View>
        )}

        {activeTab === 'pets' ? (
          <FlatList
            data={ownedPets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <FlatList
            data={ownedItems}
            renderItem={renderItemCard}
            keyExtractor={(item) => item.id}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <PetDetailsModal />
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: metrics.medium,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    padding: metrics.tiny,
  },
  tab: {
    flex: 1,
    paddingVertical: metrics.small,
    alignItems: 'center',
    borderRadius: metrics.borderRadius,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.body,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '600',
  },
  notificationBanner: {
    backgroundColor: colors.warning,
    padding: metrics.small,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  notificationText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: metrics.huge,
  },
  petCard: {
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  petCardContent: {
    flexDirection: 'row',
    padding: metrics.medium,
  },
  petInfo: {
    flex: 1,
    marginLeft: metrics.medium,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: metrics.small,
  },
  badges: {
    flexDirection: 'row',
    gap: metrics.tiny,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: metrics.borderRadius,
  },
  petName: {
    fontSize: fontSizes.large,
    marginBottom: metrics.tiny,
  },
  petSpecies: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.small,
  },
  statText: {
    fontSize: fontSizes.span,
    fontWeight: '600',
  },
  rarityText: {
    fontSize: fontSizes.span,
    fontWeight: '600',
  },
  hpBar: {
    height: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
    justifyContent: 'center',
    position: 'relative',
  },
  hpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: metrics.borderRadius,
  },
  hpText: {
    fontSize: fontSizes.small,
    textAlign: 'center',
    fontWeight: '600',
    zIndex: 1,
  },
  moodBar: {
    height: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    justifyContent: 'center',
    position: 'relative',
  },
  moodFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: metrics.borderRadius,
  },
  moodText: {
    fontSize: fontSizes.small,
    textAlign: 'center',
    fontWeight: '500',
    zIndex: 1,
  },
  evolutionBadge: {
    backgroundColor: colors.warning,
    borderRadius: metrics.borderRadius,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    marginTop: metrics.small,
  },
  evolutionText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemCardContent: {
    flexDirection: 'row',
    padding: metrics.medium,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: metrics.borderRadius,
  },
  itemRarityBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    transform: [{ scale: 0.8 }],
  },
  itemInfo: {
    flex: 1,
    marginLeft: metrics.medium,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.tiny,
  },
  itemName: {
    fontSize: fontSizes.body,
  },
  quantityBadge: {
    backgroundColor: colors.primary,
    borderRadius: metrics.borderRadius,
    paddingHorizontal: metrics.small,
    paddingVertical: 2,
  },
  quantityText: {
    fontSize: fontSizes.small,
    color: colors.white,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemType: {
    fontSize: fontSizes.span,
    color: colors.primary,
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
  modalHeader: {
    flexDirection: 'row',
    marginBottom: metrics.large,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalPetImage: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius,
  },
  modalPetInfo: {
    flex: 1,
    marginLeft: metrics.medium,
    justifyContent: 'center',
  },
  modalPetName: {
    marginBottom: metrics.tiny,
  },
  modalPetSpecies: {
    fontSize: fontSizes.body,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  statsContainer: {
    marginBottom: metrics.large,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.medium,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.tiny,
  },
  statValue: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.primary,
  },
  statWithProgressContainer: {
    marginBottom: metrics.medium,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: metrics.tiny,
    width: '100%',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpContainer: {
    marginBottom: metrics.large,
  },
  xpBar: {
    height: 24,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    justifyContent: 'center',
    position: 'relative',
  },
  xpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: metrics.borderRadius,
  },
  xpText: {
    fontSize: fontSizes.span,
    textAlign: 'center',
    fontWeight: '600',
    zIndex: 1,
  },
  evolutionContainer: {
    marginBottom: metrics.large,
  },
  evolutionRequirement: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.medium,
  },
  evolveButton: {
    backgroundColor: colors.warning,
  },
  modalActions: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  actionButton: {
    flex: 1,
  },
})
