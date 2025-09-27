import React, { useState } from 'react'
import { StyleSheet, FlatList, TouchableOpacity, Image, View, Modal } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { getOwnedPets, getOwnedItems, getUserCurrency, getPetsReadyToEvolve } from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Item } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

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

  const renderPetCard = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity 
      style={[styles.petCard, { borderColor: getRarityColor(pet.rarity) }]}
      onPress={() => handlePetSelect(pet)}
    >
      <Image source={{ uri: pet.image }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <ThemedText type="defaultSemiBold" style={styles.petName}>{pet.name}</ThemedText>
        <ThemedText style={styles.petSpecies}>{pet.species}</ThemedText>
        <View style={styles.statsRow}>
          <ThemedText style={styles.statText}>Lvl {pet.level}</ThemedText>
          <ThemedText style={[styles.rarityText, { color: getRarityColor(pet.rarity) }]}>
            {pet.rarity}
          </ThemedText>
        </View>
        <View style={styles.hpBar}>
          <View 
            style={[styles.hpFill, { width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%` }]}
          />
          <ThemedText style={styles.hpText}>
            {pet.stats.hp}/{pet.stats.maxHp} HP
          </ThemedText>
        </View>
        <View style={styles.moodBar}>
          <View 
            style={[styles.moodFill, { width: `${pet.mood}%` }]}
          />
          <ThemedText style={styles.moodText}>Mood: {pet.mood}%</ThemedText>
        </View>
        {petsReadyToEvolve.some(p => p.id === pet.id) && (
          <View style={styles.evolutionBadge}>
            <ThemedText style={styles.evolutionText}>Ready to Evolve!</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderItemCard = ({ item }: { item: Item & { quantity: number } }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <ThemedText type="defaultSemiBold" style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.itemFooter}>
          <ThemedText style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
            {item.rarity}
          </ThemedText>
          <ThemedText style={styles.quantityText}>×{item.quantity}</ThemedText>
        </View>
      </View>
    </View>
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
          <ThemedText type="title" style={styles.title}>Pet Management</ThemedText>
          <View style={styles.currencyContainer}>
            <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
            <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
          </View>
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

        <FlatList
          data={activeTab === 'pets' ? ownedPets : ownedItems}
          renderItem={activeTab === 'pets' ? renderPetCard : renderItemCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

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
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    marginBottom: metrics.medium,
    borderWidth: 2,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: metrics.borderRadius,
  },
  petInfo: {
    flex: 1,
    marginLeft: metrics.medium,
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
    alignSelf: 'flex-start',
  },
  evolutionText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadius,
    padding: metrics.medium,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: metrics.borderRadius,
  },
  itemInfo: {
    flex: 1,
    marginLeft: metrics.medium,
  },
  itemName: {
    fontSize: fontSizes.body,
    marginBottom: metrics.tiny,
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
  quantityText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
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
