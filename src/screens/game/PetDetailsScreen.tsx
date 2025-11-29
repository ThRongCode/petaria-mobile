/**
 * Pet Details Screen
 * 
 * Full-screen detailed view of a pet with tabs for different information
 */

import React, { useState, useMemo } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { Panel, TopBar } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { useSelector } from 'react-redux'
import { getAllPets, getUserProfile } from '@/stores/selectors'
import { Pet } from '@/stores/types/game'
import Ionicons from '@expo/vector-icons/Ionicons'

type TabType = 'about' | 'stats' | 'moves' | 'evolutions'

export default function PetDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
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
          energy={80}
          maxEnergy={100}
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
        energy={80}
        maxEnergy={100}
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
          {activeTab === 'evolutions' && <EvolutionsTab pet={pet} />}
        </View>
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
const EvolutionsTab: React.FC<{ pet: Pet }> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Evolution Chain</ThemedText>
    
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>Current Stage</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.evolutionStage}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>Max Stage</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.maxEvolutionStage}</ThemedText>
      </View>
    </View>

    {pet.evolutionRequirements && (
      <View style={styles.evolutionRequirements}>
        <ThemedText style={styles.sectionTitle}>Evolution Requirements</ThemedText>
        <ThemedText style={styles.description}>
          Level {pet.evolutionRequirements.level} required
        </ThemedText>
      </View>
    )}

    {pet.evolutionStage >= pet.maxEvolutionStage && (
      <ThemedText style={styles.emptyText}>✨ Fully Evolved!</ThemedText>
    )}
  </Panel>
)

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
  
  // Evolution Requirements
  evolutionRequirements: {
    marginTop: 20,
  },
})
