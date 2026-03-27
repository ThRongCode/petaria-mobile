import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native'
import { TopBar, Panel, LoadingContainer } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { huntApi } from '@/services/api'
import { getPokemonImage } from '@/assets/images'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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
 * HuntScreen - Displays available hunting regions with API integration
 * Users can select regions to start hunting sessions
 */
export const HuntScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)

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
        console.log('✅ Found active hunt session:', result.data)
        setActiveSession(result.data)
      } else {
        setActiveSession(null)
      }
    } catch (error) {
      // Backend auto-completes sessions with 0 moves, so 404 is expected
      console.log('ℹ️ No active hunt session found')
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
    } catch (error) {
      console.error('Error loading regions:', error)
      setError(error instanceof Error ? error.message : 'Failed to load regions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  // Refresh active session when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      checkActiveSession()
    }, [])
  )

  const handleCancelSession = async () => {
    if (!activeSession) return

    Alert.alert(
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
              // Small delay to ensure backend processes the deletion
              await new Promise(resolve => setTimeout(resolve, 300))
              Alert.alert('Hunt Cancelled', 'Your hunt session has been cancelled.')
            } catch (error) {
              console.error('Error canceling session:', error)
              Alert.alert('Error', 'Failed to cancel hunt session')
            }
          }
        }
      ]
    )
  }

  const handleResumeHunt = () => {
    if (!activeSession) return
    
    router.push({
      pathname: '/hunting-session',
      params: {
        sessionId: activeSession.session.id,
        regionName: activeSession.session.region.name,
      }
    })
  }

  const handleStartHunt = (region: BackendRegion) => {
    // Check if user level meets requirement
    if (profile.level < region.unlockLevel) {
      Alert.alert('Locked', `This region requires level ${region.unlockLevel}`)
      return
    }

    // Check if there's an active session
    if (activeSession) {
      Alert.alert(
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
                // Small delay to ensure backend processes the deletion
                await new Promise(resolve => setTimeout(resolve, 300))
                // Navigate to new hunt
                router.push({
                  pathname: '/hunting-session',
                  params: {
                    regionId: region.id,
                    regionName: region.name,
                  }
                })
              } catch (error) {
                console.error('Error canceling session:', error)
                Alert.alert('Error', 'Failed to cancel current hunt')
              }
            }
          }
        ]
      )
      return
    }
    
    // Navigate to hunting session with region data
    router.push({
      pathname: '/hunting-session',
      params: {
        regionId: region.id,
        regionName: region.name,
      }
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '🌱'
      case 'Medium': return '⚡'
      case 'Hard': return '🔥'
      case 'Expert': return '💎'
      default: return '🗺️'
    }
  }

  const getRarityColor = (rarity: string) => {
    return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
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
          colors={['rgba(10, 14, 26, 0.4)', 'rgba(10, 14, 26, 0.85)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 0}
          pokeballs={profile.currency?.pokeballs || 0}
          
          
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <Panel variant="transparent" style={styles.headerPanel}>
            <ThemedText style={styles.headerTitle}>🗺️ Hunting Grounds</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Choose a region to hunt for wild Pokemon
            </ThemedText>
          </Panel>
        </View>

        {/* Events Banner */}
        <TouchableOpacity 
          style={styles.eventsBanner}
          onPress={() => router.push('/events')}
        >
          <LinearGradient
            colors={[colors.secondaryContainer, '#FFA000']}
            style={styles.eventsBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.eventsBannerContent}>
              <Ionicons name="sparkles" size={24} color={colors.onSecondary} />
              <View style={styles.eventsBannerText}>
                <ThemedText style={styles.eventsBannerTitle}>🎉 Events</ThemedText>
                <ThemedText style={styles.eventsBannerSubtitle}>Check out special hunts!</ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.onSecondary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Active Hunt Session Card */}
        {activeSession && (
          <View style={styles.activeHuntContainer}>
            <Panel variant="dark" style={styles.activeHuntPanel}>
              <View style={styles.activeHuntHeader}>
                <Ionicons name="walk" size={24} color={colors.success} />
                <ThemedText style={styles.activeHuntTitle}>
                  Active Hunt
                </ThemedText>
              </View>
              <View style={styles.activeHuntContent}>
                <ThemedText style={styles.activeHuntRegion}>
                  📍 {activeSession.session.region.name}
                </ThemedText>
                <ThemedText style={styles.activeHuntMoves}>
                  {activeSession.movesLeft} moves remaining
                </ThemedText>
              </View>
              <View style={styles.activeHuntButtons}>
                <TouchableOpacity
                  style={[styles.activeHuntButton, styles.resumeButton]}
                  onPress={handleResumeHunt}
                >
                  <Ionicons name="play" size={20} color="#FFF" />
                  <ThemedText style={styles.activeHuntButtonText}>
                    Resume
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.activeHuntButton, styles.cancelButton]}
                  onPress={handleCancelSession}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                  <ThemedText style={styles.activeHuntButtonText}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Panel>
          </View>
        )}

        {/* Loading State */}
        {(isLoading || checkingSession) && regions.length === 0 && (
          <LoadingContainer message="Loading regions..." color={colors.primary} />
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Panel variant="dark" style={styles.errorPanel}>
              <View style={styles.errorContent}>
                <Ionicons name="warning" size={24} color={colors.error} />
                <View style={styles.errorTextContainer}>
                  <ThemedText style={styles.errorTitle}>
                    Error Loading Regions
                  </ThemedText>
                  <ThemedText style={styles.errorMessage}>
                    {error}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity 
                onPress={loadRegions}
                style={styles.retryButton}
              >
                <ThemedText style={styles.retryButtonText}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </Panel>
          </View>
        )}

        {/* Regions Grid */}
        {!isLoading && regions.length > 0 && (
          <View style={styles.regionsContainer}>
            {regions.map((region) => {
              const isUnlocked = profile.level >= region.unlockLevel
              return (
                <TouchableOpacity
                  key={region.id}
                  onPress={() => handleStartHunt(region)}
                  disabled={!isUnlocked}
                  style={styles.regionCard}
                >
                  <Panel variant="dark" style={styles.regionPanel}>
                    {/* Region Header */}
                    <View style={styles.regionHeader}>
                      <View style={styles.regionTitleContainer}>
                        <ThemedText style={styles.regionIcon}>
                          {getDifficultyIcon(region.difficulty)}
                        </ThemedText>
                        <View style={styles.regionTitleText}>
                          <ThemedText style={styles.regionName}>{region.name}</ThemedText>
                          <View style={styles.difficultyBadge}>
                            <View 
                              style={[
                                styles.difficultyDot,
                                { backgroundColor: getDifficultyColor(region.difficulty) }
                              ]} 
                            />
                            <ThemedText style={styles.difficultyText}>
                              {region.difficulty}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      {!isUnlocked && (
                        <View style={styles.lockIcon}>
                          <Ionicons name="lock-closed" size={24} color={colors.secondaryContainer} />
                        </View>
                      )}
                    </View>

                    {/* Region Description */}
                    <ThemedText style={styles.regionDescription}>
                      {region.description}
                    </ThemedText>

                    {/* Region Stats */}
                    <View style={styles.regionStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="flash" size={16} color={colors.error} />
                        <ThemedText style={styles.statText}>
                          {region.energyCost} Energy
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="cash-outline" size={16} color={colors.secondaryContainer} />
                        <ThemedText style={styles.statText}>
                          {region.coinsCost} Coins
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="bar-chart" size={16} color={colors.success} />
                        <ThemedText style={styles.statText}>
                          Lv.{region.unlockLevel}+
                        </ThemedText>
                      </View>
                    </View>

                    {/* Featured Pokémon */}
                    {region.featuredSpawns && region.featuredSpawns.length > 0 && (
                      <View style={styles.featuredSection}>
                        <ThemedText style={styles.featuredTitle}>Featured Pokémon</ThemedText>
                        <View style={styles.featuredList}>
                          {region.featuredSpawns.slice(0, 4).map((spawn, idx) => (
                            <View key={idx} style={styles.featuredPokemon}>
                              <Image
                                source={getPokemonImage(spawn.species) as any}
                                style={styles.pokemonImage}
                                resizeMode="contain"
                              />
                              <ThemedText style={styles.pokemonName} numberOfLines={1}>
                                {spawn.species}
                              </ThemedText>
                              <View style={[styles.rarityDot, { backgroundColor: getRarityColor(spawn.rarity) }]} />
                            </View>
                          ))}
                        </View>
                        {/* Rare Spawns indicator */}
                        {region.rareSpawns && region.rareSpawns.length > 0 && (
                          <View style={styles.rareSpawnsRow}>
                            <Ionicons name="sparkles" size={14} color={colors.secondaryContainer} />
                            <ThemedText style={styles.rareSpawnsText}>
                              Rare: {region.rareSpawns.map(s => s.species).join(', ')}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Action Button */}
                    {isUnlocked ? (
                      <TouchableOpacity 
                        style={styles.huntButton}
                        onPress={() => handleStartHunt(region)}
                      >
                        <LinearGradient
                          colors={['rgba(68, 216, 241, 0.25)', 'rgba(0, 188, 212, 0.4)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.huntGradient}
                        >
                          <View style={styles.huntButtonBorder}>
                            <ThemedText style={styles.huntButtonText}>
                              Start Hunt
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.lockedButton}>
                        <ThemedText style={styles.lockedButtonText}>
                          Requires Level {region.unlockLevel}
                        </ThemedText>
                      </View>
                    )}
                  </Panel>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Info Panel */}
        {regions.length > 0 && (
          <Panel variant="dark" style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoTitle}>Hunt Tips</ThemedText>
                <ThemedText style={styles.infoDescription}>
                  • Higher difficulty regions have rarer Pokemon{'\n'}
                  • Energy regenerates over time{'\n'}
                  • Use berries to increase catch rate
                </ThemedText>
              </View>
            </View>
          </Panel>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['4xl'],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headerPanel: {
    padding: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  loadingContainer: {
    padding: spacing['4xl'],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    color: colors.onSurfaceVariant,
  },
  errorContainer: {
    padding: spacing.xl,
    margin: spacing.lg,
  },
  errorPanel: {
    padding: spacing.lg,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: colors.error,
    fontFamily: fonts.bold,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  retryButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(68, 216, 241, 0.15)',
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  regionsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  regionCard: {
    marginBottom: spacing.xs,
  },
  regionPanel: {
    padding: spacing.lg,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  regionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  regionIcon: {
    fontSize: 40,
  },
  regionTitleText: {
    flex: 1,
    gap: spacing.xs,
  },
  regionName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.semiBold,
  },
  lockIcon: {
    padding: spacing.xs,
  },
  regionDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  regionStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontFamily: fonts.semiBold,
  },
  featuredSection: {
    marginBottom: spacing.md,
  },
  featuredTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.outline,
    marginBottom: spacing.sm,
  },
  featuredList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featuredPokemon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 6,
    borderRadius: radii.sm,
    minWidth: 60,
  },
  pokemonImage: {
    width: 40,
    height: 40,
  },
  pokemonName: {
    fontSize: 9,
    color: colors.onSurface,
    fontFamily: fonts.semiBold,
    marginTop: 2,
    maxWidth: 55,
    textAlign: 'center',
  },
  rarityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  rareSpawnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  rareSpawnsText: {
    fontSize: 11,
    color: colors.secondaryContainer,
    fontFamily: fonts.semiBold,
    flex: 1,
  },
  huntButton: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  huntGradient: {
    padding: 2,
  },
  huntButtonBorder: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.sm,
  },
  huntButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  lockedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  lockedButtonText: {
    fontSize: 14,
    color: colors.outline,
    fontFamily: fonts.semiBold,
  },
  infoPanel: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  infoDescription: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  activeHuntContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  activeHuntPanel: {
    padding: spacing.lg,
  },
  activeHuntHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  activeHuntTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  activeHuntContent: {
    marginBottom: spacing.lg,
  },
  activeHuntRegion: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  activeHuntMoves: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  activeHuntButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  activeHuntButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    gap: 6,
  },
  resumeButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  activeHuntButtonText: {
    color: colors.onSurface,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  eventsBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  eventsBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  eventsBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventsBannerText: {
    gap: 2,
  },
  eventsBannerTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSecondary,
  },
  eventsBannerSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSecondary,
  },
})
