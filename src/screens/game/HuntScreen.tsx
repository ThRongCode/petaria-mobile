import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Panel, LoadingContainer, useAlert, CurrencyBar } from '@/components/ui'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { huntApi } from '@/services/api'
import { getPokemonImage } from '@/assets/images'
import { backgrounds } from '@/assets/images/backgrounds'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import {
  spacing,
  radii,
  fontSizes,
  glowAmbient,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Spawn type for featured Pokémon
interface RegionSpawn {
  species: string
  rarity: string
  spawnRate: number
}

// Backend region type
interface BackendRegion {
  id: string
  name: string
  description: string
  difficulty: string
  energyCost: number
  coinsCost: number
  imageUrl: string
  unlockLevel: number
  locked?: boolean
  featuredSpawns?: RegionSpawn[]
  rareSpawns?: RegionSpawn[]
}

/**
 * HuntScreen — Immersive hunting grounds
 *
 * Layout (matches hunting_grounds_refined design):
 *   1. Background + overlay
 *   2. Hero heading "Hunting Grounds" + subtitle
 *   3. Special event banner (gradient CTA)
 *   4. Active hunt session card (if any)
 *   5. Region cards: icon box, name + difficulty badge, energy/coins stats,
 *      featured pokemon sprites, full-width gradient Start Hunt button
 *   6. Locked regions with blur overlay
 */
export const HuntScreen: React.FC = () => {
  const router = useRouter()
  const alert = useAlert()
  const profile = useSelector(getUserProfile)
  const insets = useSafeAreaInsets()

  // API state
  const [regions, setRegions] = useState<BackendRegion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<any>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check for active session
  const checkActiveSession = async () => {
    setCheckingSession(true)
    try {
      const result = await huntApi.getSession()
      if (result.success && result.data) {
        setActiveSession(result.data)
      } else {
        setActiveSession(null)
      }
    } catch {
      setActiveSession(null)
    } finally {
      setCheckingSession(false)
    }
  }

  // Load regions from API
  const loadRegions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await huntApi.getRegions()
      if (result.success && result.data) {
        setRegions(result.data)
      } else {
        throw new Error('Failed to load regions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load regions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      checkActiveSession()
    }, []),
  )

  const handleCancelSession = async () => {
    if (!activeSession) return
    alert.show(
      'Cancel Hunt?',
      'Are you sure you want to cancel your current hunt? You will lose all progress.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await huntApi.cancelSession(activeSession.session.id)
              setActiveSession(null)
              await new Promise(resolve => setTimeout(resolve, 300))
              alert.show('Hunt Cancelled', 'Your hunt session has been cancelled.')
            } catch {
              alert.show('Error', 'Failed to cancel hunt session')
            }
          },
        },
      ],
    )
  }

  const handleResumeHunt = () => {
    if (!activeSession) return
    router.push({
      pathname: '/hunting-session',
      params: {
        sessionId: activeSession.session.id,
        regionName: activeSession.session.region.name,
      },
    })
  }

  const handleStartHunt = (region: BackendRegion) => {
    if (profile.level < region.unlockLevel) {
      alert.show('Locked', `This region requires level ${region.unlockLevel}`)
      return
    }

    if (activeSession) {
      alert.show(
        'Active Hunt Detected',
        `You have an active hunt in ${activeSession.session.region.name}. Starting a new hunt will cancel your current progress.`,
        [
          { text: 'Resume Current', onPress: handleResumeHunt },
          {
            text: 'Cancel & Start New',
            style: 'destructive',
            onPress: async () => {
              try {
                await huntApi.cancelSession(activeSession.session.id)
                setActiveSession(null)
                await new Promise(resolve => setTimeout(resolve, 300))
                router.push({
                  pathname: '/hunting-session',
                  params: { regionId: region.id, regionName: region.name },
                })
              } catch {
                alert.show('Error', 'Failed to cancel current hunt')
              }
            },
          },
        ],
      )
      return
    }

    router.push({
      pathname: '/hunting-session',
      params: { regionId: region.id, regionName: region.name },
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success
      case 'Medium': return colors.warning
      case 'Hard': return colors.error
      case 'Expert': return '#9C27B0'
      default: return colors.onSurfaceVariant
    }
  }

  const getDifficultyIcon = (difficulty: string): any => {
    switch (difficulty) {
      case 'Easy': return 'leaf'
      case 'Medium': return 'flash'
      case 'Hard': return 'flame'
      case 'Expert': return 'diamond'
      default: return 'map'
    }
  }

  const getRarityColor = (rarity: string) => {
    return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
  }

  return (
    <ScreenContainer
      backgroundImage={backgrounds.huntingGrounds}
      backgroundOverlay
    >
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ HEADER BAR ════════════ */}
        <View style={s.headerBar}>
          <ThemedText style={s.headerTitle}>Hunting Grounds</ThemedText>
        </View>
        <View style={s.currencyRow}>
          <CurrencyBar coins={profile.currency?.coins} gems={profile.currency?.gems} />
        </View>

        {/* ════════════ EVENT BANNER ════════════ */}
        <TouchableOpacity
          style={s.eventBanner}
          onPress={() => router.push('/events')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryContainer + 'E6', colors.secondaryContainer + 'E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.eventGradient}
          >
            <View style={s.eventContent}>
              <View style={s.eventIconBox}>
                <Ionicons name="flash" size={28} color={colors.onPrimaryContainer} />
              </View>
              <View style={s.eventTextCol}>
                <ThemedText style={s.eventLabel}>LIMITED TIME EVENT</ThemedText>
                <ThemedText style={s.eventTitle}>Special Hunts Available!</ThemedText>
                <ThemedText style={s.eventDesc}>Increased rates for rare types!</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ════════════ ACTIVE HUNT SESSION ════════════ */}
        {activeSession && (
          <View style={s.sectionPad}>
            <Panel variant="glass" intensity="default" style={s.activePanel}>
              <View style={s.activeHeader}>
                <Ionicons name="walk" size={22} color={colors.success} />
                <ThemedText style={s.activeTitle}>Active Hunt</ThemedText>
              </View>
              <ThemedText style={s.activeRegion}>
                📍 {activeSession.session.region.name}
              </ThemedText>
              <ThemedText style={s.activeMoves}>
                {activeSession.movesLeft} moves remaining
              </ThemedText>
              <View style={s.activeBtnRow}>
                <TouchableOpacity style={s.resumeBtn} onPress={handleResumeHunt}>
                  <Ionicons name="play" size={18} color="#FFF" />
                  <ThemedText style={s.activeBtnText}>Resume</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelBtn} onPress={handleCancelSession}>
                  <Ionicons name="close" size={18} color="#FFF" />
                  <ThemedText style={s.activeBtnText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </Panel>
          </View>
        )}

        {/* ════════════ LOADING ════════════ */}
        {(isLoading || checkingSession) && regions.length === 0 && (
          <LoadingContainer message="Loading regions..." color={colors.primary} />
        )}

        {/* ════════════ ERROR ════════════ */}
        {error && (
          <View style={s.sectionPad}>
            <Panel variant="glass" intensity="subtle" style={s.errorPanel}>
              <View style={s.errorRow}>
                <Ionicons name="warning" size={22} color={colors.error} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={s.errorTitle}>Error Loading Regions</ThemedText>
                  <ThemedText style={s.errorMsg}>{error}</ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={loadRegions} style={s.retryBtn}>
                <ThemedText style={s.retryText}>Try Again</ThemedText>
              </TouchableOpacity>
            </Panel>
          </View>
        )}

        {/* ════════════ REGIONS LIST ════════════ */}
        {!isLoading && regions.length > 0 && (
          <View style={s.regionsList}>
            {regions.map((region) => {
              const isUnlocked = profile.level >= region.unlockLevel
              return (
                <TouchableOpacity
                  key={region.id}
                  onPress={() => handleStartHunt(region)}
                  disabled={!isUnlocked}
                  activeOpacity={0.85}
                >
                  <Panel variant="glass" intensity="default" style={s.regionCard}>
                    {/* Lock overlay */}
                    {!isUnlocked && (
                      <View style={s.lockOverlay}>
                        <Ionicons name="lock-closed" size={32} color={colors.onSurface} />
                        <ThemedText style={s.lockText}>
                          LOCKED: LEVEL {region.unlockLevel} REQUIRED
                        </ThemedText>
                      </View>
                    )}

                    {/* Region Header Row */}
                    <View style={[s.regionHeader, !isUnlocked && { opacity: 0.3 }]}>
                      <View style={[s.regionIconBox, { borderColor: getDifficultyColor(region.difficulty) + '66' }]}>
                        <Ionicons
                          name={getDifficultyIcon(region.difficulty)}
                          size={32}
                          color={getDifficultyColor(region.difficulty)}
                        />
                      </View>
                      <View style={s.regionInfo}>
                        <View style={s.regionNameRow}>
                          <ThemedText style={s.regionName}>{region.name}</ThemedText>
                          <View style={[s.diffBadge, { backgroundColor: getDifficultyColor(region.difficulty) + '30', borderColor: getDifficultyColor(region.difficulty) + '66' }]}>
                            <ThemedText style={[s.diffText, { color: getDifficultyColor(region.difficulty) }]}>
                              {region.difficulty.toUpperCase()}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={s.regionStatRow}>
                          <View style={s.regionStat}>
                            <Ionicons name="flash" size={14} color={colors.onSurfaceVariant} />
                            <ThemedText style={s.regionStatText}>{region.energyCost} Energy</ThemedText>
                          </View>
                          <View style={s.regionStat}>
                            <Ionicons name="cash-outline" size={14} color={colors.onSurfaceVariant} />
                            <ThemedText style={s.regionStatText}>{region.coinsCost} Coins</ThemedText>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Featured Pokémon */}
                    {isUnlocked && region.featuredSpawns && region.featuredSpawns.length > 0 && (
                      <View style={s.featuredSection}>
                        <ThemedText style={s.featuredLabel}>COMMON INHABITANTS</ThemedText>
                        <View style={s.featuredRow}>
                          {region.featuredSpawns.slice(0, 4).map((spawn, idx) => (
                            <View key={idx} style={s.spriteBox}>
                              <Image
                                source={getPokemonImage(spawn.species) as any}
                                style={s.spriteImg}
                                resizeMode="contain"
                              />
                            </View>
                          ))}
                        </View>
                        {region.rareSpawns && region.rareSpawns.length > 0 && (
                          <View style={s.rareRow}>
                            <Ionicons name="sparkles" size={14} color={colors.secondaryContainer} />
                            <ThemedText style={s.rareText}>
                              Rare: {region.rareSpawns.map(sp => sp.species).join(', ')}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Hunt Button */}
                    {isUnlocked && (
                      <TouchableOpacity
                        style={s.huntBtn}
                        onPress={() => handleStartHunt(region)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[colors.primary, colors.primaryContainer]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[s.huntGradient, glowAmbient]}
                        >
                          <ThemedText style={s.huntBtnText}>START HUNT</ThemedText>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </Panel>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },

  // ── Header Bar ────────────────────────────────────────────
  headerBar: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  currencyRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },

  // ── Event Banner ───────────────────────────────────────────
  eventBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  eventGradient: {
    padding: spacing.xl,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  eventIconBox: {
    width: 52,
    height: 52,
    borderRadius: radii.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  eventTextCol: { flex: 1, gap: 2 },
  eventLabel: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.extraBold,
    color: colors.onPrimaryContainer,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onPrimaryContainer,
  },
  eventDesc: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },

  // ── Sections ───────────────────────────────────────────────
  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },

  // ── Active Session ─────────────────────────────────────────
  activePanel: { padding: spacing.xl, gap: spacing.sm },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activeTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  activeRegion: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  activeMoves: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  activeBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  resumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radii.DEFAULT,
    backgroundColor: colors.success,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radii.DEFAULT,
    backgroundColor: colors.error,
  },
  activeBtnText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: '#FFF',
  },

  // ── Error ──────────────────────────────────────────────────
  errorPanel: { padding: spacing.xl },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorMsg: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  retryBtn: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(68, 216, 241, 0.15)',
    borderRadius: radii.DEFAULT,
    alignItems: 'center',
  },
  retryText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },

  // ── Regions List ───────────────────────────────────────────
  regionsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  regionCard: {
    padding: spacing.xl,
    gap: spacing.xl,
    overflow: 'hidden',
  },

  // ── Region Header ─────────────────────────────────────────
  regionHeader: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  regionIconBox: {
    width: 64,
    height: 64,
    borderRadius: radii.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  regionInfo: { flex: 1, gap: spacing.sm },
  regionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  regionName: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  diffBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  diffText: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  regionStatRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  regionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regionStatText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // ── Featured Pokémon ───────────────────────────────────────
  featuredSection: { gap: spacing.sm },
  featuredLabel: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featuredRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spriteBox: {
    width: 48,
    height: 48,
    borderRadius: radii.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
  },
  spriteImg: {
    width: '100%',
    height: '100%',
  },
  rareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  rareText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.secondaryContainer,
    flex: 1,
  },

  // ── Hunt Button ────────────────────────────────────────────
  huntBtn: {
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
  },
  huntGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.DEFAULT,
  },
  huntBtnText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
    letterSpacing: 1,
  },

  // ── Lock Overlay ───────────────────────────────────────────
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.xl,
    gap: spacing.sm,
  },
  lockText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})
