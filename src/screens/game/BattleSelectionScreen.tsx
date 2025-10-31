import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native'
import { TopBar, Panel, PokemonSelectionDialog } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile, getAllOpponents, getAllPets } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Opponent, Pet } from '@/stores/types/game'

/**
 * BattleSelectionScreen - Select opponent for specific battle type
 * Reuses opponent selection UI with battle type context
 */
export const BattleSelectionScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const profile = useSelector(getUserProfile)
  const allOpponents = getAllOpponents() as Opponent[]
  const pets = useSelector(getAllPets) as Pet[]
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null)
  const [showPokemonSelection, setShowPokemonSelection] = useState(false)

  const battleType = params.battleType as string
  const battleName = params.battleName as string

  // Filter opponents based on battle type (can be enhanced with API)
  const opponents = allOpponents

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

  const handleOpponentSelect = (opponent: Opponent) => {
    setSelectedOpponent(opponent)
    setShowPokemonSelection(true)
  }

  const handlePokemonSelect = (pet: Pet) => {
    if (selectedOpponent) {
      // Navigate to battle screen with battle type context
      router.push({
        pathname: '/battle-arena' as any,
        params: {
          playerPet: JSON.stringify(pet),
          opponent: JSON.stringify(selectedOpponent),
          battleType: battleType,
        },
      })
    }
    setShowPokemonSelection(false)
    setSelectedOpponent(null)
  }

  const renderOpponentCard = ({ item: opponent }: { item: Opponent }) => {
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
              source={opponent.image || getPokemonImage(opponent.species) as any}
              style={styles.opponentImage}
              resizeMode="contain"
            />
          </View>

          {/* Opponent Info */}
          <View style={styles.opponentInfo}>
            <ThemedText style={styles.opponentName}>{opponent.name}</ThemedText>
            <View style={styles.pokemonRow}>
              <Ionicons name="paw" size={14} color="rgba(255, 255, 255, 0.6)" />
              <ThemedText style={styles.pokemonName}>{opponent.species}</ThemedText>
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
                  {opponent.rewards.xp}
                </ThemedText>
                <ThemedText style={styles.rewardLabel}>XP</ThemedText>
              </View>
              <View style={styles.rewardItem}>
                <ThemedText style={styles.rewardValue}>
                  {opponent.rewards.coins}
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
          energy={80}
          maxEnergy={100}
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

        {/* Opponents Grid */}
        <FlatList
          data={opponents}
          renderItem={renderOpponentCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Pokemon Selection Dialog */}
      <PokemonSelectionDialog
        visible={showPokemonSelection}
        pets={pets}
        onSelect={handlePokemonSelect}
        onClose={() => {
          setShowPokemonSelection(false)
          setSelectedOpponent(null)
        }}
      />
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
})
