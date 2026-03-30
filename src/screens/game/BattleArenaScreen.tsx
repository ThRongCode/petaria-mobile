/**
 * BattleArenaScreen — "Lapis Glassworks" redesign
 *
 * Full battle screen using ScreenContainer + backgroundImage.
 * Delegates rendering to BattleField and BattleActions sub-components.
 */

import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { ThemedText } from '@/components'
import { ScreenContainer } from '@/components/ScreenContainer'
import { LoadingContainer, useAlert } from '@/components/ui'
import { Pet, Opponent, Move } from '@/stores/types/game'
import { useAppDispatch } from '@/stores/store'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { battleApi } from '@/services/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { backgrounds } from '@/assets/images/backgrounds'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import {
  BattleField,
  BattleActions,
  DEFAULT_MOVES,
  calculateDamage,
  applyMoveEffects,
  buildRewardsMessage,
} from './components/battle'

interface BattleState {
  playerPet: Pet & { currentHp: number; temporaryStats: any }
  opponentPet: Opponent & { currentHp: number; temporaryStats: any }
  turn: 'player' | 'opponent'
  turnCount: number
  battleLog: string[]
  battleOver: boolean
  winner: 'player' | 'opponent' | null
}

interface BattleResultData {
  won: boolean
  xpReward: number
  coinReward: number
  petLeveledUp: boolean
  petNewLevel: number
  petStatChanges?: { maxHp: number; attack: number; defense: number; speed: number }
  userLeveledUp: boolean
  userNewLevel: number
}

