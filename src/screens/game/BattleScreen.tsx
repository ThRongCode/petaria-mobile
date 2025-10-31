import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, Alert } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer, HeaderBase } from '@/components'
import { HEADER_GRADIENTS } from '@/constants/headerGradients'
import { useSelector } from 'react-redux'
import { 
  getOwnedPets, 
  getActiveBattle, 
  getRecentBattles, 
  getBattleStats,
  getUserCurrency,
  getAvailableOpponents
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Battle, Opponent } from '@/stores/types/game'
import { useRouter } from 'expo-router'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

export const BattleScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const ownedPets = useSelector(getOwnedPets)
  const activeBattle = useSelector(getActiveBattle)
  const recentBattles = useSelector(getRecentBattles)
  const battleStats = useSelector(getBattleStats)
  const currency = useSelector(getUserCurrency)
  const availableOpponents = useSelector(getAvailableOpponents)
  
  
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null)
  const [showOpponentSelector, setShowOpponentSelector] = useState(false)
  const [showPetSelector, setShowPetSelector] = useState(false)

  const availablePets = ownedPets.filter(pet => pet.stats.hp > 0)

  const handleChooseOpponent = () => {
    setShowOpponentSelector(true)
  }

  const handleOpponentSelect = (opponent: Opponent) => {
    setSelectedOpponent(opponent)
    setShowOpponentSelector(false)
    setShowPetSelector(true)
  }

  const handlePetSelect = (pet: Pet) => {
    if (!selectedOpponent) return
    
    setSelectedPet(pet)
    setShowPetSelector(false)
    
    // Navigate to battle arena with pet and opponent data
    router.push({
      pathname: '/battle-arena',
      params: {
        playerPet: JSON.stringify(pet),
        opponent: JSON.stringify(selectedOpponent)
      }
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success
      case 'Normal': return colors.info
      case 'Hard': return colors.warning
      case 'Expert': return colors.error
      case 'Master': return colors.black
      default: return colors.gray
    }
  }

  const renderOpponentCard = ({ item: opponent }: { item: Opponent }) => (
    <TouchableOpacity 
      style={styles.opponentCard}
      onPress={() => handleOpponentSelect(opponent)}
    >
      <Image 
        source={typeof opponent.image === 'string' ? { uri: opponent.image } : opponent.image as any} 
        style={styles.opponentImage} 
      />
      <View style={styles.opponentInfo}>
        <ThemedText type="defaultSemiBold" style={styles.opponentName}>
          {opponent.name}
        </ThemedText>
        <ThemedText style={styles.opponentSpecies}>
          {opponent.species} • Level {opponent.level}
        </ThemedText>
        <View style={styles.difficultyContainer}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(opponent.difficulty) }]}>
            <ThemedText style={styles.difficultyText}>{opponent.difficulty}</ThemedText>
          </View>
        </View>
        <View style={styles.rewardsContainer}>
          <ThemedText style={styles.rewardsText}>
            💰 {opponent.rewards.coins} • ⭐ {opponent.rewards.xp} XP
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderPetSelector = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity 
      style={styles.petSelectorCard}
      onPress={() => handlePetSelect(pet)}
    >
      <Image 
        source={typeof pet.image === 'string' ? { uri: pet.image } : pet.image as any} 
        style={styles.petSelectorImage} 
      />
      <View style={styles.petSelectorInfo}>
        <ThemedText type="defaultSemiBold">{pet.name}</ThemedText>
        <ThemedText style={styles.petSelectorLevel}>Level {pet.level}</ThemedText>
        <View style={styles.hpBar}>
          <View 
            style={[styles.hpFill, { width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%` }]}
          />
          <ThemedText style={styles.hpText}>
            {pet.stats.hp}/{pet.stats.maxHp}
          </ThemedText>
        </View>
        <View style={styles.movesPreview}>
          <ThemedText style={styles.movesText}>
            Moves: {pet.moves?.map(m => m.name).join(', ') || 'No moves learned'}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )


  const renderRecentBattle = ({ item: battle }: { item: Battle }) => (
    <View style={styles.battleHistoryCard}>
      <View style={styles.battleInfo}>
        <ThemedText type="defaultSemiBold" style={styles.battleTitle}>
          {battle.type} Battle
        </ThemedText>
        <ThemedText style={styles.battleTime}>
          {new Date(battle.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <View style={styles.battleResult}>
        <ThemedText 
          style={[
            styles.battleOutcome,
            { color: battle.result?.winner === 'attacker' ? colors.success : colors.error }
          ]}
        >
          {battle.result?.winner === 'attacker' ? 'Victory' : 'Defeat'}
        </ThemedText>
        {battle.result && (
          <ThemedText style={styles.battleRewards}>
            +{battle.result.rewards.xp} XP, +{battle.result.rewards.coins} Coins
          </ThemedText>
        )}
      </View>
    </View>
  )

  return (
    <ScreenContainer style={styles.screenContainer}>
      <HeaderBase title="Battle Arena" gradientColors={HEADER_GRADIENTS.battle}>
        <View style={styles.currencyContainer}>
          <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
          <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
        </View>
      </HeaderBase>

      <ThemedView style={styles.container}>
        <View style={styles.statsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Battle Stats</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{battleStats.won}</ThemedText>
              <ThemedText style={styles.statLabel}>Wins</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{battleStats.lost}</ThemedText>
              <ThemedText style={styles.statLabel}>Losses</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statNumber}>{battleStats.winRate}%</ThemedText>
              <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <ButtonPrimary 
            style={styles.chooseOpponentButton}
            onPress={handleChooseOpponent}
            disabled={availablePets.length === 0}
          >
            {availablePets.length === 0 ? 'No Healthy Pets Available' : 'Choose Opponent'}
          </ButtonPrimary>
        </View>


        <View style={styles.historyContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Recent Battles</ThemedText>
          <FlatList
            data={recentBattles.slice(0, 5)}
            renderItem={renderRecentBattle}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Opponent Selection Modal */}
        <Modal visible={showOpponentSelector} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText type="title" style={styles.modalTitle}>Choose Your Opponent</ThemedText>
              <FlatList
                data={availableOpponents}
                renderItem={renderOpponentCard}
                keyExtractor={(item) => item.id}
                style={styles.opponentSelectorList}
                showsVerticalScrollIndicator={false}
              />
              <ButtonSecondary onPress={() => setShowOpponentSelector(false)}>
                Cancel
              </ButtonSecondary>
            </View>
          </View>
        </Modal>

        {/* Pet Selection Modal */}
        <Modal visible={showPetSelector} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText type="title" style={styles.modalTitle}>
                Select Your Pet vs {selectedOpponent?.name}
              </ThemedText>
              <FlatList
                data={availablePets}
                renderItem={renderPetSelector}
                keyExtractor={(item) => item.id}
                style={styles.petSelectorList}
                showsVerticalScrollIndicator={false}
              />
              <ButtonSecondary onPress={() => setShowPetSelector(false)}>
                Cancel
              </ButtonSecondary>
            </View>
          </View>
        </Modal>
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
  statsContainer: {
    marginBottom: metrics.large,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: metrics.medium,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: metrics.tiny,
  },
  statLabel: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  actionContainer: {
    marginBottom: metrics.large,
  },
  chooseOpponentButton: {
    backgroundColor: colors.primary,
  },
  opponentCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  opponentImage: {
    width: 80,
    height: 80,
    borderRadius: metrics.borderRadius,
  },
  opponentInfo: {
    flex: 1,
    marginLeft: metrics.medium,
    justifyContent: 'center',
  },
  opponentName: {
    fontSize: fontSizes.large,
    marginBottom: metrics.tiny,
    color: colors.primary,
  },
  opponentSpecies: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  difficultyContainer: {
    marginBottom: metrics.small,
  },
  difficultyBadge: {
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    borderRadius: metrics.borderRadius,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: colors.white,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  rewardsContainer: {
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.small,
    borderRadius: metrics.borderRadius,
  },
  rewardsText: {
    fontSize: fontSizes.span,
    color: colors.primary,
    fontWeight: '500',
  },
  opponentSelectorList: {
    maxHeight: 400,
    marginBottom: metrics.large,
  },
  movesPreview: {
    marginTop: metrics.small,
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.small,
    borderRadius: metrics.borderRadius,
  },
  movesText: {
    fontSize: fontSizes.small,
    color: colors.gray,
  },
  historyContainer: {
    flex: 1,
  },
  battleHistoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
    elevation: 1,
  },
  battleInfo: {
    flex: 1,
  },
  battleTitle: {
    fontSize: fontSizes.body,
    marginBottom: metrics.tiny,
  },
  battleTime: {
    fontSize: fontSizes.span,
    color: colors.gray,
  },
  battleResult: {
    alignItems: 'flex-end',
  },
  battleOutcome: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    marginBottom: metrics.tiny,
  },
  battleRewards: {
    fontSize: fontSizes.span,
    color: colors.gray,
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
  modalTitle: {
    textAlign: 'center',
    marginBottom: metrics.large,
    color: colors.primary,
  },
  petSelectorList: {
    maxHeight: 400,
    marginBottom: metrics.large,
  },
  petSelectorCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.small,
  },
  petSelectorImage: {
    width: 60,
    height: 60,
    borderRadius: metrics.borderRadius,
  },
  petSelectorInfo: {
    flex: 1,
    marginLeft: metrics.medium,
    justifyContent: 'center',
  },
  petSelectorLevel: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.small,
  },
  hpBar: {
    height: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
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
})
