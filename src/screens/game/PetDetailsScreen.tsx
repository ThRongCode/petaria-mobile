/**
 * Pet Details Screen — "Lapis Glassworks" redesign
 *
 * Full-screen detailed view of a pet with glass tabs for different information.
 * Design ref: desgin/pet_details/code.html
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { ScreenContainer } from '@/components/ScreenContainer'
import { getPokemonImage } from '@/assets/images'
import { useSelector, useDispatch } from 'react-redux'
import { getAllPets, getUserProfile } from '@/stores/selectors'
import { Pet } from '@/stores/types/game'
import { petApi } from '@/services/api/petApi'
import { gameActions } from '@/stores/reducers/game'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'
import {
  AboutTab,
  StatsTab,
  MovesTab,
  EvolutionsTab,
  EvolutionModal,
  EvolutionPath,
  EvolutionOptions,
} from './components/pet-details'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PET_IMAGE_SIZE = SCREEN_WIDTH * 0.55

type TabType = 'about' | 'stats' | 'moves' | 'evolutions'

const TABS: { key: TabType; label: string }[] = [
  { key: 'about', label: 'ABOUT' },
  { key: 'stats', label: 'STATS' },
  { key: 'moves', label: 'MOVES' },
  { key: 'evolutions', label: 'EVO' },
]

export default function PetDetailsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const userProfile = useSelector(getUserProfile)
  const allPets = useSelector(getAllPets) as Pet[]

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
          [{ text: 'Awesome!', onPress: () => dispatch(gameActions.loadUserData()) }]
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

  // Error / not found
  if (!pet) {
    return (
      <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
        <View style={styles.errorContainer}>
          <View style={styles.errorPanel}>
            <ThemedText style={styles.errorTitle}>Unknown</ThemedText>
            <ThemedText style={styles.errorText}>No pet data available</ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <LinearGradient colors={[...gradientPrimary]} style={styles.errorBackBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <ThemedText style={styles.errorBackBtnText}>← Go Back</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    )
  }

  const hpPercent = pet.stats.maxHp > 0 ? (pet.stats.hp / pet.stats.maxHp) * 100 : 0
  const xpPercent = pet.xpToNext > 0 ? (pet.xp / pet.xpToNext) * 100 : 0

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Pet Details</ThemedText>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.headerBtn}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={colors.secondaryFixed}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroBadgeRow}>
            <View style={styles.idBadge}>
              <ThemedText style={styles.idText}>
                #{pet.id.toString().padStart(3, '0')}
              </ThemedText>
            </View>
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={getPokemonImage(pet.species) as any}
              style={styles.petImage}
              resizeMode="contain"
            />
          </View>

          <ThemedText style={styles.petName}>{pet.name}</ThemedText>

          <View style={styles.typeBadgeRow}>
            <View style={styles.typeBadgePrimary}>
              <ThemedText style={styles.typeBadgeText}>{pet.species}</ThemedText>
            </View>
          </View>
        </View>

        {/* Vital Stats (HP/XP) */}
        <View style={styles.vitalsCard}>
          <View style={styles.barSection}>
            <View style={styles.barLabelRow}>
              <ThemedText style={styles.barLabel}>HEALTH POINTS (HP)</ThemedText>
              <ThemedText style={styles.barValue}>
                {pet.stats.hp} <ThemedText style={styles.barValueDim}>/ {pet.stats.maxHp}</ThemedText>
              </ThemedText>
            </View>
            <View style={styles.barTrack}>
              <LinearGradient
                colors={[...gradientPrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${Math.min(hpPercent, 100)}%` }]}
              />
            </View>
          </View>

          <View style={styles.barSection}>
            <View style={styles.barLabelRow}>
              <ThemedText style={styles.barLabel}>EXPERIENCE (XP)</ThemedText>
              <ThemedText style={styles.barValue}>
                {pet.xp} <ThemedText style={styles.barValueDim}>/ {pet.xpToNext}</ThemedText>
              </ThemedText>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFillGold, { width: `${Math.min(xpPercent, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const active = activeTab === tab.key
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <ThemedText style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </ThemedText>
              </TouchableOpacity>
            )
          })}
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

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorPanel: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    width: '100%',
  },
  errorTitle: { fontSize: fontSizes.display, fontFamily: fonts.bold, color: colors.onSurface, marginBottom: spacing.md },
  errorText: { fontSize: fontSizes.body, fontFamily: fonts.regular, color: colors.onSurfaceVariant, marginBottom: spacing.xl },
  errorBackBtn: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg, borderRadius: radii.xl, alignItems: 'center' },
  errorBackBtnText: { fontSize: fontSizes.body, fontFamily: fonts.bold, color: colors.onPrimary },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerBtn: {
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
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // ── Scroll ────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },

  // ── Hero Card ─────────────────────────────────────────────
  heroCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(68, 216, 241, 0.10)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  idBadge: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  idText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: 'rgba(68, 216, 241, 0.20)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  imageContainer: {
    width: PET_IMAGE_SIZE,
    height: PET_IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImage: { width: '100%', height: '100%' },
  petName: {
    fontSize: fontSizes.display,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.5,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  typeBadgeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBadgePrimary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(68, 216, 241, 0.30)',
  },
  typeBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // ── Vitals Card ───────────────────────────────────────────
  vitalsCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  barSection: { gap: spacing.sm },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  barValue: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.onSurface },
  barValueDim: { color: colors.onSurfaceVariant },
  barTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.full,
    overflow: 'hidden',
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  barFill: { height: '100%', borderRadius: radii.full },
  barFillGold: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.secondaryFixed,
    shadowColor: 'rgba(255,225,109,0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // ── Tab Bar ───────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  tabActive: { backgroundColor: 'rgba(68, 216, 241, 0.10)' },
  tabText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabTextActive: { color: colors.primary },

  // ── Content ───────────────────────────────────────────────
  contentContainer: { paddingBottom: spacing.xl },
})