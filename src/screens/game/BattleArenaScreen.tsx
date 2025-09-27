import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Alert, Animated } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer } from '@/components'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Opponent, Move } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { ButtonPrimary, ButtonSecondary } from 'rn-base-component'
import { useRouter, useLocalSearchParams } from 'expo-router'

interface BattleState {
  playerPet: Pet & { currentHp: number; temporaryStats: any }
  opponentPet: Opponent & { currentHp: number; temporaryStats: any }
  turn: 'player' | 'opponent'
  turnCount: number
  battleLog: string[]
  battleOver: boolean
  winner: 'player' | 'opponent' | null
}

export const BattleArenaScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)
  
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [selectedMove, setSelectedMove] = useState<Move | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [playerHpAnim] = useState(new Animated.Value(100))
  const [opponentHpAnim] = useState(new Animated.Value(100))

  // Initialize battle from params
  useEffect(() => {
    if (params.playerPet && params.opponent && !battleState) {
      const playerPet = JSON.parse(params.playerPet as string) as Pet
      const opponent = JSON.parse(params.opponent as string) as Opponent
      
      // Determine who goes first based on speed
      const playerGoesFirst = playerPet.stats.speed >= opponent.stats.speed
      
      setBattleState({
        playerPet: {
          ...playerPet,
          currentHp: playerPet.stats.hp,
          temporaryStats: { ...playerPet.stats }
        },
        opponentPet: {
          ...opponent,
          currentHp: opponent.stats.hp,
          temporaryStats: { ...opponent.stats }
        },
        turn: playerGoesFirst ? 'player' : 'opponent',
        turnCount: 1,
        battleLog: [`Battle begins! ${playerPet.name} vs ${opponent.name}!`],
        battleOver: false,
        winner: null
      })
    }
  }, [params.playerPet, params.opponent, battleState])

  // Handle opponent turn
  useEffect(() => {
    if (battleState && battleState.turn === 'opponent' && !battleState.battleOver) {
      const timer = setTimeout(() => {
        handleOpponentMove()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [battleState?.turn, battleState?.turnCount])

  const calculateDamage = (attacker: any, defender: any, move: Move): number => {
    if (move.power === 0) return 0 // Status moves
    
    const attack = attacker.temporaryStats.attack
    const defense = defender.temporaryStats.defense
    const level = attacker.level || 12
    
    // Pokemon-like damage formula (simplified)
    const baseDamage = Math.floor(((((2 * level / 5 + 2) * move.power * attack / defense) / 50) + 2))
    
    // Add some randomness (85-100% damage)
    const randomFactor = (Math.random() * 0.15 + 0.85)
    const finalDamage = Math.floor(baseDamage * randomFactor)
    
    // Miss chance
    if (Math.random() * 100 > move.accuracy) {
      return -1 // Miss
    }
    
    return Math.max(1, finalDamage)
  }

  const applyMoveEffects = (user: any, target: any, move: Move) => {
    if (move.effects) {
      // Healing
      if (move.effects.healing) {
        user.currentHp = Math.min(user.stats.maxHp || user.stats.hp, user.currentHp + move.effects.healing)
      }
      
      // Stat boosts
      if (move.effects.statBoost) {
        if (move.effects.statBoost.attack) {
          user.temporaryStats.attack += move.effects.statBoost.attack
        }
        if (move.effects.statBoost.defense) {
          user.temporaryStats.defense += move.effects.statBoost.defense
        }
        if (move.effects.statBoost.speed) {
          user.temporaryStats.speed += move.effects.statBoost.speed
        }
      }
    }
  }

  const executeMove = (attacker: any, defender: any, move: Move, isPlayer: boolean) => {
    const damage = calculateDamage(attacker, defender, move)
    let logMessage = ''
    
    if (damage === -1) {
      logMessage = `${attacker.name} used ${move.name}, but it missed!`
    } else if (damage === 0) {
      // Status move
      applyMoveEffects(attacker, defender, move)
      if (move.effects?.healing) {
        logMessage = `${attacker.name} used ${move.name} and restored ${move.effects.healing} HP!`
      } else if (move.effects?.statBoost) {
        const stat = Object.keys(move.effects.statBoost)[0]
        logMessage = `${attacker.name} used ${move.name} and boosted ${stat}!`
      } else {
        logMessage = `${attacker.name} used ${move.name}!`
      }
    } else {
      defender.currentHp = Math.max(0, defender.currentHp - damage)
      logMessage = `${attacker.name} used ${move.name} and dealt ${damage} damage!`
      
      // Animate HP bars
      const newHpPercentage = (defender.currentHp / (defender.stats.maxHp || defender.stats.hp)) * 100
      Animated.timing(isPlayer ? opponentHpAnim : playerHpAnim, {
        toValue: newHpPercentage,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
    
    return logMessage
  }

  const handlePlayerMove = (move: Move) => {
    if (!battleState || battleState.battleOver || isAnimating) return
    
    setIsAnimating(true)
    setSelectedMove(move)
    
    const logMessage = executeMove(battleState.playerPet, battleState.opponentPet, move, true)
    
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev) return null
        
        const newLog = [...prev.battleLog, logMessage]
        const opponentDefeated = prev.opponentPet.currentHp <= 0
        
        if (opponentDefeated) {
          return {
            ...prev,
            battleLog: [...newLog, `${prev.opponentPet.name} was defeated!`],
            battleOver: true,
            winner: 'player'
          }
        }
        
        return {
          ...prev,
          battleLog: newLog,
          turn: 'opponent' as const,
          turnCount: prev.turnCount + 1
        }
      })
      
      setIsAnimating(false)
      setSelectedMove(null)
    }, 1000)
  }

  const handleOpponentMove = () => {
    if (!battleState || battleState.battleOver) return
    
    setIsAnimating(true)
    
    // AI chooses random move
    const availableMoves = battleState.opponentPet.moves
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    
    const logMessage = executeMove(battleState.opponentPet, battleState.playerPet, randomMove, false)
    
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev) return null
        
        const newLog = [...prev.battleLog, logMessage]
        const playerDefeated = prev.playerPet.currentHp <= 0
        
        if (playerDefeated) {
          return {
            ...prev,
            battleLog: [...newLog, `${prev.playerPet.name} was defeated!`],
            battleOver: true,
            winner: 'opponent'
          }
        }
        
        return {
          ...prev,
          battleLog: newLog,
          turn: 'player' as const,
          turnCount: prev.turnCount + 1
        }
      })
      
      setIsAnimating(false)
    }, 1000)
  }

  const handleBattleEnd = () => {
    if (!battleState) return
    
    const { winner, opponentPet, playerPet } = battleState
    
    if (winner === 'player') {
      // Calculate XP gained (Pokemon-style formula)
      const baseXP = opponentPet.rewards.xp
      const levelDifference = Math.max(1, opponentPet.level - playerPet.level + 5)
      const xpGained = Math.floor(baseXP * levelDifference / 7)
      
      // Update pet HP and XP
      dispatch(gameActions.updatePet({
        petId: playerPet.id,
        updates: {
          stats: { ...playerPet.stats, hp: playerPet.currentHp }
        }
      }))
      
      dispatch(gameActions.levelUpPet({
        petId: playerPet.id,
        xpGained
      }))
      
      // Add currency rewards
      dispatch(gameActions.addCurrency({ coins: opponentPet.rewards.coins }))
      
      // Add item rewards
      opponentPet.rewards.items.forEach(itemId => {
        dispatch(gameActions.addItem({ itemId, quantity: 1 }))
      })
      
      Alert.alert(
        'Victory!',
        `${playerPet.name} defeated ${opponentPet.name}!\n\n` +
        `Rewards:\n` +
        `+${xpGained} XP\n` +
        `+${opponentPet.rewards.coins} Coins` +
        (opponentPet.rewards.items.length > 0 ? `\n+${opponentPet.rewards.items.length} Items` : ''),
        [{ text: 'Continue', onPress: () => router.back() }]
      )
    } else {
      // Player lost
      dispatch(gameActions.updatePet({
        petId: playerPet.id,
        updates: {
          stats: { ...playerPet.stats, hp: Math.max(1, Math.floor(playerPet.stats.maxHp * 0.1)) }
        }
      }))
      
      Alert.alert(
        'Defeat!',
        `${playerPet.name} was defeated by ${opponentPet.name}.\n\n${playerPet.name} needs rest before the next battle.`,
        [{ text: 'Continue', onPress: () => router.back() }]
      )
    }
  }

  // Show battle end screen if battle is over
  useEffect(() => {
    if (battleState?.battleOver) {
      setTimeout(handleBattleEnd, 1500)
    }
  }, [battleState?.battleOver])

  if (!battleState) {
    return (
      <ScreenContainer>
        <ThemedView style={styles.container}>
          <ThemedText>Loading battle...</ThemedText>
        </ThemedView>
      </ScreenContainer>
    )
  }

  const { playerPet, opponentPet, turn, battleLog, battleOver } = battleState

  return (
    <ScreenContainer>
      <ThemedView style={styles.container}>
        {/* Opponent Pokemon */}
        <View style={styles.opponentSection}>
          <View style={styles.pokemonInfo}>
            <ThemedText type="defaultSemiBold" style={styles.pokemonName}>
              {opponentPet.name} (Lv.{opponentPet.level})
            </ThemedText>
            <View style={styles.hpBarContainer}>
              <View style={styles.hpBar}>
                <Animated.View 
                  style={[
                    styles.hpFill, 
                    { 
                      width: opponentHpAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.hpText}>
                {opponentPet.currentHp}/{opponentPet.stats.hp}
              </ThemedText>
            </View>
          </View>
          <Image source={{ uri: opponentPet.image }} style={styles.opponentImage} />
        </View>

        {/* Battle Log */}
        <View style={styles.battleLogContainer}>
          <ThemedText style={styles.battleLogText}>
            {battleLog[battleLog.length - 1]}
          </ThemedText>
        </View>

        {/* Player Pokemon */}
        <View style={styles.playerSection}>
          <Image source={{ uri: playerPet.image }} style={styles.playerImage} />
          <View style={styles.pokemonInfo}>
            <ThemedText type="defaultSemiBold" style={styles.pokemonName}>
              {playerPet.name} (Lv.{playerPet.level})
            </ThemedText>
            <View style={styles.hpBarContainer}>
              <View style={styles.hpBar}>
                <Animated.View 
                  style={[
                    styles.hpFill, 
                    { 
                      width: playerHpAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.hpText}>
                {playerPet.currentHp}/{playerPet.stats.maxHp}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Move Selection */}
        {turn === 'player' && !battleOver && !isAnimating && (
          <View style={styles.movesContainer}>
            <ThemedText type="defaultSemiBold" style={styles.movesTitle}>
              Choose a move:
            </ThemedText>
            <View style={styles.movesGrid}>
              {playerPet.moves.map((move, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moveButton,
                    selectedMove?.id === move.id && styles.selectedMove
                  ]}
                  onPress={() => handlePlayerMove(move)}
                >
                  <ThemedText style={styles.moveName}>{move.name}</ThemedText>
                  <ThemedText style={styles.moveType}>{move.element}</ThemedText>
                  <ThemedText style={styles.movePower}>
                    {move.power > 0 ? `${move.power} PWR` : 'Status'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Waiting for opponent */}
        {turn === 'opponent' && !battleOver && (
          <View style={styles.waitingContainer}>
            <ThemedText style={styles.waitingText}>
              {opponentPet.name} is choosing a move...
            </ThemedText>
          </View>
        )}

        {/* Battle Over */}
        {battleOver && (
          <View style={styles.battleOverContainer}>
            <ThemedText type="title" style={styles.battleOverText}>
              {battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}
            </ThemedText>
          </View>
        )}

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <ButtonSecondary onPress={() => router.back()}>
            {battleOver ? 'Continue' : 'Flee Battle'}
          </ButtonSecondary>
        </View>
      </ThemedView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: metrics.medium,
  },
  opponentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.large,
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
  },
  playerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.large,
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    fontSize: fontSizes.large,
    marginBottom: metrics.small,
    color: colors.primary,
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.small,
  },
  hpBar: {
    flex: 1,
    height: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: metrics.borderRadius,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  hpText: {
    fontSize: fontSizes.span,
    fontWeight: '600',
    minWidth: 60,
  },
  opponentImage: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius,
  },
  playerImage: {
    width: 100,
    height: 100,
    borderRadius: metrics.borderRadius,
  },
  battleLogContainer: {
    backgroundColor: colors.black,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.large,
    minHeight: 60,
    justifyContent: 'center',
  },
  battleLogText: {
    color: colors.white,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
  movesContainer: {
    backgroundColor: colors.white,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  movesTitle: {
    fontSize: fontSizes.large,
    marginBottom: metrics.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.small,
  },
  moveButton: {
    width: '48%',
    backgroundColor: colors.backgroundPrimary,
    padding: metrics.medium,
    borderRadius: metrics.borderRadius,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedMove: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  moveName: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    marginBottom: metrics.tiny,
  },
  moveType: {
    fontSize: fontSizes.span,
    color: colors.gray,
    marginBottom: metrics.tiny,
  },
  movePower: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontWeight: '500',
  },
  waitingContainer: {
    backgroundColor: colors.info,
    padding: metrics.large,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  waitingText: {
    color: colors.white,
    fontSize: fontSizes.body,
    textAlign: 'center',
    fontWeight: '600',
  },
  battleOverContainer: {
    backgroundColor: colors.primary,
    padding: metrics.large,
    borderRadius: metrics.borderRadius,
    marginBottom: metrics.medium,
  },
  battleOverText: {
    color: colors.white,
    textAlign: 'center',
  },
  backButtonContainer: {
    marginTop: 'auto',
  },
})
