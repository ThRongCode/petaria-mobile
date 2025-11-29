import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Alert, Animated, Dimensions, ScrollView } from 'react-native'
import { ThemedText, ThemedView, ScreenContainer, HeaderBase } from '@/components'
import { HEADER_GRADIENTS } from '@/constants/headerGradients'
import { getPokemonImage } from '@/assets/images'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { colors, metrics, fontSizes } from '@/themes'
import { Pet, Opponent, Move } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { useRouter, useLocalSearchParams } from 'expo-router'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
    if (battleState && battleState.turn === 'opponent' && !battleState.battleOver && !isAnimating) {
      console.log('⏰ Scheduling opponent move...')
      const timer = setTimeout(() => {
        handleOpponentMove()
      }, 1500)
      return () => {
        console.log('🧹 Cleaning up opponent timer')
        clearTimeout(timer)
      }
    }
  }, [battleState?.turn, battleState?.turnCount, isAnimating])

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
      // Healing effect
      if (move.effects.healing) {
        const healAmount = Math.floor(move.effects.healing)
        user.currentHp = Math.min(user.currentHp + healAmount, user.temporaryStats.hp)
      }
      
      // Stat boost effects
      if (move.effects.statBoost) {
        Object.entries(move.effects.statBoost).forEach(([stat, change]) => {
          if (typeof change === 'number') {
            user.temporaryStats[stat] = Math.max(1, user.temporaryStats[stat] + change)
          }
        })
      }
    }
  }

  const handleMoveSelection = (move: Move) => {
    if (isAnimating || battleState?.turn !== 'player') return
    
    console.log(`⚔️ Player selected ${move.name}`)
    setSelectedMove(move)
    
    // Auto-execute move after selection (like classic Pokemon)
    setTimeout(() => {
      handlePlayerMove(move)
    }, 300)
  }

  const handlePlayerMove = (move: Move) => {
    if (!battleState || battleState.turn !== 'player' || isAnimating) return
    
    console.log('👤 Player turn starting...')
    setIsAnimating(true)
    const { playerPet, opponentPet } = battleState
    
    let newLog = [...battleState.battleLog, `${playerPet.name} used ${move.name}!`]
    
    // Calculate damage
    const damage = calculateDamage(playerPet, opponentPet, move)
    
    if (damage === -1) {
      newLog.push(`${playerPet.name}'s attack missed!`)
    } else if (damage > 0) {
      opponentPet.currentHp = Math.max(0, opponentPet.currentHp - damage)
      newLog.push(`Dealt ${damage} damage!`)
      
      // Animate HP bar
      Animated.timing(opponentHpAnim, {
        toValue: (opponentPet.currentHp / opponentPet.temporaryStats.hp) * 100,
        duration: 500,
        useNativeDriver: false
      }).start()
    }
    
    // Apply effects
    applyMoveEffects(playerPet, opponentPet, move)
    
    // Check if opponent fainted
    if (opponentPet.currentHp <= 0) {
      newLog.push(`${opponentPet.name} fainted!`)
      
      // Calculate XP gained
      const xpGained = Math.floor(opponentPet.level * 50 * 1.5)
      newLog.push(`${playerPet.name} gained ${xpGained} XP!`)
      
      // TODO: Dispatch XP gain action when API is integrated
      // dispatch(gameActions.gainXp({ petId: playerPet.id, xp: xpGained }))
      
      setBattleState({
        ...battleState,
        opponentPet,
        battleLog: newLog,
        battleOver: true,
        winner: 'player'
      })
      setIsAnimating(false)
      return
    }
    
    // Switch turn
    console.log('🔄 Switching turn to opponent...')
    setBattleState({
      ...battleState,
      playerPet,
      opponentPet,
      turn: 'opponent',
      turnCount: battleState.turnCount + 1,
      battleLog: newLog
    })
    
    setSelectedMove(null)
    setTimeout(() => {
      console.log('✅ Player turn complete')
      setIsAnimating(false)
    }, 600)
  }

  const handleOpponentMove = () => {
    if (!battleState || battleState.turn !== 'opponent' || isAnimating) return
    
    console.log('🤖 Opponent turn starting...')
    setIsAnimating(true)
    const { playerPet, opponentPet } = battleState
    
    // Check if opponent has moves
    if (!opponentPet.moves || opponentPet.moves.length === 0) {
      console.error('Opponent has no moves!')
      setIsAnimating(false)
      return
    }
    
    // Opponent picks a random move
    const randomMove = opponentPet.moves[Math.floor(Math.random() * opponentPet.moves.length)]
    
    let newLog = [...battleState.battleLog, `${opponentPet.name} used ${randomMove.name}!`]
    
    // Calculate damage
    const damage = calculateDamage(opponentPet, playerPet, randomMove)
    
    if (damage === -1) {
      newLog.push(`${opponentPet.name}'s attack missed!`)
    } else if (damage > 0) {
      playerPet.currentHp = Math.max(0, playerPet.currentHp - damage)
      newLog.push(`${playerPet.name} took ${damage} damage!`)
      
      // Animate HP bar
      Animated.timing(playerHpAnim, {
        toValue: (playerPet.currentHp / playerPet.temporaryStats.hp) * 100,
        duration: 500,
        useNativeDriver: false
      }).start()
    }
    
    // Apply effects
    applyMoveEffects(opponentPet, playerPet, randomMove)
    
    // Check if player fainted
    if (playerPet.currentHp <= 0) {
      newLog.push(`${playerPet.name} fainted!`)
      
      setBattleState({
        ...battleState,
        playerPet,
        battleLog: newLog,
        battleOver: true,
        winner: 'opponent'
      })
      setIsAnimating(false)
      return
    }
    
    // Switch turn back to player
    console.log('🔄 Switching turn back to player...')
    setBattleState({
      ...battleState,
      playerPet,
      opponentPet,
      turn: 'player',
      turnCount: battleState.turnCount + 1,
      battleLog: newLog
    })
    
    setTimeout(() => {
      console.log('✅ Opponent turn complete')
      setIsAnimating(false)
    }, 600)
  }

  if (!battleState) {
    return (
      <ScreenContainer>
        <HeaderBase title="Battle Arena" gradientColors={HEADER_GRADIENTS.battle} />
        <ThemedView style={styles.container}>
          <ThemedText>Loading battle...</ThemedText>
        </ThemedView>
      </ScreenContainer>
    )
  }

  const { playerPet, opponentPet, turn, battleLog, battleOver } = battleState
  
  const playerHpPercentage = (playerPet.currentHp / playerPet.temporaryStats.hp) * 100
  const opponentHpPercentage = (opponentPet.currentHp / opponentPet.temporaryStats.hp) * 100
  
  const getHpColor = (percentage: number) => {
    if (percentage > 50) return '#4CAF50'
    if (percentage > 20) return '#FFA726'
    return '#EF5350'
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <HeaderBase title="Battle Arena" gradientColors={HEADER_GRADIENTS.battle} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Battle Layout: Side by Side Pokemon */}
          
          {/* Pokemon Battle Area - Side by Side */}
          <View style={styles.battleFieldArea}>
            <View style={styles.pokemonRow}>
              {/* Opponent Pokemon - Left Half */}
              <View style={styles.pokemonColumn}>
                <Image 
                  source={getPokemonImage(opponentPet.species) as any}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
                {/* Opponent Info Badge */}
                <View style={styles.infoBadge}>
                  <View style={styles.infoBadgeHeader}>
                    <ThemedText style={styles.badgeName}>{opponentPet.name}</ThemedText>
                    <ThemedText style={styles.badgeLevel}>Lv.{opponentPet.level}</ThemedText>
                  </View>
                  <View style={styles.hpBarContainer}>
                    <ThemedText style={styles.hpLabel}>HP</ThemedText>
                    <View style={styles.hpBarOuter}>
                      <Animated.View 
                        style={[
                          styles.hpBarInner,
                          {
                            width: opponentHpAnim.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['0%', '100%']
                            }),
                            backgroundColor: getHpColor(opponentHpPercentage)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Player Pokemon - Right Half */}
              <View style={styles.pokemonColumn}>
                <Image 
                  source={getPokemonImage(playerPet.species) as any}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
                {/* Player Info Badge */}
                <View style={styles.infoBadge}>
                  <View style={styles.infoBadgeHeader}>
                    <ThemedText style={styles.badgeName}>{playerPet.name}</ThemedText>
                    <ThemedText style={styles.badgeLevel}>Lv.{playerPet.level}</ThemedText>
                  </View>
                  <View style={styles.hpBarContainer}>
                    <ThemedText style={styles.hpLabel}>HP</ThemedText>
                    <View style={styles.hpBarOuter}>
                      <Animated.View 
                        style={[
                          styles.hpBarInner,
                          {
                            width: playerHpAnim.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['0%', '100%']
                            }),
                            backgroundColor: getHpColor(playerHpPercentage)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <ThemedText style={styles.hpNumbers}>
                    {playerPet.currentHp} / {playerPet.temporaryStats.hp}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Section: Compact Action Box */}
          <View style={styles.bottomSection}>
            {/* Battle Log */}
            <View style={styles.battleLogBox}>
              <ThemedText style={styles.battleLogText}>
                {battleLog[battleLog.length - 1]}
              </ThemedText>
            </View>
            
            {/* Action Box - Compact */}
            <View style={styles.actionBox}>
              {!battleOver ? (
                turn === 'player' ? (
                  <View style={styles.actionContent}>
                    <ThemedText style={styles.actionTitle}>What will {playerPet.name} do?</ThemedText>
                    
                    {/* Moves in 2x2 Grid */}
                    <View style={styles.movesGrid}>
                      {playerPet.moves.map((move, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.moveButton,
                            selectedMove?.name === move.name && styles.selectedMoveButton
                          ]}
                          onPress={() => handleMoveSelection(move)}
                          disabled={isAnimating}
                        >
                          <ThemedText style={styles.moveButtonText}>{move.name}</ThemedText>
                          <ThemedText style={styles.movePpText}>PP {move.pp}/{move.maxPp}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Run Button */}
                    <TouchableOpacity
                      style={styles.runButton}
                      onPress={() => router.back()}
                    >
                      <ThemedText style={styles.runButtonText}>Run</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ThemedText style={styles.waitingText}>
                    {opponentPet.name} is attacking...
                  </ThemedText>
                )
              ) : (
                <View style={styles.battleOverBox}>
                  <ThemedText style={styles.battleOverTitle}>
                    {battleState.winner === 'player' ? '🏆 Victory!' : '💀 Defeat!'}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => router.back()}
                  >
                    <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
                  </TouchableOpacity>
                </View>
            )}
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#87CEEB', // Sky blue background
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#87CEEB', // Sky blue background
  },
  container: {
    flex: 1,
    backgroundColor: '#87CEEB', // Sky blue background
  },
  
  // Battle field area - Pokemon side by side
  battleFieldArea: {
    paddingTop: metrics.large * 2,
    paddingHorizontal: metrics.medium,
    paddingBottom: metrics.large,
  },
  
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: metrics.medium,
  },
  
  pokemonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  
  pokemonSprite: {
    width: 130,
    height: 130,
    marginBottom: metrics.medium,
  },
  
  infoBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    padding: metrics.medium,
    width: '100%',
    maxWidth: 180,
  },
  
  // Info Badge Styles
  infoBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  badgeLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 6,
  },
  hpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
  },
  hpBarInner: {
    height: '100%',
  },
  hpNumbers: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Bottom Section: Battle Log + Actions
  bottomSection: {
    paddingHorizontal: metrics.medium,
    paddingBottom: metrics.medium,
  },
  battleLogBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    padding: metrics.medium,
    marginBottom: metrics.small,
    minHeight: 50,
    justifyContent: 'center',
  },
  battleLogText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  
  // Action Box - Compact
  actionBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    padding: metrics.medium,
  },
  actionContent: {
    // Container for action elements
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: metrics.small,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: metrics.small,
  },
  moveButton: {
    width: '48%',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#999',
    padding: metrics.small,
    marginBottom: metrics.small,
  },
  selectedMoveButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
    borderWidth: 3,
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  movePpText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  runButton: {
    backgroundColor: '#EF5350',
    borderRadius: 8,
    padding: metrics.small,
    borderWidth: 2,
    borderColor: '#C62828',
  },
  runButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: metrics.medium,
  },
  
  // Battle Over
  battleOverBox: {
    alignItems: 'center',
  },
  battleOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: metrics.large,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: metrics.medium,
    paddingHorizontal: metrics.large * 2,
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
