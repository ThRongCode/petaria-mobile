import React, { useState } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList 
} from 'react-native'
import { TopBar, Panel, PokemonSelectionDialog } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile, getAllOpponents, getAllPets } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import type { Opponent, Move, Pet } from '@/stores/types/game'

/**
 * BattleArenaScreenNew - Opponent selection screen with modern UI
 * Select opponent to battle with difficulty indicators
 */
export const BattleArenaScreenNew: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const opponents = getAllOpponents() as Opponent[]
  const pets = useSelector(getAllPets) as Pet[]
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null)
  const [showPokemonSelection, setShowPokemonSelection] = useState(false)

  const handleOpponentSelect = (opponent: Opponent) => {
    setSelectedOpponent(opponent)
    setShowPokemonSelection(true)
  }

  const handlePokemonSelect = (pet: Pet) => {
    if (selectedOpponent) {
      // Navigate to battle screen with both selections
      router.push({
        pathname: '/battle-arena',
        params: {
          playerPet: JSON.stringify(pet),
          opponent: JSON.stringify(selectedOpponent)
        }
      })
    }
    setShowPokemonSelection(false)
    setSelectedOpponent(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50'
      case 'medium': return '#FFA726'
      case 'hard': return '#F44336'
      case 'expert': return '#9C27B0'
      default: return '#999'
    }
  }

  const getDifficultyBadgeStyle = (difficulty: string) => {
    return {
      backgroundColor: getDifficultyColor(difficulty),
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }
  }

  const renderOpponentCard = ({ item: opponent }: { item: Opponent }) => {
    const isLocked = profile.level < opponent.unlockLevel
    const rewardCoins = opponent.rewards.coins
    const rewardExp = opponent.rewards.xp

    return (
      <View style={styles.opponentCard}>
        <Panel variant="dark" style={styles.opponentPanel}>
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={40} color="rgba(255, 255, 255, 0.8)" />
              <ThemedText style={styles.lockText}>
                Requires Level {opponent.unlockLevel}
              </ThemedText>
            </View>
          )}

          {/* Trainer Image */}
          <View style={styles.trainerContainer}>
            <View style={[styles.trainerImageWrapper, isLocked && styles.lockedImage]}>
              <Image 
                source={opponent.image as any}
                style={styles.trainerImage}
                resizeMode="contain"
              />
            </View>
            {/* Difficulty Badge */}
            <View style={getDifficultyBadgeStyle(opponent.difficulty)}>
              <ThemedText style={styles.difficultyText}>
                {opponent.difficulty.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {/* Opponent Info */}
          <View style={styles.opponentInfo}>
            <ThemedText style={[styles.opponentName, isLocked && styles.lockedText]}>
              {opponent.name}
            </ThemedText>
            <ThemedText style={[styles.opponentTitle, isLocked && styles.lockedText]}>
              Level {opponent.level} • {opponent.species}
            </ThemedText>

            {/* Moves Preview */}
            <View style={styles.pokemonPreview}>
              {opponent.moves.slice(0, 4).map((move: Move, index: number) => (
                <View key={index} style={styles.pokemonChip}>
                  <ThemedText style={styles.pokemonChipText}>
                    {move.name}
                  </ThemedText>
                </View>
              ))}
            </View>

            {/* Stats Display */}
            <View style={styles.recordContainer}>
              <View style={styles.recordStat}>
                <Ionicons name="heart" size={14} color="#F44336" />
                <ThemedText style={styles.recordText}>
                  HP: {opponent.stats.hp}
                </ThemedText>
              </View>
              <View style={styles.recordStat}>
                <Ionicons name="flash" size={14} color="#FFA726" />
                <ThemedText style={styles.recordText}>
                  ATK: {opponent.stats.attack}
                </ThemedText>
              </View>
            </View>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <ThemedText style={styles.rewardsLabel}>Rewards:</ThemedText>
              <View style={styles.rewardRow}>
                <View style={styles.rewardItem}>
                  <Ionicons name="logo-bitcoin" size={14} color="#FFD700" />
                  <ThemedText style={styles.rewardText}>{rewardCoins}</ThemedText>
                </View>
                <View style={styles.rewardItem}>
                  <Ionicons name="star" size={14} color="#9C27B0" />
                  <ThemedText style={styles.rewardText}>{rewardExp}</ThemedText>
                </View>
              </View>
            </View>

            {/* Battle Button */}
            {!isLocked ? (
              <TouchableOpacity
                style={styles.battleButton}
                onPress={() => handleOpponentSelect(opponent)}
              >
                <LinearGradient
                  colors={['#F44336', '#C62828']}
                  style={styles.battleGradient}
                >
                  <Ionicons name="flash" size={20} color="#fff" />
                  <ThemedText style={styles.battleButtonText}>BATTLE</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedButton}>
                <ThemedText style={styles.lockedButtonText}>LOCKED</ThemedText>
              </View>
            )}
          </View>
        </Panel>
      </View>
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
          <Panel variant="transparent" style={styles.headerPanel}>
            <ThemedText style={styles.headerTitle}>⚔️ Battle Arena</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Choose your opponent wisely
            </ThemedText>
          </Panel>
        </View>

        {/* Opponents List */}
        <FlatList
          data={opponents}
          renderItem={renderOpponentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
        title="Choose Your Pokemon"
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
    paddingTop: 8,
    marginBottom: 8,
  },
  headerPanel: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  opponentCard: {
    marginBottom: 16,
  },
  opponentPanel: {
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lockText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  trainerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  trainerImageWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trainerImage: {
    width: 120,
    height: 120,
  },
  lockedImage: {
    opacity: 0.3,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  opponentInfo: {
    gap: 8,
  },
  opponentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  opponentTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  lockedText: {
    opacity: 0.5,
  },
  pokemonPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 4,
  },
  pokemonChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  pokemonChipMore: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pokemonChipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  recordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  recordStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  rewardsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  rewardsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  battleButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  battleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  battleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  lockedButton: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  lockedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.3)',
  },
})
