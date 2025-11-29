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
import { TopBar, Panel, IconButton } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
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
 * HuntScreen Redesign - Modern UI for hunting Pokemon
 * Displays available regions with lock states and requirements
 */
export const HuntScreenNew: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)

  // API state
  const [regions, setRegions] = useState<BackendRegion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load regions from API
  const loadRegions = async () => {
    console.log('\n🗺️ ========== LOADING REGIONS ==========')
    console.log('📍 API Config useMock:', require('@/services/api/config').API_CONFIG.useMock)
    console.log('🌐 API URL:', require('@/services/api/config').API_CONFIG.baseURL)
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('📡 Calling huntApi.getRegions()...')
      const result = await huntApi.getRegions()
      console.log('📦 API Response:', JSON.stringify(result, null, 2))
      
      if (result.success && result.data) {
        console.log('✅ Loaded regions:', result.data.length)
        console.log('📋 Region names:', result.data.map(r => r.name).join(', '))
        setRegions(result.data)
      } else {
        throw new Error('Failed to load regions')
      }
    } catch (error) {
      console.error('❌ Error loading regions:', error)
      setError(error instanceof Error ? error.message : 'Failed to load regions')
      Alert.alert('Error', 'Failed to load regions from API')
    } finally {
      setIsLoading(false)
      console.log('🗺️ ========== LOAD COMPLETE ==========\n')
    }
  }

  // Refresh handler
  const handleRefresh = async () => {
    console.log('\n🔄 ========== REFRESH TRIGGERED ==========')
    setIsRefreshing(true)
    setError(null)
    
    try {
      console.log('📡 Refreshing regions from API...')
      const result = await huntApi.getRegions()
      console.log('📦 Refresh Response:', JSON.stringify(result, null, 2))
      
      if (result.success && result.data) {
        console.log('✅ Refreshed regions:', result.data.length)
        console.log('� Region names:', result.data.map(r => r.name).join(', '))
        setRegions(result.data)
        Alert.alert('Success', `Loaded ${result.data.length} regions from API`)
      } else {
        throw new Error('Failed to refresh regions')
      }
    } catch (error) {
      console.error('❌ Error refreshing:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh')
      Alert.alert('Error', 'Failed to refresh regions from API')
    } finally {
      setIsRefreshing(false)
      console.log('🔄 ========== REFRESH COMPLETE ==========\n')
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  const handleStartHunt = (region: BackendRegion) => {
    // Check if user level meets requirement
    if (profile.level < region.unlockLevel) {
      Alert.alert('Locked', `This region requires level ${region.unlockLevel}`)
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
      default: return '#999'
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
          energy={80}
          maxEnergy={100}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header Section */}
        <View style={styles.header}>
          <Panel variant="transparent" style={styles.headerPanel}>
            <View style={styles.headerTitleRow}>
              <View>
                <ThemedText style={styles.headerTitle}>🗺️ Hunting Grounds</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  Choose a region to hunt for wild Pokemon
                </ThemedText>
              </View>
              <TouchableOpacity 
                onPress={handleRefresh}
                disabled={isRefreshing}
                style={styles.refreshButton}
              >
                <Ionicons 
                  name="refresh" 
                  size={24} 
                  color={isRefreshing ? '#888' : '#4CAF50'} 
                />
                {isRefreshing && (
                  <ThemedText style={styles.refreshText}>Loading...</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Panel>
        </View>

        {/* Loading State */}
        {isLoading && regions.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={{ marginTop: 16, color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading regions...
            </ThemedText>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={{ padding: 20, margin: 16 }}>
            <Panel variant="dark" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="warning" size={24} color="#FF6B6B" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ color: '#FF6B6B', fontWeight: 'bold', marginBottom: 4 }}>
                    Error Loading Regions
                  </ThemedText>
                  <ThemedText style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                    {error}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleRefresh}
                style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                  borderRadius: 8,
                  alignItems: 'center'
                }}
              >
                <ThemedText style={{ color: '#4CAF50', fontWeight: '600' }}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </Panel>
          </View>
        )}

        {/* Regions Grid */}
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
                        {region.difficulty === 'Easy' ? '🌱' : 
                         region.difficulty === 'Medium' ? '⚡' : 
                         region.difficulty === 'Hard' ? '🔥' : 
                         region.difficulty === 'Expert' ? '💎' : '🗺️'}
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
                    <TouchableOpacity style={styles.huntButton}>
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

        {/* Info Panel */}
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
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  refreshText: {
    fontSize: 12,
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
  pokemonPreview: {
    marginBottom: 12,
  },
  pokemonPreviewLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  pokemonTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pokemonTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  pokemonTagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
})
