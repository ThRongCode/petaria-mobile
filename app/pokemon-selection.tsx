/**
 * Pokemon Selection Screen — "Lapis Glassworks" redesign
 *
 * Select a Pokemon for battle. Loads available Pokemon from API.
 * Design ref: desgin/pok_mon_selection/code.html
 */

import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { ThemedText } from '@/components'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Pet, Opponent } from '@/stores/types/game'
import { petApi } from '@/services/api'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

export default function PokemonSelectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)

  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const opponent: Opponent | null = params.opponent
    ? JSON.parse(params.opponent as string)
    : null

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await petApi.getUserPets()
        if (result.success && result.data) {
          const transformedPets = result.data.map((bp: any) => ({
            id: bp.id,
            name: bp.nickname || bp.species,
            species: bp.species,
            rarity: bp.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary',
            level: bp.level,
            xp: bp.xp,
            xpToNext: bp.level * 100,
            stats: { hp: bp.hp, maxHp: bp.maxHp, attack: bp.attack, defense: bp.defense, speed: bp.speed },
            moves: bp.moves?.map((pm: any) => ({
              id: pm.move.id,
              name: pm.move.name,
              type: pm.move.type as 'Physical' | 'Special' | 'Status',
              element: pm.move.element,
              power: pm.move.power,
              accuracy: pm.move.accuracy,
              pp: pm.pp,
              maxPp: pm.maxPp,
              description: pm.move.description,
            })) || [],
            image: bp.species,
            evolutionStage: bp.evolutionStage,
            maxEvolutionStage: 3,
            isLegendary: bp.rarity === 'Legendary',
            ownerId: bp.ownerId,
            isForSale: bp.isForSale || false,
            mood: bp.mood,
            lastFed: bp.lastFed ? new Date(bp.lastFed).getTime() : Date.now(),
          }))
          setPets(transformedPets)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pets')
      } finally {
        setIsLoading(false)
      }
    }
    loadPets()
  }, [])

  const handlePetSelect = (pet: Pet) => {
    if (!opponent) { Alert.alert('Error', 'No opponent selected'); return }
    if (pet.stats.hp <= 0) {
      Alert.alert('Pokemon Fainted!', `${pet.name} has fainted and cannot battle!`, [{ text: 'OK' }])
      return
    }
    if (!profile || profile.battleTickets < 1) {
      Alert.alert('Cannot Start Battle', 'Not enough battle tickets (need 1, resets daily)', [{ text: 'OK' }])
      return
    }
    router.push({
      pathname: '/battle-arena' as any,
      params: { playerPet: JSON.stringify(pet), opponent: params.opponent, battleType: params.battleType },
    })
  }

  if (!opponent) {
    return (
      <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
        <View style={styles.errorContainer}>
          <View style={styles.errorPanel}>
            <ThemedText style={styles.errorText}>No opponent selected</ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={styles.backText}>← Go Back</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle}>Choose Your Pokémon</ThemedText>
          <ThemedText style={styles.headerSubtitle}>vs {opponent.name}</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading your Pokemon...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorPanel}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : pets.length === 0 ? (
          <View style={styles.errorPanel}>
            <ThemedText style={styles.errorText}>No Pokemon available</ThemedText>
          </View>
        ) : (
          <View style={styles.petsGrid}>
            {pets.map(pet => {
              const isFainted = pet.stats.hp <= 0
              const hpPct = pet.stats.maxHp > 0 ? (pet.stats.hp / pet.stats.maxHp) * 100 : 0
              const hpColor = hpPct > 50 ? colors.primary : hpPct > 25 ? colors.secondaryFixed : colors.error

              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petCard, isFainted && { opacity: 0.5 }]}
                  onPress={() => handlePetSelect(pet)}
                  disabled={isFainted}
                  activeOpacity={0.8}
                >
                  <View style={styles.petCardInner}>
                    {/* Fainted overlay */}
                    {isFainted && (
                      <View style={styles.faintedOverlay}>
                        <Ionicons name="close-circle" size={36} color={colors.error} />
                        <ThemedText style={styles.faintedText}>FAINTED</ThemedText>
                      </View>
                    )}

                    {/* Level badge */}
                    <View style={styles.levelBadge}>
                      <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
                    </View>

                    {/* Image */}
                    <View style={styles.imageWrap}>
                      <Image
                        source={getPokemonImage(pet.species) as any}
                        style={[styles.petImage, isFainted && { opacity: 0.3 }]}
                        resizeMode="contain"
                      />
                    </View>

                    {/* Info */}
                    <ThemedText style={styles.petName} numberOfLines={1}>{pet.name}</ThemedText>
                    <ThemedText style={styles.petSpecies}>{pet.species}</ThemedText>

                    {/* HP bar */}
                    <View style={styles.hpTrack}>
                      <View style={[styles.hpFill, { width: `${hpPct}%`, backgroundColor: hpColor }]} />
                    </View>
                    <ThemedText style={styles.hpText}>{pet.stats.hp}/{pet.stats.maxHp}</ThemedText>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="flash" size={11} color="#FFA726" />
                        <ThemedText style={styles.statVal}>{pet.stats.attack}</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="shield" size={11} color={colors.primary} />
                        <ThemedText style={styles.statVal}>{pet.stats.defense}</ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="speedometer" size={11} color="#9C27B0" />
                        <ThemedText style={styles.statVal}>{pet.stats.speed}</ThemedText>
                      </View>
                    </View>

                    {/* Select button */}
                    <TouchableOpacity onPress={() => handlePetSelect(pet)} disabled={isFainted}>
                      <LinearGradient
                        colors={[...gradientPrimary]}
                        style={styles.selectBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <ThemedText style={styles.selectBtnText}>Select</ThemedText>
                        <Ionicons name="checkmark-circle" size={16} color={colors.onPrimary} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
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
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },

  // ── Scroll ────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },

  // ── Grid ──────────────────────────────────────────────────
  petsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  petCard: { width: '47.5%' },
  petCardInner: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Level Badge ───────────────────────────────────────────
  levelBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(68,216,241,0.20)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
    zIndex: 1,
  },
  levelText: { fontSize: fontSizes.xs, fontFamily: fonts.bold, color: colors.primary },

  // ── Image ─────────────────────────────────────────────────
  imageWrap: { height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  petImage: { width: 72, height: 72 },

  // ── Info ──────────────────────────────────────────────────
  petName: { fontSize: fontSizes.body, fontFamily: fonts.bold, color: colors.onSurface, textAlign: 'center' },
  petSpecies: { fontSize: fontSizes.xs, fontFamily: fonts.regular, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: spacing.xs },

  // ── HP Bar ────────────────────────────────────────────────
  hpTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hpFill: { height: '100%', borderRadius: radii.full },
  hpText: { fontSize: fontSizes.xs, fontFamily: fonts.semiBold, color: colors.onSurfaceVariant, textAlign: 'center' },

  // ── Stats ─────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingVertical: spacing.xs },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statVal: { fontSize: fontSizes.xs, fontFamily: fonts.bold, color: colors.onSurface },

  // ── Select Button ─────────────────────────────────────────
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    width: '100%',
    marginTop: spacing.xs,
    shadowColor: 'rgba(68,216,241,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  selectBtnText: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.onPrimary },

  // ── Fainted ───────────────────────────────────────────────
  faintedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,14,26,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: radii.xl,
  },
  faintedText: { fontSize: fontSizes.large, fontFamily: fonts.bold, color: colors.error, marginTop: spacing.xs },

  // ── States ────────────────────────────────────────────────
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: spacing.md },
  loadingText: { fontSize: fontSizes.body, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errorPanel: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: { fontSize: fontSizes.body, fontFamily: fonts.regular, color: colors.onSurfaceVariant, textAlign: 'center' },
  backText: { fontSize: fontSizes.body, fontFamily: fonts.bold, color: colors.primary },
})