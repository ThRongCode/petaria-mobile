import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Animated, Dimensions, ScrollView, ImageBackground, ActivityIndicator, Alert } from 'react-native'
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
import { battleApi, petApi } from '@/services/api'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Type Effectiveness Chart (Pokemon-style)
const TYPE_EFFECTIVENESS: Record<string, { strong: string[], weak: string[], immune: string[] }> = {
  Normal: { strong: [], weak: ['Rock', 'Steel'], immune: ['Ghost'] },
  Fire: { strong: ['Grass', 'Ice', 'Bug', 'Steel'], weak: ['Fire', 'Water', 'Rock', 'Dragon'], immune: [] },
  Water: { strong: ['Fire', 'Ground', 'Rock'], weak: ['Water', 'Grass', 'Dragon'], immune: [] },
  Grass: { strong: ['Water', 'Ground', 'Rock'], weak: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'], immune: [] },
  Electric: { strong: ['Water', 'Flying'], weak: ['Electric', 'Grass', 'Dragon'], immune: ['Ground'] },
  Ice: { strong: ['Grass', 'Ground', 'Flying', 'Dragon'], weak: ['Fire', 'Water', 'Ice', 'Steel'], immune: [] },
  Fighting: { strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], weak: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], immune: ['Ghost'] },
  Poison: { strong: ['Grass', 'Fairy'], weak: ['Poison', 'Ground', 'Rock', 'Ghost'], immune: ['Steel'] },
  Ground: { strong: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], weak: ['Grass', 'Bug'], immune: ['Flying'] },
  Flying: { strong: ['Grass', 'Fighting', 'Bug'], weak: ['Electric', 'Rock', 'Steel'], immune: [] },
  Psychic: { strong: ['Fighting', 'Poison'], weak: ['Psychic', 'Steel'], immune: ['Dark'] },
  Bug: { strong: ['Grass', 'Psychic', 'Dark'], weak: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], immune: [] },
  Rock: { strong: ['Fire', 'Ice', 'Flying', 'Bug'], weak: ['Fighting', 'Ground', 'Steel'], immune: [] },
  Ghost: { strong: ['Psychic', 'Ghost'], weak: ['Dark'], immune: ['Normal'] },
  Dragon: { strong: ['Dragon'], weak: ['Steel'], immune: ['Fairy'] },
  Dark: { strong: ['Psychic', 'Ghost'], weak: ['Fighting', 'Dark', 'Fairy'], immune: [] },
  Steel: { strong: ['Ice', 'Rock', 'Fairy'], weak: ['Fire', 'Water', 'Electric', 'Steel'], immune: [] },
  Fairy: { strong: ['Fighting', 'Dragon', 'Dark'], weak: ['Fire', 'Poison', 'Steel'], immune: [] },
}

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
  
  // Battle session tracking for API
  const [battleSessionId, setBattleSessionId] = useState<string | null>(null)
  const [totalDamageDealt, setTotalDamageDealt] = useState(0)
  const [totalDamageTaken, setTotalDamageTaken] = useState(0)
  const [isStartingBattle, setIsStartingBattle] = useState(false)
  const [isCompletingBattle, setIsCompletingBattle] = useState(false)

  // Initialize battle from params and start battle session
  useEffect(() => {
    const initBattle = async () => {
      if (params.playerPet && params.opponent && !battleState) {
        const playerPet = JSON.parse(params.playerPet as string) as Pet
        const opponent = JSON.parse(params.opponent as string) as Opponent
        
        // Start battle session with backend
        setIsStartingBattle(true)
        try {
          const response = await battleApi.startBattle(opponent.id, playerPet.id)
          if (response.success && response.data.battle) {
            setBattleSessionId(response.data.battle.id)
            console.log('✅ Battle session started:', response.data.battle.id)
          }
        } catch (error) {
          console.error('❌ Failed to start battle session:', error)
          
          // Show alert and navigate back
          const errorMessage = error instanceof Error ? error.message : 'Failed to start battle'
          Alert.alert(
            'Cannot Start Battle',
            errorMessage,
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          )
          setIsStartingBattle(false)
          return
        } finally {
          setIsStartingBattle(false)
        }
        
        // Determine who goes first based on speed
        const playerGoesFirst = playerPet.stats.speed >= opponent.stats.speed
        
        setBattleState({
          playerPet: {
            ...playerPet,
            currentHp: playerPet.stats.hp, // Use actual current HP from pet
            temporaryStats: { ...playerPet.stats }
          },
          opponentPet: {
            ...opponent,
            currentHp: opponent.stats.hp, // Opponent starts with max HP
            temporaryStats: { ...opponent.stats }
          },
          turn: playerGoesFirst ? 'player' : 'opponent',
          turnCount: 1,
          battleLog: [`Battle begins! ${playerPet.name} vs ${opponent.name}!`],
          battleOver: false,
          winner: null
        })
        
        // Set initial HP bar animations to correct percentages
        const playerHpPercent = (playerPet.stats.hp / playerPet.stats.maxHp) * 100
        const opponentHpPercent = (opponent.stats.hp / opponent.stats.maxHp) * 100
        playerHpAnim.setValue(playerHpPercent)
        opponentHpAnim.setValue(opponentHpPercent)
      }
    }
    
    initBattle()
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

  const calculateDamage = (attacker: any, defender: any, move: Move): { damage: number, effectiveness: number } => {
    if (move.power === 0) return { damage: 0, effectiveness: 1 } // Status moves
    
    // Miss chance (check first)
    if (Math.random() * 100 > move.accuracy) {
      return { damage: -1, effectiveness: 1 } // Miss
    }
    
    const attack = attacker.temporaryStats.attack
    const defense = defender.temporaryStats.defense
    const level = attacker.level || 12
    
    // Pokemon-like damage formula (simplified)
    const baseDamage = Math.floor(((((2 * level / 5 + 2) * move.power * attack / defense) / 50) + 2))
    
    // Calculate type effectiveness
    let effectiveness = 1.0
    const moveElement = move.element
    const defenderType = defender.type || getTypeFromSpecies(defender.species)
    
    console.log(`⚔️ Type Check: ${move.name} (${moveElement}) vs ${defender.species || defender.name} (${defenderType})`)
    
    if (moveElement && defenderType && TYPE_EFFECTIVENESS[moveElement]) {
      const typeChart = TYPE_EFFECTIVENESS[moveElement]
      if (typeChart.immune.includes(defenderType)) {
        effectiveness = 0
      } else if (typeChart.strong.includes(defenderType)) {
        effectiveness = 2.0
      } else if (typeChart.weak.includes(defenderType)) {
        effectiveness = 0.5
      }
      console.log(`   Effectiveness: ${effectiveness}x`)
    }
    
    // Add some randomness (85-100% damage)
    const randomFactor = (Math.random() * 0.15 + 0.85)
    const finalDamage = Math.floor(baseDamage * effectiveness * randomFactor)
    
    // Return actual damage (can be 0 for immune matchups)
    return { damage: finalDamage, effectiveness }
  }
  
  // Helper function to infer type from species name
  const getTypeFromSpecies = (species: string): string => {
    const lowerSpecies = species.toLowerCase()
    if (lowerSpecies.includes('char') || lowerSpecies.includes('fire')) return 'Fire'
    if (lowerSpecies.includes('squir') || lowerSpecies.includes('water')) return 'Water'
    if (lowerSpecies.includes('bulb') || lowerSpecies.includes('grass') || lowerSpecies.includes('leaf')) return 'Grass'
    if (lowerSpecies.includes('pika') || lowerSpecies.includes('electric') || lowerSpecies.includes('thunder')) return 'Electric'
    if (lowerSpecies.includes('ice') || lowerSpecies.includes('frost')) return 'Ice'
    if (lowerSpecies.includes('dragon')) return 'Dragon'
    if (lowerSpecies.includes('ghost')) return 'Ghost'
    if (lowerSpecies.includes('psychic')) return 'Psychic'
    if (lowerSpecies.includes('dark')) return 'Dark'
    if (lowerSpecies.includes('steel') || lowerSpecies.includes('metal')) return 'Steel'
    if (lowerSpecies.includes('fairy')) return 'Fairy'
    if (lowerSpecies.includes('rock') || lowerSpecies.includes('stone')) return 'Rock'
    if (lowerSpecies.includes('ground') || lowerSpecies.includes('sand')) return 'Ground'
    if (lowerSpecies.includes('fighting') || lowerSpecies.includes('fight')) return 'Fighting'
    if (lowerSpecies.includes('poison')) return 'Poison'
    if (lowerSpecies.includes('bug')) return 'Bug'
    if (lowerSpecies.includes('fly') || lowerSpecies.includes('bird')) return 'Flying'
    return 'Normal'
  }

  const completeBattleSession = async (won: boolean, finalHp: number) => {
    if (!battleSessionId || !battleState) {
      console.error('❌ Cannot complete battle: missing session ID or battle state')
      return
    }
    
    setIsCompletingBattle(true)
    try {
      console.log(`💾 Completing battle session ${battleSessionId}: won=${won}, finalHp=${finalHp}, dealt=${totalDamageDealt}, taken=${totalDamageTaken}`)
      
      const response = await battleApi.completeBattle(
        battleSessionId,
        won,
        totalDamageDealt,
        totalDamageTaken,
        finalHp
      )
      
      if (response.success) {
        console.log('✅ Battle completed:', response.data)
        
        // Reload ALL user data to get updated pets, stats, coins, XP
        // This triggers the saga which properly transforms the data
        dispatch({ type: 'game/loadUserData' })
      }
    } catch (error) {
      console.error('❌ Failed to complete battle:', error)
    } finally {
      setIsCompletingBattle(false)
    }
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
    
    let newLog = [...battleState.battleLog]
    
    // Calculate damage
    const { damage, effectiveness } = calculateDamage(playerPet, opponentPet, move)
    
    if (damage === -1) {
      newLog.push(`${playerPet.name} used ${move.name}!`)
      newLog.push(`But it missed!`)
    } else if (damage === 0 && effectiveness === 0) {
      newLog.push(`${playerPet.name} used ${move.name}!`)
      newLog.push(`It doesn't affect ${opponentPet.name}...`)
    } else if (damage > 0) {
      newLog.push(`${playerPet.name} used ${move.name}!`)
      if (effectiveness > 1) {
        newLog.push(`It's super effective!`)
      } else if (effectiveness < 1) {
        newLog.push(`It's not very effective...`)
      }
      newLog.push(`It dealt ${damage} damage!`)
      opponentPet.currentHp = Math.max(0, opponentPet.currentHp - damage)
      
      // Track damage dealt for API
      setTotalDamageDealt(prev => prev + damage)
      
      // Animate HP bar
      Animated.timing(opponentHpAnim, {
        toValue: (opponentPet.currentHp / opponentPet.temporaryStats.maxHp) * 100,
        duration: 500,
        useNativeDriver: false
      }).start()
    }
    
    // Apply effects
    applyMoveEffects(playerPet, opponentPet, move)
    
    // Check if opponent fainted
    if (opponentPet.currentHp <= 0) {
      newLog.push(`${opponentPet.name} fainted!`)
      newLog.push(`Victory! Syncing with server...`)
      
      setBattleState({
        ...battleState,
        opponentPet,
        battleLog: newLog,
        battleOver: true,
        winner: 'player'
      })
      setIsAnimating(false)
      
      // Complete battle via API with final HP
      completeBattleSession(true, playerPet.currentHp)
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
    
    let newLog = [...battleState.battleLog]
    
    // Calculate damage
    const { damage, effectiveness } = calculateDamage(opponentPet, playerPet, randomMove)
    
    if (damage === -1) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`)
      newLog.push(`But it missed!`)
    } else if (damage === 0 && effectiveness === 0) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`)
      newLog.push(`It doesn't affect ${playerPet.name}...`)
    } else if (damage > 0) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`)
      if (effectiveness > 1) {
        newLog.push(`It's super effective!`)
      } else if (effectiveness < 1) {
        newLog.push(`It's not very effective...`)
      }
      newLog.push(`It dealt ${damage} damage!`)
      playerPet.currentHp = Math.max(0, playerPet.currentHp - damage)
      
      // Track damage taken for API
      setTotalDamageTaken(prev => prev + damage)
      
      // Animate HP bar
      Animated.timing(playerHpAnim, {
        toValue: (playerPet.currentHp / playerPet.temporaryStats.maxHp) * 100,
        duration: 500,
        useNativeDriver: false
      }).start()
    }
    
    // Apply effects
    applyMoveEffects(opponentPet, playerPet, randomMove)
    
    // Check if player fainted
    if (playerPet.currentHp <= 0) {
      newLog.push(`${playerPet.name} fainted!`)
      newLog.push(`Defeat... Syncing with server...`)
      
      setBattleState({
        ...battleState,
        playerPet,
        battleLog: newLog,
        battleOver: true,
        winner: 'opponent'
      })
      setIsAnimating(false)
      
      // Complete battle via API with final HP
      completeBattleSession(false, playerPet.currentHp)
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

  if (!battleState || isStartingBattle) {
    return (
      <ImageBackground 
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradientOverlay}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Battle Arena</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <ThemedText style={styles.loadingText}>
            {isStartingBattle ? 'Starting battle session...' : 'Loading battle...'}
          </ThemedText>
        </View>
      </ImageBackground>
    )
  }

  const { playerPet, opponentPet, turn, battleLog, battleOver } = battleState
  
  const playerHpPercentage = (playerPet.currentHp / playerPet.temporaryStats.maxHp) * 100
  const opponentHpPercentage = (opponentPet.currentHp / opponentPet.temporaryStats.maxHp) * 100
  
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
                    {playerPet.currentHp} / {playerPet.temporaryStats.maxHp}
                  </ThemedText>
                </Panel>
              </View>
            </View>
          </View>

          {/* Bottom Section: Compact Action Box */}
          <View style={styles.bottomSection}>
            {/* Battle Log - Show last 3 messages */}
            <Panel variant="dark" style={styles.battleLogBox}>
              {battleLog.slice(-3).map((message, index) => (
                <ThemedText key={index} style={styles.battleLogText}>
                  {message}
                </ThemedText>
              ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
