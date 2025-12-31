/**
 * Pet Details Screen
 * 
 * Full-screen detailed view of a pet with tabs for different information
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground, Modal, ActivityIndicator, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { Panel, TopBar, LoadingContainer } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { useSelector, useDispatch } from 'react-redux'
import { getAllPets, getUserProfile } from '@/stores/selectors'
import { Pet } from '@/stores/types/game'
import { petApi } from '@/services/api/petApi'
import { gameActions } from '@/stores/reducers/game'
import Ionicons from '@expo/vector-icons/Ionicons'

type TabType = 'about' | 'stats' | 'moves' | 'evolutions'

// Evolution types for API response
interface EvolutionPath {
  evolvesTo: string
  levelRequired: number
  itemRequired: string | null
  description?: string
  meetsLevelRequirement: boolean
  hasItem: boolean
  itemQuantity: number | null
  canEvolveNow: boolean
}

interface EvolutionOptions {
  petId: string
  species: string
  level: number
  canEvolve: boolean
  canEvolveNow: boolean
  currentStage: number
  maxStage: number
  evolvesFrom: string | null
  availableEvolutions: EvolutionPath[]
}

export default function PetDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useDispatch()
  const userProfile = useSelector(getUserProfile)
  const allPets = useSelector(getAllPets) as Pet[]
  
  // Find pet by ID from params
  const pet: Pet | undefined = useMemo(() => {
    const petId = params.petId
    if (petId) {
      return allPets.find(p => p.id.toString() === petId.toString())
    }
    return undefined
  }, [params.petId, allPets])
  
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Evolution state
  const [evolutionOptions, setEvolutionOptions] = useState<EvolutionOptions | null>(null)
  const [loadingEvolution, setLoadingEvolution] = useState(false)
  const [showEvolutionModal, setShowEvolutionModal] = useState(false)
  const [selectedEvolution, setSelectedEvolution] = useState<EvolutionPath | null>(null)
  const [evolving, setEvolving] = useState(false)
  
  // Fetch evolution options when tab changes to evolutions
  const fetchEvolutionOptions = useCallback(async () => {
    if (!pet) return
    
    setLoadingEvolution(true)
    try {
      const response = await petApi.getEvolutionOptions(pet.id)
      if (response.success && response.data) {
        setEvolutionOptions(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch evolution options:', error)
    } finally {
      setLoadingEvolution(false)
    }
  }, [pet])
  
  useEffect(() => {
    if (activeTab === 'evolutions' && pet) {
      fetchEvolutionOptions()
    }
  }, [activeTab, pet, fetchEvolutionOptions])
  
  // Handle evolution
  const handleEvolve = async (evolution: EvolutionPath, itemId: string) => {
    if (!pet) return
    
    setEvolving(true)
    try {
      const response = await petApi.evolvePet(pet.id, itemId)
      if (response.success && response.data) {
        // Show success alert with stat changes
        const { previousSpecies, newSpecies, statsChanged } = response.data
        
        Alert.alert(
          '🎉 Evolution Complete!',
          `${previousSpecies} evolved into ${newSpecies}!\n\n` +
          `📊 Stat Changes:\n` +
          `HP: ${statsChanged.maxHp.from} → ${statsChanged.maxHp.to}\n` +
          `Attack: ${statsChanged.attack.from} → ${statsChanged.attack.to}\n` +
          `Defense: ${statsChanged.defense.from} → ${statsChanged.defense.to}\n` +
          `Speed: ${statsChanged.speed.from} → ${statsChanged.speed.to}`,
          [{ text: 'Awesome!', onPress: () => {
            // Reload pets data
            dispatch(gameActions.loadUserData())
          }}]
        )
        
        setShowEvolutionModal(false)
        setSelectedEvolution(null)
        // Refresh evolution options
        fetchEvolutionOptions()
      }
    } catch (error: any) {
      Alert.alert('Evolution Failed', error?.message || 'Something went wrong')
    } finally {
      setEvolving(false)
    }
  }

  // If no pet found, show error
  if (!pet) {
    return (
      <ImageBackground 
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar
          username={userProfile?.username || 'Trainer'}
          coins={userProfile?.currency?.coins || 0}
          gems={userProfile?.currency?.gems || 0}
          
          
          battleTickets={userProfile?.battleTickets}
          huntTickets={userProfile?.huntTickets}
        />
        <View style={styles.errorContainer}>
          <Panel variant="dark" style={styles.errorPanel}>
            <ThemedText style={styles.errorTitle}>Unknown</ThemedText>
            <ThemedText style={styles.errorText}>No pet data available</ThemedText>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButtonContainer}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.backButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.backButtonText}>← Go Back</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </Panel>
        </View>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground 
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        username={userProfile?.username || 'Trainer'}
        coins={userProfile?.currency?.coins || 0}
        gems={userProfile?.currency?.gems || 0}
        pokeballs={userProfile?.currency?.pokeballs || 0}
        
        
        battleTickets={userProfile?.battleTickets}
        huntTickets={userProfile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Pet Header Card */}
        <Panel variant="dark" style={styles.headerPanel}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            
            <ThemedText style={styles.petId}>#{pet.id.toString().padStart(3, '0')}</ThemedText>
            
            <TouchableOpacity 
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.navButton}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={28} 
                color="#ff6b6b" 
              />
            </TouchableOpacity>
          </View>

          {/* Pet Image */}
          <View style={styles.imageContainer}>
            <Image
              source={getPokemonImage(pet.species) as any}
              style={styles.petImage}
              resizeMode="contain"
            />
          </View>

          {/* Pet Name and Level */}
          <View style={styles.petInfo}>
            <ThemedText style={styles.petName}>{pet.name}</ThemedText>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>Lv. {pet.level}</ThemedText>
            </View>
          </View>

          {/* Species */}
          <ThemedText style={styles.species}>{pet.species}</ThemedText>

          {/* HP Bar */}
          <View style={styles.hpSection}>
            <ThemedText style={styles.hpLabel}>HP</ThemedText>
            <View style={styles.hpBarBackground}>
              <View 
                style={[
                  styles.hpBarFill, 
                  { width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.hpText}>
              {pet.stats.hp} / {pet.stats.maxHp}
            </ThemedText>
          </View>

          {/* XP Bar */}
          <View style={styles.xpSection}>
            <ThemedText style={styles.xpLabel}>EXP</ThemedText>
            <View style={styles.xpBarBackground}>
              <View 
                style={[
                  styles.xpBarFill, 
                  { width: `${(pet.xp / pet.xpToNext) * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.xpText}>
              {pet.xp} / {pet.xpToNext}
            </ThemedText>
          </View>
        </Panel>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Stats
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'moves' && styles.activeTab]}
            onPress={() => setActiveTab('moves')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'moves' && styles.activeTabText]}>
              Moves
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'evolutions' && styles.activeTab]}
            onPress={() => setActiveTab('evolutions')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'evolutions' && styles.activeTabText]}>
              Evolutions
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'about' && <AboutTab pet={pet} />}
          {activeTab === 'stats' && <StatsTab pet={pet} />}
          {activeTab === 'moves' && <MovesTab pet={pet} />}
          {activeTab === 'evolutions' && (
            <EvolutionsTab 
              pet={pet} 
              evolutionOptions={evolutionOptions}
              loading={loadingEvolution}
              onEvolve={(evolution) => {
                setSelectedEvolution(evolution)
                setShowEvolutionModal(true)
              }}
            />
          )}
        </View>
        
        {/* Evolution Confirmation Modal */}
        <Modal
          visible={showEvolutionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEvolutionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Panel variant="dark" style={styles.modalPanel}>
              <ThemedText style={styles.modalTitle}>🌟 Evolve Pet?</ThemedText>
              
              {selectedEvolution && (
                <>
                  <View style={styles.evolutionPreview}>
                    <View style={styles.evolutionPetPreview}>
                      <Image
                        source={getPokemonImage(pet.species) as any}
                        style={styles.evolutionImage}
                        resizeMode="contain"
                      />
                      <ThemedText style={styles.evolutionPetName}>{pet.species}</ThemedText>
                    </View>
                    
                    <Ionicons name="arrow-forward" size={32} color="#FFD700" />
                    
                    <View style={styles.evolutionPetPreview}>
                      <Image
                        source={getPokemonImage(selectedEvolution.evolvesTo) as any}
                        style={styles.evolutionImage}
                        resizeMode="contain"
                      />
                      <ThemedText style={styles.evolutionPetName}>{selectedEvolution.evolvesTo}</ThemedText>
                    </View>
                  </View>
                  
                  {selectedEvolution.itemRequired && (
                    <View style={styles.itemCostRow}>
                      <Ionicons name="diamond" size={20} color="#9C27B0" />
                      <ThemedText style={styles.itemCostText}>
                        Will use 1x {selectedEvolution.itemRequired.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </View>
                  )}
                  
                  <ThemedText style={styles.modalDescription}>
                    This action cannot be undone. Your pet will transform into {selectedEvolution.evolvesTo} and gain new stats!
                  </ThemedText>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setShowEvolutionModal(false)
                        setSelectedEvolution(null)
                      }}
                      disabled={evolving}
                    >
                      <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalButton, styles.evolveButtonModal]}
                      onPress={() => handleEvolve(selectedEvolution, selectedEvolution.itemRequired || '')}
                      disabled={evolving}
                    >
                      {evolving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <ThemedText style={styles.evolveButtonText}>✨ Evolve!</ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Panel>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  )
}

// About Tab Component
const AboutTab: React.FC<{ pet: Pet }> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
    <ThemedText style={styles.description}>
      A powerful {pet.species} with incredible abilities. Known for its strength and loyalty in battles.
    </ThemedText>
    
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>⚔️ Attack</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.attack}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>🛡️ Defense</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.defense}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>⚡ Speed</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.speed}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>✨ Experience</ThemedText>
        <View style={styles.xpProgressContainer}>
          <View style={styles.xpProgressBar}>
            <View 
              style={[
                styles.xpProgressFill, 
                { width: `${(pet.xp / pet.xpToNext) * 100}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.xpProgressText}>
            {pet.xp} / {pet.xpToNext} XP
          </ThemedText>
        </View>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>🌟 Rarity</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.rarity}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>😊 Mood</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.mood}/100</ThemedText>
      </View>
    </View>
  </Panel>
)

// Stats Tab Component
const StatsTab: React.FC<{ pet: Pet }> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Base Stats</ThemedText>
    
    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>HP</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.hp / 200) * 100}%`, backgroundColor: '#4CAF50' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.hp}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Attack</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.attack / 200) * 100}%`, backgroundColor: '#FF5722' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.attack}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Defense</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.defense / 200) * 100}%`, backgroundColor: '#2196F3' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.defense}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Speed</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.speed / 200) * 100}%`, backgroundColor: '#FFC107' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.speed}</ThemedText>
    </View>
  </Panel>
)

