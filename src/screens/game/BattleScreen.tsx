import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList, Modal, Alert } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { 
  getOwnedPets, 
  getActiveBattle, 
  getRecentBattles, 
  getBattleStats,
  getUserCurrency 
} from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Battle, BattleAction } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'

export const BattleScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const ownedPets = useSelector(getOwnedPets)
  const activeBattle = useSelector(getActiveBattle)
  const recentBattles = useSelector(getRecentBattles)
  const battleStats = useSelector(getBattleStats)
  const currency = useSelector(getUserCurrency)
  
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [battleMode, setBattleMode] = useState<'pve' | 'pvp' | 'legend'>('pve')
  const [battleLog, setBattleLog] = useState<BattleAction[]>([])
  const [isProcessingBattle, setIsProcessingBattle] = useState(false)

  const availablePets = ownedPets.filter(pet => pet.stats.hp > 0)

  const simulateBattle = (attackerPet: Pet, defenderPet: Pet): Battle['result'] => {
    const log: BattleAction[] = []
    let attackerHp = attackerPet.stats.hp
    let defenderHp = defenderPet.stats.hp
    let turn = 1

    // Simple battle simulation
    while (attackerHp > 0 && defenderHp > 0 && turn <= 20) {
      // Attacker's turn
      const attackerDamage = Math.max(1, 
        attackerPet.stats.attack - Math.floor(defenderPet.stats.defense / 2) + 
        Math.floor(Math.random() * 10) - 5
      )
      defenderHp = Math.max(0, defenderHp - attackerDamage)
      
      log.push({
        turn,
        actor: 'attacker',
        action: 'attack',
        damage: attackerDamage,
        description: `${attackerPet.name} attacks for ${attackerDamage} damage!`
      })

      if (defenderHp <= 0) break

      // Defender's turn
      const defenderDamage = Math.max(1,
        defenderPet.stats.attack - Math.floor(attackerPet.stats.defense / 2) +
        Math.floor(Math.random() * 10) - 5
      )
      attackerHp = Math.max(0, attackerHp - defenderDamage)
      
      log.push({
        turn,
        actor: 'defender',
        action: 'attack',
        damage: defenderDamage,
        description: `${defenderPet.name} attacks for ${defenderDamage} damage!`
      })

      turn++
    }

    const winner = attackerHp > 0 ? 'attacker' : 'defender'
    const xpReward = winner === 'attacker' ? 100 + Math.floor(defenderPet.level * 10) : 25
    const coinReward = winner === 'attacker' ? 50 + Math.floor(defenderPet.level * 5) : 10

    return {
      winner,
      rewards: {
        xp: xpReward,
        coins: coinReward,
        items: winner === 'attacker' && Math.random() < 0.3 ? ['item-heal-001'] : []
      },
      battleLog: log
    }
  }

  const startBattle = async (pet: Pet) => {
    if (!pet) return

    setIsProcessingBattle(true)
    setShowPetSelector(false)

    // Generate enemy pet based on battle mode
    const enemyPet: Pet = {
      id: 'enemy-' + Date.now(),
      name: battleMode === 'legend' ? 'Legend Guardian' : 'Wild ' + pet.species,
      species: pet.species,
      rarity: battleMode === 'legend' ? 'Legendary' : 'Common',
      level: pet.level + (battleMode === 'legend' ? 5 : Math.floor(Math.random() * 3) - 1),
      xp: 0,
      xpToNext: 1000,
      stats: {
        hp: pet.stats.maxHp + (battleMode === 'legend' ? 30 : Math.floor(Math.random() * 20) - 10),
        maxHp: pet.stats.maxHp + (battleMode === 'legend' ? 30 : Math.floor(Math.random() * 20) - 10),
        attack: pet.stats.attack + (battleMode === 'legend' ? 15 : Math.floor(Math.random() * 10) - 5),
        defense: pet.stats.defense + (battleMode === 'legend' ? 10 : Math.floor(Math.random() * 8) - 4),
        speed: pet.stats.speed + (battleMode === 'legend' ? 10 : Math.floor(Math.random() * 8) - 4),
      },
      image: 'https://via.placeholder.com/120/F44336/FFFFFF?text=👹',
      evolutionStage: 1,
      maxEvolutionStage: 1,
      isLegendary: battleMode === 'legend',
      ownerId: 'enemy',
      isForSale: false,
      mood: 100,
      lastFed: Date.now(),
    }

    const battle: Battle = {
      id: 'battle-' + Date.now(),
      type: battleMode === 'pvp' ? 'PvP' : battleMode === 'legend' ? 'LegendChallenge' : 'PvE',
      attacker: {
        userId: 'user-001',
        petId: pet.id,
        username: 'VnPetTrainer'
      },
      defender: {
        userId: 'enemy',
        petId: enemyPet.id,
        username: enemyPet.name
      },
      status: 'in_progress',
      createdAt: Date.now()
    }

    dispatch(gameActions.startBattle(battle))

    // Simulate battle with delay for drama
    setTimeout(() => {
      const result = simulateBattle(pet, enemyPet)
      setBattleLog(result.battleLog)
      
      setTimeout(() => {
        dispatch(gameActions.completeBattle({ battleId: battle.id, result }))
        
        // Apply pet damage
        const finalHp = result.winner === 'attacker' 
          ? Math.floor(pet.stats.hp * 0.3) // Winner loses some HP
          : 1 // Loser barely survives
        
        dispatch(gameActions.updatePet({
          petId: pet.id,
          updates: { stats: { ...pet.stats, hp: finalHp } }
        }))

        // Level up pet with XP
        dispatch(gameActions.levelUpPet({ petId: pet.id, xpGained: result.rewards.xp }))
        
        // Add currency rewards
        dispatch(gameActions.addCurrency({ coins: result.rewards.coins }))
        
        // Add item rewards
        result.rewards.items.forEach(itemId => {
          dispatch(gameActions.addItem({ itemId, quantity: 1 }))
        })

        setIsProcessingBattle(false)
        
        Alert.alert(
          result.winner === 'attacker' ? 'Victory!' : 'Defeat!',
          `${pet.name} ${result.winner === 'attacker' ? 'won' : 'lost'} the battle!\n\n` +
          `Rewards:\n` +
          `+${result.rewards.xp} XP\n` +
          `+${result.rewards.coins} Coins` +
          (result.rewards.items.length > 0 ? `\n+${result.rewards.items.length} Items` : ''),
          [{ text: 'OK' }]
        )
      }, 2000)
    }, 1000)
  }

  const renderPetSelector = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity 
      style={styles.petSelectorCard}
      onPress={() => startBattle(pet)}
    >
      <Image source={{ uri: pet.image }} style={styles.petSelectorImage} />
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
      </View>
    </TouchableOpacity>
  )

  const renderBattleLogItem = ({ item: action }: { item: BattleAction }) => (
    <View style={styles.battleLogItem}>
      <ThemedText style={styles.battleLogText}>
        Turn {action.turn}: {action.description}
      </ThemedText>
    </View>
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
    <ScreenContainer>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Battle Arena</ThemedText>
          <View style={styles.currencyContainer}>
            <ThemedText style={styles.currency}>💰 {currency.coins.toLocaleString()}</ThemedText>
            <ThemedText style={styles.currency}>💎 {currency.gems.toLocaleString()}</ThemedText>
          </View>
        </View>

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

        <View style={styles.battleModeContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Battle Mode</ThemedText>
          <View style={styles.modeButtons}>
            <TouchableOpacity 
              style={[styles.modeButton, battleMode === 'pve' && styles.activeModeButton]}
              onPress={() => setBattleMode('pve')}
            >
              <ThemedText style={[styles.modeText, battleMode === 'pve' && styles.activeModeText]}>
                PvE
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, battleMode === 'pvp' && styles.activeModeButton]}
              onPress={() => setBattleMode('pvp')}
            >
              <ThemedText style={[styles.modeText, battleMode === 'pvp' && styles.activeModeText]}>
                PvP
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, battleMode === 'legend' && styles.activeModeButton]}
              onPress={() => setBattleMode('legend')}
            >
              <ThemedText style={[styles.modeText, battleMode === 'legend' && styles.activeModeText]}>
                Legend
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {!activeBattle && !isProcessingBattle && (
          <ButtonPrimary 
            style={styles.startBattleButton}
            onPress={() => setShowPetSelector(true)}
            disabled={availablePets.length === 0}
          >
            {availablePets.length === 0 ? 'No Healthy Pets Available' : 'Start Battle'}
          </ButtonPrimary>
        )}

        {(activeBattle || isProcessingBattle) && (
          <View style={styles.activeBattleContainer}>
            <ThemedText type="defaultSemiBold" style={styles.activeBattleTitle}>
              Battle in Progress...
            </ThemedText>
            {battleLog.length > 0 && (
              <FlatList
                data={battleLog}
                renderItem={renderBattleLogItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.battleLogContainer}
              />
            )}
          </View>
        )}

        <View style={styles.historyContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Recent Battles</ThemedText>
          <FlatList
            data={recentBattles.slice(0, 5)}
            renderItem={renderRecentBattle}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <Modal visible={showPetSelector} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText type="title" style={styles.modalTitle}>Select Your Pet</ThemedText>
              <FlatList
                data={availablePets}
                renderItem={renderPetSelector}
                keyExtractor={(item) => item.id}
                style={styles.petSelectorList}
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
  battleModeContainer: {
    marginBottom: metrics.large,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: metrics.small,
  },
  modeButton: {
    flex: 1,
    paddingVertical: metrics.medium,
    borderRadius: metrics.borderRadius,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: '600',
  },
  activeModeText: {
    color: colors.white,
  },
  startBattleButton: {
    marginBottom: metrics.large,
  },
  activeBattleContainer: {
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
  },
  activeBattleTitle: {
    textAlign: 'center',
    marginBottom: metrics.medium,
    color: colors.primary,
  },
  battleLogContainer: {
    maxHeight: 200,
  },
  battleLogItem: {
    backgroundColor: colors.white,
    padding: metrics.small,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.tiny,
  },
  battleLogText: {
    fontSize: fontSizes.span,
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
