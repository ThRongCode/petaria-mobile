/**
 * Pet Details Screen
 * 
 * Full-screen detailed view of a pet with tabs for different information
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { Panel, TopBar } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { useSelector, useDispatch } from 'react-redux'
import { getAllPets, getUserProfile } from '@/stores/selectors'
import { Pet } from '@/stores/types/game'
import { petApi } from '@/services/api/petApi'
import { gameActions } from '@/stores/reducers/game'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  AboutTab,
  StatsTab,
  MovesTab,
  EvolutionsTab,
  EvolutionModal,
  EvolutionPath,
  EvolutionOptions,
} from './components/pet-details'

type TabType = 'about' | 'stats' | 'moves' | 'evolutions'

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
            dispatch(gameActions.loadUserData())
          }}]
        )
        
        setShowEvolutionModal(false)
        setSelectedEvolution(null)
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
        <EvolutionModal
          visible={showEvolutionModal}
          pet={pet}
          selectedEvolution={selectedEvolution}
          evolving={evolving}
          onClose={() => {
            setShowEvolutionModal(false)
            setSelectedEvolution(null)
          }}
          onEvolve={handleEvolve}
        />
      </ScrollView>
    </ImageBackground>
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
})
