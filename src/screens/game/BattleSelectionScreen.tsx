import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native'
import { TopBar, Panel, LoadingContainer } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Opponent, Move } from '@/stores/types/game'
import { battleApi } from '@/services/api'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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

/**
 * BattleSelectionScreen - Select opponent for specific battle type
 * Reuses opponent selection UI with battle type context
 */
export const BattleSelectionScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const profile = useSelector(getUserProfile)
  
  const [opponents, setOpponents] = useState<BackendOpponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const battleType = params.battleType as string
  const battleName = params.battleName as string

  // Load opponents from API
  useEffect(() => {
    const loadOpponents = async () => {
      console.log('⚔️ Loading opponents from API...')
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await battleApi.listOpponents()
        console.log('✅ Loaded opponents:', result.data.length)
        setOpponents(result.data)
      } catch (error) {
        console.error('❌ Error loading opponents:', error)
        setError(error instanceof Error ? error.message : 'Failed to load opponents')
      } finally {
        setIsLoading(false)
      }
    }

    loadOpponents()
  }, [])

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return colors.success
      case 'medium':
        return colors.warning
      case 'hard':
        return colors.error
      case 'legendary':
        return '#9C27B0'
      default:
        return colors.onSurfaceVariant
    }
  }

  const handleOpponentSelect = (opponent: BackendOpponent) => {
    // Transform backend opponent moves structure: moves[].move -> moves[]
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
      }
    })) || []

    // Transform backend opponent to frontend Opponent type
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

    // Navigate to Pokemon selection screen
    router.push({
      pathname: '/pokemon-selection' as any,
      params: {
        opponent: JSON.stringify(transformedOpponent),
        battleType: battleType,
      },
    })
  }

  const renderOpponentCard = ({ item: opponent }: { item: BackendOpponent }) => {
    return (
      <TouchableOpacity
        style={styles.opponentCard}
        onPress={() => handleOpponentSelect(opponent)}
      >
        <Panel variant="dark" style={styles.opponentPanel}>
          {/* Difficulty Badge */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(opponent.difficulty) },
            ]}
          >
            <ThemedText style={styles.difficultyText}>
              {opponent.difficulty?.toUpperCase()}
            </ThemedText>
          </View>

          {/* Opponent Image */}
          <View style={styles.opponentImageContainer}>
            <Image
              source={opponent.species ? getPokemonImage(opponent.species) : { uri: opponent.imageUrl }}
              style={styles.opponentImage}
              resizeMode="contain"
            />
          </View>

          {/* Opponent Info */}
          <View style={styles.opponentInfo}>
            <ThemedText style={styles.opponentName}>{opponent.name}</ThemedText>
            <ThemedText style={styles.opponentDescription} numberOfLines={2}>
              {opponent.description}
            </ThemedText>
            <View style={styles.pokemonRow}>
              <Ionicons name="paw" size={14} color={colors.onSurfaceVariant} />
              <ThemedText style={styles.pokemonName}>
                {opponent.pets?.length || 0} Pokemon
              </ThemedText>
            </View>

            {/* Level */}
            <View style={styles.levelContainer}>
              <Ionicons name="trending-up" size={14} color={colors.secondaryContainer} />
              <ThemedText style={styles.levelText}>Lv.{opponent.level}</ThemedText>
            </View>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <ThemedText style={styles.rewardValue}>
                  {opponent.xpReward || opponent.rewardXp || 0}
                </ThemedText>
                <ThemedText style={styles.rewardLabel}>XP</ThemedText>
              </View>
              <View style={styles.rewardItem}>
                <ThemedText style={styles.rewardValue}>
                  {opponent.coinReward || opponent.rewardCoins || 0}
                </ThemedText>
                <ThemedText style={styles.rewardLabel}>💰</ThemedText>
              </View>
            </View>
          </View>

          {/* Battle Button */}
          <TouchableOpacity
            style={styles.battleButton}
            onPress={() => handleOpponentSelect(opponent)}
          >
            <LinearGradient
              colors={['rgba(68, 216, 241, 0.25)', 'rgba(0, 188, 212, 0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.battleGradient}
            >
              <View style={styles.battleButtonBorder}>
                <Ionicons name="flash" size={16} color={colors.primary} />
                <ThemedText style={styles.battleButtonText}>Challenge</ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Panel>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 14, 26, 0.4)', 'rgba(10, 14, 26, 0.85)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 0}
          pokeballs={profile.currency?.pokeballs || 0}
          
          
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Panel variant="transparent" style={styles.headerPanel}>
            <ThemedText style={styles.headerTitle}>{battleName || 'Select Opponent'}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Choose your opponent and prove your strength!
            </ThemedText>
          </Panel>
        </View>

        {/* Loading/Error States */}
        {isLoading ? (
          <LoadingContainer message="Loading opponents..." />
        ) : error ? (
          <View style={styles.centerContainer}>
            <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setIsLoading(true)
                setError(null)
                // Re-trigger useEffect by refreshing
              }}
            >
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          /* Opponents Grid */
          <FlatList
            data={opponents}
            renderItem={renderOpponentCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  headerPanel: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  gridRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  gridContent: {
    paddingBottom: spacing.xl,
  },
  opponentCard: {
    flex: 1,
    marginBottom: spacing.md,
  },
  opponentPanel: {
    padding: spacing.md,
    position: 'relative',
  },
  difficultyBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    zIndex: 10,
  },
  difficultyText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  opponentImageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  opponentImage: {
    width: 80,
    height: 80,
  },
  opponentInfo: {
    gap: 6,
  },
  opponentName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textAlign: 'center',
  },
  pokemonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pokemonName: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  levelText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondaryContainer,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  rewardLabel: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  battleButton: {
    marginTop: spacing.md,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  battleGradient: {
    padding: 2,
  },
  battleButtonBorder: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  battleButtonText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.onSurfaceVariant,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
  },
  retryButtonText: {
    color: colors.onSecondary,
    fontFamily: fonts.bold,
  },
  opponentDescription: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
})