// Moves Tab Component
const MovesTab: React.FC<{ pet: Pet }> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Known Moves</ThemedText>
    {pet.moves && pet.moves.length > 0 ? (
      pet.moves.map((move, index) => (
        <View key={index} style={styles.moveCard}>
          <View style={styles.moveHeader}>
            <ThemedText style={styles.moveName}>{move.name}</ThemedText>
            <View style={styles.movePpBadge}>
              <ThemedText style={styles.movePpText}>PP {move.pp}/{move.maxPp}</ThemedText>
            </View>
          </View>
          <View style={styles.moveStats}>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Power</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.power}</ThemedText>
            </View>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Accuracy</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.accuracy}%</ThemedText>
            </View>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Type</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.type}</ThemedText>
            </View>
          </View>
        </View>
      ))
    ) : (
      <ThemedText style={styles.emptyText}>No moves learned yet.</ThemedText>
    )}
  </Panel>
)

// Evolutions Tab Component
interface EvolutionsTabProps {
  pet: Pet
  evolutionOptions: EvolutionOptions | null
  loading: boolean
  onEvolve: (evolution: EvolutionPath) => void
}

const EvolutionsTab: React.FC<EvolutionsTabProps> = ({ pet, evolutionOptions, loading, onEvolve }) => {
  if (loading) {
    return (
      <Panel variant="dark" style={styles.tabPanel}>
        <LoadingContainer message="Loading evolution data..." />
      </Panel>
    )
  }

  const isFullyEvolved = pet.evolutionStage >= pet.maxEvolutionStage

  return (
    <Panel variant="dark" style={styles.tabPanel}>
      <ThemedText style={styles.sectionTitle}>Evolution Chain</ThemedText>
      
      {/* Current Evolution Status */}
      <View style={styles.evolutionStatusCard}>
        <View style={styles.evolutionStageIndicator}>
          {Array.from({ length: pet.maxEvolutionStage }).map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.stageDot,
                idx < pet.evolutionStage && styles.stageDotFilled,
                idx === pet.evolutionStage - 1 && styles.stageDotCurrent
              ]} 
            />
          ))}
        </View>
        <ThemedText style={styles.evolutionStageText}>
          Stage {pet.evolutionStage} of {pet.maxEvolutionStage}
        </ThemedText>
        {isFullyEvolved && (
          <View style={styles.fullyEvolvedBadge}>
            <ThemedText style={styles.fullyEvolvedText}>✨ Fully Evolved!</ThemedText>
          </View>
        )}
      </View>

      {/* Previous Evolution */}
      {evolutionOptions?.evolvesFrom && (
        <View style={styles.evolutionSection}>
          <ThemedText style={styles.evolutionSectionTitle}>Evolved From</ThemedText>
          <View style={styles.evolutionFromCard}>
            <Image
              source={getPokemonImage(evolutionOptions.evolvesFrom) as any}
              style={styles.evolutionThumb}
              resizeMode="contain"
            />
            <ThemedText style={styles.evolutionFromName}>{evolutionOptions.evolvesFrom}</ThemedText>
          </View>
        </View>
      )}

      {/* Available Evolutions */}
      {!isFullyEvolved && evolutionOptions?.availableEvolutions && evolutionOptions.availableEvolutions.length > 0 && (
        <View style={styles.evolutionSection}>
          <ThemedText style={styles.evolutionSectionTitle}>Available Evolutions</ThemedText>
          
          {evolutionOptions.availableEvolutions.map((evolution, idx) => {
            const canEvolve = evolution.canEvolveNow
            const levelMet = evolution.meetsLevelRequirement
            
            return (
              <View key={idx} style={styles.evolutionCard}>
                <View style={styles.evolutionCardHeader}>
                  <Image
                    source={getPokemonImage(evolution.evolvesTo) as any}
                    style={styles.evolutionThumb}
                    resizeMode="contain"
                  />
                  <View style={styles.evolutionCardInfo}>
                    <ThemedText style={styles.evolutionName}>{evolution.evolvesTo}</ThemedText>
                    {evolution.description && (
                      <ThemedText style={styles.evolutionDescription}>{evolution.description}</ThemedText>
                    )}
                  </View>
                </View>
                
                {/* Requirements */}
                <View style={styles.requirementsList}>
                  <View style={[styles.requirementRow, levelMet && styles.requirementMet]}>
                    <Ionicons 
                      name={levelMet ? "checkmark-circle" : "close-circle"} 
                      size={18} 
                      color={levelMet ? "#4CAF50" : "#FF5722"} 
                    />
                    <ThemedText style={[styles.requirementText, levelMet && styles.requirementTextMet]}>
                      Level {evolution.levelRequired} {levelMet ? '✓' : `(Current: ${pet.level})`}
                    </ThemedText>
                  </View>
                  
                  {evolution.itemRequired && (
                    <View style={[styles.requirementRow, evolution.hasItem && styles.requirementMet]}>
                      <Ionicons 
                        name={evolution.hasItem ? "checkmark-circle" : "close-circle"} 
                        size={18} 
                        color={evolution.hasItem ? "#4CAF50" : "#FF5722"} 
                      />
                      <ThemedText style={[styles.requirementText, evolution.hasItem && styles.requirementTextMet]}>
                        {evolution.itemRequired.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {evolution.hasItem 
                          ? ` ✓ (${evolution.itemQuantity} owned)` 
                          : ' (Not owned - buy in shop!)'}
                      </ThemedText>
                    </View>
                  )}
                </View>
                
                {/* Evolve Button */}
                <TouchableOpacity
                  style={[styles.evolveButton, !canEvolve && styles.evolveButtonDisabled]}
                  onPress={() => canEvolve && onEvolve(evolution)}
                  disabled={!canEvolve}
                >
                  <LinearGradient
                    colors={canEvolve ? ['#FFD700', '#FFA000'] : ['#555', '#333']}
                    style={styles.evolveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name="sparkles" 
                      size={18} 
                      color={canEvolve ? '#000' : '#888'} 
                    />
                    <ThemedText style={[styles.evolveButtonText, !canEvolve && styles.evolveButtonTextDisabled]}>
                      {canEvolve ? 'Evolve Now!' : 'Requirements Not Met'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      )}

      {/* No Evolutions Available */}
      {!isFullyEvolved && (!evolutionOptions?.availableEvolutions || evolutionOptions.availableEvolutions.length === 0) && (
        <View style={styles.noEvolutionContainer}>
          <Ionicons name="help-circle-outline" size={48} color="rgba(255,255,255,0.3)" />
          <ThemedText style={styles.noEvolutionText}>
            No evolution data available for this species.
          </ThemedText>
        </View>
      )}
    </Panel>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorPanel: {
    alignItems: 'center',
    padding: 32,
    width: '100%',
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  backButtonContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Header Panel
  headerPanel: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  species: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  hpSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    width: 30,
  },
  hpBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  hpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    minWidth: 80,
    textAlign: 'right',
  },
  xpSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    width: 30,
  },
  xpBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    minWidth: 80,
    textAlign: 'right',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  activeTabText: {
    color: '#fff',
  },

  // Content
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tabPanel: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },

  // About Tab
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpProgressContainer: {
    marginTop: 4,
    gap: 4,
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  xpProgressText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Stats Tab
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    width: 80,
  },
  statBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    width: 40,
    textAlign: 'right',
  },

  // Moves Tab
  moveCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moveName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  movePpBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  movePpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  moveStats: {
    flexDirection: 'row',
    gap: 12,
  },
  moveStatItem: {
    flex: 1,
  },
  moveStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  moveStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty State
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 24,
  },
  
  // Evolution Requirements (legacy)
  evolutionRequirements: {
    marginTop: 20,
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  
  // Evolution Status Card
  evolutionStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionStageIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  stageDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stageDotFilled: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stageDotCurrent: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  evolutionStageText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  fullyEvolvedBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  fullyEvolvedText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  // Evolution Section
  evolutionSection: {
    marginBottom: 20,
  },
  evolutionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Evolution From Card
  evolutionFromCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionFromName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Evolution Card
  evolutionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  evolutionThumb: {
    width: 60,
    height: 60,
  },
  evolutionCardInfo: {
    flex: 1,
  },
  evolutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  evolutionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  
  // Requirements
  requirementsList: {
    marginBottom: 12,
    gap: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,82,34,0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,82,34,0.3)',
  },
  requirementMet: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderColor: 'rgba(76,175,80,0.3)',
  },
  requirementText: {
    fontSize: 13,
    color: '#FF5722',
    flex: 1,
  },
  requirementTextMet: {
    color: '#4CAF50',
  },
  
  // Evolve Button
  evolveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  evolveButtonDisabled: {
    opacity: 0.7,
  },
  evolveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  evolveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  evolveButtonTextDisabled: {
    color: '#888',
  },
  
  // No Evolution
  noEvolutionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noEvolutionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  evolutionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  evolutionPetPreview: {
    alignItems: 'center',
  },
  evolutionImage: {
    width: 80,
    height: 80,
  },
  evolutionPetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  itemCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(156,39,176,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemCostText: {
    color: '#CE93D8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  evolveButtonModal: {
    backgroundColor: '#FFD700',
  },
})
