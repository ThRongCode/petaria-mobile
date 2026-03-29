/**
 * Battle Selection Screen — "Lapis Glassworks" redesign
 *
 * Select opponent for a specific battle type.
 * Design ref: desgin/battle_selection_immersive/code.html
 */

import React, { useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, FlatList } from 'react-native'
import { ThemedText } from '@/components'
import { LoadingContainer } from '@/components/ui'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Opponent, Move } from '@/stores/types/game'
import { battleApi } from '@/services/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

// Backend opponent type (matches Prisma schema with relations)
interface BackendOpponent {
  id: string
  name: string
  species?: string
  description?: string
  difficulty: string
  level: number
  hp?: number
  maxHp?: number
  attack?: number
  defense?: number
  speed?: number
  coinReward?: number
  xpReward?: number
  rewardXp?: number
  rewardCoins?: number
  imageUrl?: string
  unlockLevel: number
  moves?: Array<{
    move: {
      id: string
      name: string
      type: string
      element: string
      power: number
      accuracy: number
      pp: number
      maxPp: number
      description: string
      effectDamage?: number
      effectHealing?: number
      effectStatusEffect?: string
      effectStatBoost?: any
    }
  }>
  pets?: Array<{
    species: string
    level: number
    hp: number
    maxHp: number
    attack: number
    defense: number
    speed: number
  }>
}

const DIFFICULTY_STYLE: Record<string, { color: string; glow: string }> = {
  easy: { color: colors.success, glow: 'rgba(76,175,80,0.2)' },
  normal: { color: colors.primary, glow: 'rgba(68,216,241,0.2)' },
  medium: { color: colors.warning, glow: 'rgba(255,183,77,0.2)' },
  hard: { color: colors.secondaryFixed, glow: 'rgba(255,225,109,0.2)' },
  expert: { color: colors.error, glow: 'rgba(255,180,171,0.2)' },
  legendary: { color: '#9C27B0', glow: 'rgba(156,39,176,0.2)' },
}

export const BattleSelectionScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)

  const [opponents, setOpponents] = useState<BackendOpponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const battleType = params.battleType as string
  const battleName = params.battleName as string

  useEffect(() => {
    const loadOpponents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await battleApi.listOpponents()
        setOpponents(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load opponents')
      } finally {
        setIsLoading(false)
      }
    }
    loadOpponents()
  }, [])

  const getDiffStyle = (difficulty?: string) =>
    DIFFICULTY_STYLE[difficulty?.toLowerCase() || ''] || DIFFICULTY_STYLE.normal

  const handleOpponentSelect = (opponent: BackendOpponent) => {
    const transformedMoves: Move[] = opponent.moves?.map(opponentMove => ({
      id: opponentMove.move.id,
      name: opponentMove.move.name,
      type: opponentMove.move.type as 'Physical' | 'Special' | 'Status',
      element: opponentMove.move.element as any,
      power: opponentMove.move.power,
      accuracy: opponentMove.move.accuracy,
      pp: opponentMove.move.pp,
      maxPp: opponentMove.move.maxPp,
      description: opponentMove.move.description,
      effects: {
        damage: opponentMove.move.effectDamage,
        healing: opponentMove.move.effectHealing,
        statusEffect: opponentMove.move.effectStatusEffect as any,
        statBoost: opponentMove.move.effectStatBoost,
      },
    })) || []

    const transformedOpponent: Opponent = {
      id: opponent.id,
      name: opponent.name,
      species: opponent.species || 'unknown',
      level: opponent.level,
      difficulty: opponent.difficulty as 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master',
      stats: {
        hp: opponent.hp || 100,
        maxHp: opponent.maxHp || 100,
        attack: opponent.attack || 50,
        defense: opponent.defense || 50,
        speed: opponent.speed || 50,
      },
      moves: transformedMoves,
      image: opponent.imageUrl || '',
      rewards: {
        xp: opponent.rewardXp || 0,
        coins: opponent.rewardCoins || 0,
        items: [],
      },
      unlockLevel: opponent.unlockLevel,
    }

    router.push({
      pathname: '/pokemon-selection' as any,
      params: { opponent: JSON.stringify(transformedOpponent), battleType },
    })
  }

  const renderOpponentCard = ({ item: opponent }: { item: BackendOpponent }) => {
    const diff = getDiffStyle(opponent.difficulty)

    return (
      <TouchableOpacity
        style={styles.opponentCard}
        onPress={() => handleOpponentSelect(opponent)}
        activeOpacity={0.8}
      >
        <View style={styles.cardInner}>
          {/* Difficulty badge */}
          <View style={[styles.diffBadge, { backgroundColor: diff.glow, borderColor: diff.color + '50' }]}>
            <ThemedText style={[styles.diffText, { color: diff.color }]}>
              {opponent.difficulty?.toUpperCase()}
            </ThemedText>
          </View>

          {/* Opponent Name + Level */}
          <ThemedText style={styles.opponentName}>{opponent.name}</ThemedText>
          <View style={styles.levelRow}>
            <Ionicons name="paw" size={14} color={colors.primary} />
            <ThemedText style={styles.levelText}>Lv. {opponent.level} Pokémon</ThemedText>
          </View>

          {/* Description */}
          {opponent.description ? (
            <ThemedText style={styles.opponentDesc} numberOfLines={2}>
              {opponent.description}
            </ThemedText>
          ) : null}

          {/* Rewards row */}
          <View style={styles.rewardsRow}>
            <View style={styles.rewardChip}>
              <ThemedText style={styles.rewardVal}>{opponent.rewardXp || opponent.xpReward || 0}</ThemedText>
              <ThemedText style={styles.rewardLabel}>XP</ThemedText>
            </View>
            <View style={styles.rewardChip}>
              <ThemedText style={styles.rewardVal}>{opponent.rewardCoins || opponent.coinReward || 0}</ThemedText>
              <ThemedText style={styles.rewardLabel}>💰</ThemedText>
            </View>
          </View>

          {/* Challenge button */}
          <TouchableOpacity onPress={() => handleOpponentSelect(opponent)}>
            <LinearGradient
              colors={[...gradientPrimary]}
              style={styles.challengeBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.challengeBtnText}>Challenge</ThemedText>
              <Ionicons name="flash" size={16} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {battleName || 'Battle Selection'}
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <LoadingContainer message="Loading opponents..." />
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setIsLoading(true)
              setError(null)
              battleApi.listOpponents()
                .then(r => setOpponents(r.data))
                .catch(e => setError(e.message))
                .finally(() => setIsLoading(false))
            }}
          >
            <ThemedText style={styles.retryBtnText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={opponents}
          renderItem={renderOpponentCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
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
    borderRadius: 20,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    letterSpacing: -0.3,
    textAlign: 'center',
    flex: 1,
  },

  // ── List ──────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },

  // ── Opponent Card ─────────────────────────────────────────
  opponentCard: {
    marginBottom: spacing.lg,
  },
  cardInner: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  diffText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  opponentName: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  opponentDesc: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardVal: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  rewardLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  challengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.sm,
    shadowColor: 'rgba(68,216,241,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  challengeBtnText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
    letterSpacing: 0.5,
  },

  // ── Error ─────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
  },
  retryBtn: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  retryBtnText: {
    color: colors.onSecondary,
    fontFamily: fonts.bold,
    fontSize: fontSizes.span,
  },
})