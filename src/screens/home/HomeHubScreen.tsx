import React, { useState } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native'
import { TopBar, Panel, QuestPopup } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { apiClient } from '@/services/api/client'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, spacing, radii } from '@/themes'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * HomeHubScreen - Main dashboard/home screen
 * Central hub with quick access to all game features
 * Displays quests, events, and navigation
 */
export const HomeHubScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const profile = useSelector(getUserProfile)
  const [questPopupVisible, setQuestPopupVisible] = useState(false)
  const [healingLoading, setHealingLoading] = useState(false)
  const [lastHealTime, setLastHealTime] = useState<number | null>(null)

  const handleHealAllPets = async () => {
    const HEAL_COST = 200

    // Show confirmation popup
    Alert.alert(
      'Healing Center',
      `Heal all your Pokemon to full HP for ${HEAL_COST} coins?\n\nYour current balance: ${profile.currency?.coins || 0} coins`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Heal for 200 coins',
          style: 'default',
          onPress: async () => {
            try {
              setHealingLoading(true)
              const response = await apiClient.healAllPets()
              
              if (response.success && response.data) {
                const { healedCount, coinCost, coinsRemaining, message } = response.data
                setLastHealTime(Date.now())
                
                // Update coins in Redux store (only if coins were spent)
                if (coinCost > 0) {
                  dispatch(gameActions.updateProfile({
                    currency: { ...profile.currency, coins: coinsRemaining }
                  }))
                }
                
                // Reload all user data (pets HP, inventory, etc)
                dispatch(gameActions.loadUserData())
                
                // Show appropriate message based on whether healing was needed
                if (healedCount === 0) {
                  Alert.alert(
                    'All Healthy! 💚',
                    message || 'All Pokemon are already at full health',
                    [{ text: 'OK', style: 'default' }]
                  )
                } else {
                  Alert.alert(
                    'Healing Complete!',
                    `Successfully healed ${healedCount} Pokemon to full HP! ✨\n\nCoins spent: ${coinCost}\nRemaining: ${coinsRemaining}`,
                    [{ text: 'Great!', style: 'default' }]
                  )
                }
              } else {
                throw new Error(response.error?.message || 'Failed to heal Pokemon')
              }
            } catch (error) {
              console.error('Failed to heal Pokemon:', error)
              const errorMessage = error instanceof Error ? error.message : 'Unable to heal your Pokemon at this time'
              Alert.alert(
                'Healing Failed',
                errorMessage,
                [{ text: 'OK', style: 'cancel' }]
              )
            } finally {
              setHealingLoading(false)
            }
          },
        },
      ]
    )
  }

  const canHealToday = () => {
    if (!lastHealTime) return true
    const now = Date.now()
    const timeSinceLastHeal = now - lastHealTime
    const oneDay = 24 * 60 * 60 * 1000
    return timeSinceLastHeal >= oneDay
  }

  return (
    <View style={styles.container}>
      {/* Background with gradient overlay */}
      {/* Background */}
      <ImageBackground
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.8)']}
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
          onSettingsPress={() => router.push('/(app)/profile')}
        />

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Healing Center Section */}
          <Panel variant="dark" style={styles.healingCenterPanel}>
            <View style={styles.healingHeader}>
              <View style={styles.healingTitleRow}>
                <Ionicons name="heart" size={28} color="#FF6B9D" />
                <ThemedText style={styles.healingTitle}>Healing Center</ThemedText>
              </View>
              {lastHealTime && (
                <ThemedText style={styles.healingTimeText}>
                  Last healed: {new Date(lastHealTime).toLocaleTimeString()}
                </ThemedText>
              )}
            </View>
            
            <ThemedText style={styles.healingDescription}>
              Restore all your Pokemon to full health!
            </ThemedText>

            <TouchableOpacity
              style={[
                styles.healButton,
                healingLoading && styles.healButtonDisabled
              ]}
              onPress={handleHealAllPets}
              disabled={healingLoading}
            >
              <LinearGradient
                colors={
                  healingLoading
                    ? ['rgba(100,100,100,0.3)', 'rgba(60,60,60,0.3)']
                    : ['rgba(255,107,157,0.4)', 'rgba(147,51,234,0.4)']
                }
                style={styles.healButtonGradient}
              >
                {healingLoading ? (
                  <ActivityIndicator color={colors.onSurface} size="small" />
                ) : (
                  <>
                    <Ionicons name="heart-circle" size={24} color="#FFD700" />
                    <ThemedText style={styles.healButtonText}>
                      Heal All Pokemon (200 coins)
                    </ThemedText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Panel>

          {/* Quick Actions - Featured Buttons */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push('/(app)/hunt')}
            >
              <LinearGradient
                colors={['#2E7D32', '#1B5E20']}
                style={styles.featureGradient}
              >
                <ThemedText style={styles.featureTitle}>🌲 Hunt Pokemon</ThemedText>
                <ThemedText style={styles.featureSubtitle}>
                  Catch wild Pokemon in various regions
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push('/(app)/battle')}
            >
              <LinearGradient
                colors={['#C62828', '#8E0000']}
                style={styles.featureGradient}
              >
                <ThemedText style={styles.featureTitle}>⚔️ Battle Arena</ThemedText>
                <ThemedText style={styles.featureSubtitle}>
                  Challenge trainers and test your skills
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push('/shop')}
            >
              <LinearGradient
                colors={[colors.secondaryContainer, '#FF8F00']}
                style={styles.featureGradient}
              >
                <ThemedText style={styles.featureTitle}>🛒 Item Shop</ThemedText>
                <ThemedText style={styles.featureSubtitle}>
                  Purchase items and supplies
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Daily Quest Banner */}
          <TouchableOpacity 
            onPress={() => router.push('/quests')}
            style={styles.questBanner}
          >
            <Panel variant="dark" style={styles.questPanel}>
              <View style={styles.questContent}>
                <View style={styles.questTextContent}>
                  <ThemedText style={styles.questTitle}>
                    📋 Daily Quests
                  </ThemedText>
                  <ThemedText style={styles.questDescription}>
                    Complete quests to earn rewards!
                  </ThemedText>
                </View>
                <View style={styles.questArrow}>
                  <Ionicons name="chevron-forward" size={24} color={colors.secondaryContainer} />
                </View>
              </View>
            </Panel>
          </TouchableOpacity>

          {/* Events Banner */}
          <TouchableOpacity 
            onPress={() => router.push('/events')}
            style={styles.questBanner}
          >
            <LinearGradient
              colors={[colors.primaryContainer, colors.primary]}
              style={styles.eventsBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.questContent}>
                <View style={styles.questTextContent}>
                  <ThemedText style={styles.questTitle}>
                    🎉 Special Events
                  </ThemedText>
                  <ThemedText style={[styles.questDescription, { color: 'rgba(255,255,255,0.9)' }]}>
                    Time-limited hunts with rare Pokémon!
                  </ThemedText>
                </View>
                <View style={styles.questArrow}>
                  <Ionicons name="chevron-forward" size={24} color={colors.onPrimary} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quest Popup */}
      <QuestPopup
        visible={questPopupVisible}
        title="Daily Quest: Catch 3 Pokemon"
        progress={0}
        maxProgress={3}
        rewards={[
          { type: 'coins', amount: 5000 },
          { type: 'exp', amount: 100 },
        ]}
        onClaim={() => {
          setQuestPopupVisible(false)
          // TODO: Claim rewards logic
        }}
        onClose={() => setQuestPopupVisible(false)}
      />
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
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  // Healing Center
  healingCenterPanel: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.2)',
  },
  healingHeader: {
    marginBottom: spacing.md,
  },
  healingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  healingTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#FF6B9D',
  },
  healingTimeText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  healingDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  healButton: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  healButtonDisabled: {
    borderColor: colors.outlineVariant,
    opacity: 0.6,
  },
  healButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  healButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  healButtonTextDisabled: {
    color: colors.onSurfaceVariant,
  },
  cooldownText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    gap: spacing.md,
  },
  featureCard: {
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  featureGradient: {
    padding: spacing.xl,
  },
  featureTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  featureSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  questBanner: {
    marginVertical: spacing.sm,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  questPanel: {
    padding: spacing.lg,
  },
  questContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTextContent: {
    flex: 1,
  },
  questArrow: {
    marginLeft: spacing.md,
  },
  questTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  questDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  questProgress: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  questReward: {
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  rewardIcon: {
    fontSize: 24,
  },
  eventsBannerGradient: {
    padding: spacing.lg,
    borderRadius: radii.md,
  },
})
