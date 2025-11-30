import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { TopBar, Panel } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Opponent, Move } from '@/stores/types/game'
import { battleApi } from '@/services/api'

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
        return '#4CAF50'
      case 'medium':
        return '#FFA726'
      case 'hard':
        return '#F44336'
      case 'legendary':
        return '#9C27B0'
      default:
        return '#9E9E9E'
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
              <Ionicons name="paw" size={14} color="rgba(255, 255, 255, 0.6)" />
              <ThemedText style={styles.pokemonName}>
                {opponent.pets?.length || 0} Pokemon
              </ThemedText>
            </View>

            {/* Level */}
            <View style={styles.levelContainer}>
              <Ionicons name="trending-up" size={14} color="#FFD700" />
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
              colors={['rgba(244, 67, 54, 0.3)', 'rgba(198, 40, 40, 0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.battleGradient}
            >
              <View style={styles.battleButtonBorder}>
                <Ionicons name="flash" size={16} color="#EF5350" />
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
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 150}
          pokeballs={profile.currency?.pokeballs || 0}
          energy={80}
          maxEnergy={100}
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
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
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <ThemedText style={styles.loadingText}>Loading opponents...</ThemedText>
          </View>
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
    backgroundColor: '#000',
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
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  headerPanel: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  opponentCard: {
    flex: 1,
    marginBottom: 12,
  },
  opponentPanel: {
    padding: 12,
    position: 'relative',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  opponentImageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  pokemonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pokemonName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rewardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  battleButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  battleGradient: {
    padding: 2,
  },
  battleButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  battleButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF5350',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  opponentDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 4,
  },
})
