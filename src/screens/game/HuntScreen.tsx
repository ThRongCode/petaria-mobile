import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { TopBar, Panel } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { huntApi } from '@/services/api'

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
      case 'Easy': return '#4CAF50'
      case 'Medium': return '#FFA726'
      case 'Hard': return '#EF5350'
      case 'Expert': return '#9C27B0'
      default: return '#999'
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 150}
          pokeballs={profile.currency?.pokeballs || 0}
          energy={80}
          maxEnergy={100}
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

        {/* Active Hunt Session Card */}
        {activeSession && (
          <View style={styles.activeHuntContainer}>
            <Panel variant="dark" style={styles.activeHuntPanel}>
              <View style={styles.activeHuntHeader}>
                <Ionicons name="walk" size={24} color="#4CAF50" />
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>
              Loading regions...
            </ThemedText>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Panel variant="dark" style={styles.errorPanel}>
              <View style={styles.errorContent}>
                <Ionicons name="warning" size={24} color="#FF6B6B" />
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
                          <Ionicons name="lock-closed" size={24} color="#FFD700" />
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
                        <Ionicons name="flash" size={16} color="#FF6B6B" />
                        <ThemedText style={styles.statText}>
                          {region.energyCost} Energy
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="cash-outline" size={16} color="#FFD700" />
                        <ThemedText style={styles.statText}>
                          {region.coinsCost} Coins
                        </ThemedText>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="bar-chart" size={16} color="#4CAF50" />
                        <ThemedText style={styles.statText}>
                          Lv.{region.unlockLevel}+
                        </ThemedText>
                      </View>
                    </View>

                    {/* Action Button */}
                    {isUnlocked ? (
                      <TouchableOpacity 
                        style={styles.huntButton}
                        onPress={() => handleStartHunt(region)}
                      >
                        <LinearGradient
                          colors={['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.5)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.huntGradient}
                        >
                          <View style={styles.huntButtonBorder}>
                            <ThemedText style={styles.huntButtonText}>
                              Start Hunt
                            </ThemedText>
                            <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
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
              <Ionicons name="information-circle" size={24} color="#00BFFF" />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 8,
  },
  headerPanel: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    padding: 20,
    margin: 16,
  },
  errorPanel: {
    padding: 16,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  retryButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  regionsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  regionCard: {
    marginBottom: 4,
  },
  regionPanel: {
    padding: 16,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  regionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  regionIcon: {
    fontSize: 40,
  },
  regionTitleText: {
    flex: 1,
    gap: 4,
  },
  regionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  lockIcon: {
    padding: 4,
  },
  regionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    lineHeight: 20,
  },
  regionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  huntButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  huntGradient: {
    padding: 2,
  },
  huntButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  huntButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#66BB6A',
  },
  lockedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lockedButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  infoPanel: {
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  // Active Hunt Card Styles
  activeHuntContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activeHuntPanel: {
    padding: 16,
  },
  activeHuntHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activeHuntTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  activeHuntContent: {
    marginBottom: 16,
  },
  activeHuntRegion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activeHuntMoves: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeHuntButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  activeHuntButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  activeHuntButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