export const BattleArenaScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const alert = useAlert()

  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [selectedMove, setSelectedMove] = useState<Move | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [playerHpAnim] = useState(new Animated.Value(100))
  const [opponentHpAnim] = useState(new Animated.Value(100))

  const [battleSessionId, setBattleSessionId] = useState<string | null>(null)
  const [totalDamageDealt, setTotalDamageDealt] = useState(0)
  const [totalDamageTaken, setTotalDamageTaken] = useState(0)
  const [isStartingBattle, setIsStartingBattle] = useState(false)
  const [isCompletingBattle, setIsCompletingBattle] = useState(false)

  const [showRewardsDialog, setShowRewardsDialog] = useState(false)
  const [battleResult, setBattleResult] = useState<BattleResultData | null>(null)

  // ── Initialize ─────────────────────────────────
  useEffect(() => {
    const initBattle = async () => {
      if (params.playerPet && params.opponent && !battleState) {
        const playerPet = JSON.parse(params.playerPet as string) as Pet
        const opponent = JSON.parse(params.opponent as string) as Opponent

        setIsStartingBattle(true)
        try {
          const response = await battleApi.startBattle(opponent.id, playerPet.id)
          if (response.success && response.data.battle) {
            setBattleSessionId(response.data.battle.id)
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Failed to start battle'
          alert.show('Cannot Start Battle', msg, [{ text: 'OK', onPress: () => router.back() }])
          setIsStartingBattle(false)
          return
        } finally {
          setIsStartingBattle(false)
        }

        const playerGoesFirst = playerPet.stats.speed >= opponent.stats.speed
        const playerMoves = playerPet.moves?.length ? playerPet.moves : DEFAULT_MOVES
        const opponentMoves = opponent.moves?.length ? opponent.moves : DEFAULT_MOVES

        setBattleState({
          playerPet: { ...playerPet, moves: playerMoves, currentHp: playerPet.stats.hp, temporaryStats: { ...playerPet.stats } },
          opponentPet: { ...opponent, moves: opponentMoves, currentHp: opponent.stats.hp, temporaryStats: { ...opponent.stats } },
          turn: playerGoesFirst ? 'player' : 'opponent',
          turnCount: 1,
          battleLog: [`Battle begins! ${playerPet.name} vs ${opponent.name}!`],
          battleOver: false,
          winner: null,
        })

        playerHpAnim.setValue((playerPet.stats.hp / playerPet.stats.maxHp) * 100)
        opponentHpAnim.setValue((opponent.stats.hp / opponent.stats.maxHp) * 100)
      }
    }
    initBattle()
  }, [params.playerPet, params.opponent, battleState])

  // ── Opponent turn ──────────────────────────────
  useEffect(() => {
    if (battleState && battleState.turn === 'opponent' && !battleState.battleOver && !isAnimating) {
      const timer = setTimeout(() => handleOpponentMove(), 1500)
      return () => clearTimeout(timer)
    }
  }, [battleState?.turn, battleState?.turnCount, isAnimating])

  // ── API complete ───────────────────────────────
  const completeBattleSession = async (won: boolean, finalHp: number) => {
    if (!battleSessionId || !battleState) return
    setIsCompletingBattle(true)
    try {
      const response = await battleApi.completeBattle(battleSessionId, won, totalDamageDealt, totalDamageTaken, finalHp)
      if (response.success && response.data) {
        const result = {
          won: response.data.won,
          xpReward: response.data.xpReward,
          coinReward: response.data.coinReward,
          petLeveledUp: response.data.pet?.leveledUp || false,
          petNewLevel: response.data.pet?.newLevel || 0,
          petStatChanges: response.data.pet?.statChanges,
          userLeveledUp: response.data.user?.leveledUp || false,
          userNewLevel: response.data.user?.newLevel || 0,
        }
        setBattleResult(result)
        alert.show(
          result.won ? 'Victory Rewards!' : 'Battle Complete',
          buildRewardsMessage(result),
          [{ text: 'Awesome!' }]
        )
        dispatch({ type: 'game/loadUserData' })
      }
    } catch (error) {
      console.error('❌ Failed to complete battle:', error)
    } finally {
      setIsCompletingBattle(false)
    }
  }

  // ── Moves ──────────────────────────────────────
  const handleMoveSelection = (move: Move) => {
    if (isAnimating || battleState?.turn !== 'player') return
    setSelectedMove(move)
    setTimeout(() => handlePlayerMove(move), 300)
  }

  const handlePlayerMove = (move: Move) => {
    if (!battleState || battleState.turn !== 'player' || isAnimating) return
    setIsAnimating(true)
    const { playerPet, opponentPet } = battleState
    let newLog = [...battleState.battleLog]
    const { damage, effectiveness } = calculateDamage(playerPet, opponentPet, move)

    if (damage === -1) {
      newLog.push(`${playerPet.name} used ${move.name}!`, `But it missed!`)
    } else if (damage === 0 && effectiveness === 0) {
      newLog.push(`${playerPet.name} used ${move.name}!`, `It doesn't affect ${opponentPet.name}...`)
    } else if (damage > 0) {
      newLog.push(`${playerPet.name} used ${move.name}!`)
      if (effectiveness > 1) newLog.push(`It's super effective!`)
      else if (effectiveness < 1) newLog.push(`It's not very effective...`)
      newLog.push(`It dealt ${damage} damage!`)
      opponentPet.currentHp = Math.max(0, opponentPet.currentHp - damage)
      setTotalDamageDealt((p) => p + damage)
      Animated.timing(opponentHpAnim, {
        toValue: (opponentPet.currentHp / opponentPet.temporaryStats.maxHp) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
    applyMoveEffects(playerPet, opponentPet, move)

    if (opponentPet.currentHp <= 0) {
      newLog.push(`${opponentPet.name} fainted!`, `Victory! Syncing with server...`)
      setBattleState({ ...battleState, opponentPet, battleLog: newLog, battleOver: true, winner: 'player' })
      setIsAnimating(false)
      completeBattleSession(true, playerPet.currentHp)
      return
    }

    setBattleState({ ...battleState, playerPet, opponentPet, turn: 'opponent', turnCount: battleState.turnCount + 1, battleLog: newLog })
    setSelectedMove(null)
    setTimeout(() => setIsAnimating(false), 600)
  }

  const handleOpponentMove = () => {
    if (!battleState || battleState.turn !== 'opponent' || isAnimating) return
    setIsAnimating(true)
    const { playerPet, opponentPet } = battleState
    if (!opponentPet.moves?.length) { setIsAnimating(false); return }

    const randomMove = opponentPet.moves[Math.floor(Math.random() * opponentPet.moves.length)]
    let newLog = [...battleState.battleLog]
    const { damage, effectiveness } = calculateDamage(opponentPet, playerPet, randomMove)

    if (damage === -1) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`, `But it missed!`)
    } else if (damage === 0 && effectiveness === 0) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`, `It doesn't affect ${playerPet.name}...`)
    } else if (damage > 0) {
      newLog.push(`${opponentPet.name} used ${randomMove.name}!`)
      if (effectiveness > 1) newLog.push(`It's super effective!`)
      else if (effectiveness < 1) newLog.push(`It's not very effective...`)
      newLog.push(`It dealt ${damage} damage!`)
      playerPet.currentHp = Math.max(0, playerPet.currentHp - damage)
      setTotalDamageTaken((p) => p + damage)
      Animated.timing(playerHpAnim, {
        toValue: (playerPet.currentHp / playerPet.temporaryStats.maxHp) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
    applyMoveEffects(opponentPet, playerPet, randomMove)

    if (playerPet.currentHp <= 0) {
      newLog.push(`${playerPet.name} fainted!`, `Defeat... Syncing with server...`)
      setBattleState({ ...battleState, playerPet, battleLog: newLog, battleOver: true, winner: 'opponent' })
      setIsAnimating(false)
      completeBattleSession(false, playerPet.currentHp)
      return
    }

    setBattleState({ ...battleState, playerPet, opponentPet, turn: 'player', turnCount: battleState.turnCount + 1, battleLog: newLog })
    setTimeout(() => setIsAnimating(false), 600)
  }

  // ── Loading state ──────────────────────────────
  if (!battleState || isStartingBattle) {
    return (
      <ScreenContainer backgroundImage={backgrounds.battleArena}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Battle Arena</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <LoadingContainer message={isStartingBattle ? 'Starting battle session...' : 'Loading battle...'} />
      </ScreenContainer>
    )
  }

  const { playerPet, opponentPet, turn, battleLog, battleOver, winner } = battleState
  const playerHpPct = (playerPet.currentHp / playerPet.temporaryStats.maxHp) * 100
  const opponentHpPct = (opponentPet.currentHp / opponentPet.temporaryStats.maxHp) * 100

  return (
    <ScreenContainer backgroundImage={backgrounds.battleArena}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Battle Arena</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <BattleField
          playerPet={playerPet}
          opponentPet={opponentPet}
          playerHpAnim={playerHpAnim}
          opponentHpAnim={opponentHpAnim}
          playerHpPercentage={playerHpPct}
          opponentHpPercentage={opponentHpPct}
        />
        <BattleActions
          battleLog={battleLog}
          turn={turn}
          battleOver={battleOver}
          winner={winner}
          playerName={playerPet.name}
          opponentName={opponentPet.name}
          moves={playerPet.moves}
          selectedMove={selectedMove}
          isAnimating={isAnimating}
          battleResult={battleResult}
          onMoveSelect={handleMoveSelection}
          onRun={() => router.back()}
          onContinue={() => router.back()}
        />
      </ScrollView>

    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  headerTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})