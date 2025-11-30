import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
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
import type { Pet, Opponent, Move } from '@/stores/types/game'
import { petApi } from '@/services/api'

/**
 * PokemonSelectionScreen - Select a Pokemon for battle
 * Loads available Pokemon from API and allows selection
 */
export default function PokemonSelectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const profile = useSelector(getUserProfile)
  
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // Parse opponent from params
  const opponent: Opponent | null = params.opponent 
    ? JSON.parse(params.opponent as string) 
    : null

  // Load user's pets from API
  useEffect(() => {
    const loadPets = async () => {
      console.log('🐾 Loading user pets from API...')
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await petApi.getUserPets()
        if (result.success && result.data) {
          // Transform backend pets to frontend Pet type
          const transformedPets = result.data.map((backendPet: any) => ({
            id: backendPet.id,
            name: backendPet.nickname || backendPet.species,
            species: backendPet.species,
            rarity: backendPet.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary',
            level: backendPet.level,
            xp: backendPet.xp,
            xpToNext: backendPet.level * 100,
            stats: {
              hp: backendPet.hp,
              maxHp: backendPet.maxHp,
              attack: backendPet.attack,
              defense: backendPet.defense,
              speed: backendPet.speed,
            },
            moves: backendPet.moves?.map((petMove: any) => ({
              id: petMove.move.id,
              name: petMove.move.name,
              type: petMove.move.type as 'Physical' | 'Special' | 'Status',
              element: petMove.move.element,
              power: petMove.move.power,
              accuracy: petMove.move.accuracy,
              pp: petMove.pp,
              maxPp: petMove.maxPp,
              description: petMove.move.description,
            })) || [],
            image: backendPet.species,
            evolutionStage: backendPet.evolutionStage,
            maxEvolutionStage: 3,
            isLegendary: backendPet.rarity === 'Legendary',
            ownerId: backendPet.ownerId,
            isForSale: backendPet.isForSale || false,
            mood: backendPet.mood,
            lastFed: backendPet.lastFed ? new Date(backendPet.lastFed).getTime() : Date.now(),
          }))
          
          setPets(transformedPets)
          console.log(`✅ Loaded ${transformedPets.length} pets`)
        }
      } catch (error) {
        console.error('❌ Error loading pets:', error)
        setError(error instanceof Error ? error.message : 'Failed to load pets')
      } finally {
        setIsLoading(false)
      }
    }

    loadPets()
  }, [])

  const handlePetSelect = (pet: Pet) => {
    if (!opponent) {
      Alert.alert('Error', 'No opponent selected')
      return
    }

    // Check if Pokemon has fainted (HP = 0)
    if (pet.stats.hp <= 0) {
      Alert.alert(
        'Pokemon Fainted!',
        `${pet.name} has fainted and cannot battle!\n\nVisit the Healing Center in the Home screen to restore your Pokemon.`,
        [{ text: 'OK' }]
      )
      return
    }

    // Check if user has enough battle tickets
    if (!profile || profile.battleTickets < 1) {
      Alert.alert(
        'Cannot Start Battle',
        'Not enough battle tickets (need 1, resets daily)',
        [{ text: 'OK' }]
      )
      return
    }

    // Navigate to battle screen
    router.push({
      pathname: '/battle-arena' as any,
      params: {
        playerPet: JSON.stringify(pet),
        opponent: params.opponent,
        battleType: params.battleType,
      },
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return '#9E9E9E'
      case 'rare':
        return '#2196F3'
      case 'epic':
        return '#9C27B0'
      case 'legendary':
        return '#FFD700'
      default:
        return '#9E9E9E'
    }
  }

  if (!opponent) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('@/assets/images/background/mobile_background.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.errorContainer}>
            <Panel variant="dark" style={styles.errorPanel}>
              <ThemedText style={styles.errorText}>No opponent selected</ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText style={styles.backText}>← Go Back</ThemedText>
              </TouchableOpacity>
            </Panel>
          </View>
        </ImageBackground>
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
            <ThemedText style={styles.headerTitle}>Choose Your Pokemon</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              vs {opponent.name}
            </ThemedText>
          </Panel>
        </View>

        {/* Pokemon List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <ThemedText style={styles.loadingText}>Loading your Pokemon...</ThemedText>
            </View>
          ) : error ? (
            <Panel variant="dark" style={styles.errorPanel}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </Panel>
          ) : pets.length === 0 ? (
            <Panel variant="dark" style={styles.errorPanel}>
              <ThemedText style={styles.errorText}>No Pokemon available</ThemedText>
            </Panel>
          ) : (
            <View style={styles.petsGrid}>
              {pets.map((pet) => {
                const isFainted = pet.stats.hp <= 0
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.petCard, isFainted && { opacity: 0.6 }]}
                    onPress={() => handlePetSelect(pet)}
                    disabled={isFainted}
                  >
                    <Panel variant="dark" style={styles.petPanel}>
                      {/* Fainted Overlay */}
                      {isFainted && (
                        <View style={styles.faintedOverlay}>
                          <Ionicons name="close-circle" size={40} color="#EF5350" />
                          <ThemedText style={styles.faintedText}>FAINTED</ThemedText>
                        </View>
                      )}
                      
                      {/* Level Badge */}
                      <View style={styles.levelBadge}>
                        <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
                      </View>

                      {/* Pokemon Image */}
                      <View style={styles.imageContainer}>
                        <Image
                          source={getPokemonImage(pet.species) as any}
                          style={[styles.petImage, isFainted && styles.petImageFainted]}
                          resizeMode="contain"
                        />
                      </View>

                    {/* Pet Info */}
                    <View style={styles.petInfo}>
                      <ThemedText style={styles.petName}>{pet.name}</ThemedText>
                      <ThemedText style={styles.petSpecies}>{pet.species}</ThemedText>

                      {/* HP Bar */}
                      <View style={styles.hpSection}>
                        <View style={styles.hpBarBackground}>
                          <View 
                            style={[
                              styles.hpBarFill, 
                              { width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%` }
                            ]} 
                          />
                        </View>
                        <ThemedText style={styles.hpText}>
                          {pet.stats.hp}/{pet.stats.maxHp}
                        </ThemedText>
                      </View>

                      {/* Stats Row */}
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Ionicons name="flash" size={12} color="#FF6B6B" />
                          <ThemedText style={styles.statText}>{pet.stats.attack}</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="shield" size={12} color="#4FC3F7" />
                          <ThemedText style={styles.statText}>{pet.stats.defense}</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="speedometer" size={12} color="#9C27B0" />
                          <ThemedText style={styles.statText}>{pet.stats.speed}</ThemedText>
                        </View>
                      </View>

                      {/* Select Button */}
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handlePetSelect(pet)}
                      >
                        <LinearGradient
                          colors={['#4CAF50', '#45a049']}
                          style={styles.selectGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <ThemedText style={styles.selectText}>Select</ThemedText>
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </Panel>
                </TouchableOpacity>
                )
              })}
            </View>
          )}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPanel: {
    flex: 1,
    padding: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorPanel: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  petCard: {
    width: '48%',
  },
  petPanel: {
    padding: 12,
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
    zIndex: 1,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  imageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  petImage: {
    width: 80,
    height: 80,
  },
  petInfo: {
    gap: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  petSpecies: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  hpSection: {
    gap: 4,
  },
  hpBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  hpText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectButton: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  selectText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  faintedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
  faintedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF5350',
    marginTop: 8,
  },
  petImageFainted: {
    opacity: 0.3,
  },
})
