import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Animated, Dimensions, ScrollView, ImageBackground } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { LinearGradient } from 'expo-linear-gradient'
import { Pet, Opponent, Move } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

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
      <ImageBackground 
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Battle Arena</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.container}>
          <ThemedText>Loading battle...</ThemedText>
        </View>
      </ImageBackground>
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
    <ImageBackground 
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Battle Arena</ThemedText>
        <View style={{ width: 40 }} />
      </View>
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
                <Panel variant="dark" style={styles.infoBadge}>
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
                </Panel>
              </View>

              {/* Player Pokemon - Right Half */}
              <View style={styles.pokemonColumn}>
                <Image 
                  source={getPokemonImage(playerPet.species) as any}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
                {/* Player Info Badge */}
                <Panel variant="dark" style={styles.infoBadge}>
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
                </Panel>
              </View>
            </View>
          </View>

          {/* Bottom Section: Compact Action Box */}
          <View style={styles.bottomSection}>
            {/* Battle Log */}
            <Panel variant="dark" style={styles.battleLogBox}>
              <ThemedText style={styles.battleLogText}>
                {battleLog[battleLog.length - 1]}
              </ThemedText>
            </Panel>
            
            {/* Action Box - Compact */}
            <Panel variant="dark" style={styles.actionBox}>
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
                            styles.moveButtonContainer,
                            selectedMove?.name === move.name && styles.selectedMoveButton
                          ]}
                          onPress={() => handleMoveSelection(move)}
                          disabled={isAnimating}
                        >
                          <LinearGradient
                            colors={selectedMove?.name === move.name ? ['#4CAF50', '#45a049'] : ['#2196F3', '#1976D2']}
                            style={styles.moveButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <ThemedText style={styles.moveButtonText}>{move.name}</ThemedText>
                            <ThemedText style={styles.movePpText}>PP {move.pp}/{move.maxPp}</ThemedText>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Run Button */}
                    <TouchableOpacity
                      style={styles.runButtonContainer}
                      onPress={() => router.back()}
                    >
                      <LinearGradient
                        colors={['#EF5350', '#E53935']}
                        style={styles.runButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <ThemedText style={styles.runButtonText}>🏃 Run</ThemedText>
                      </LinearGradient>
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
                    style={styles.continueButtonContainer}
                    onPress={() => router.back()}
                  >
                    <LinearGradient
                      colors={battleState.winner === 'player' ? ['#4CAF50', '#45a049'] : ['#757575', '#616161']}
                      style={styles.continueButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Panel>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  
  // Battle field area - Pokemon side by side
  battleFieldArea: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  
  pokemonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  
  pokemonSprite: {
    width: 130,
    height: 130,
    marginBottom: 16,
  },
  
  infoBadge: {
    width: '100%',
    maxWidth: 180,
    padding: 12,
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
    color: '#fff',
  },
  badgeLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
  },
  hpBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
  },
  hpNumbers: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Bottom Section: Battle Log + Actions
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  battleLogBox: {
    padding: 12,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  battleLogText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  
  // Action Box - Compact
  actionBox: {
    padding: 16,
  },
  actionContent: {
    // Container for action elements
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moveButtonContainer: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  moveButton: {
    padding: 12,
    alignItems: 'center',
  },
  selectedMoveButton: {
    // Selected state handled by gradient colors
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  movePpText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  runButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  runButton: {
    padding: 12,
    alignItems: 'center',
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 16,
  },
  
  // Battle Over
  battleOverBox: {
    alignItems: 'center',
  },
  battleOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  continueButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  continueButton: {
    padding: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
