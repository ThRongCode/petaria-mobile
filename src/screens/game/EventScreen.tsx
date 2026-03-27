import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { TopBar, Panel } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { battleApi } from '@/services/api'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface BattleType {
  id: string
  name: string
  description: string
  icon: string
  gradient: string[]
  rewards: string[]
  available: boolean
  endDate?: string
}

/**
 * EventScreen - Main event hub with different battle types
 * Event Battles, EXP Battles, Material Battles
 * Battle types are loaded from the API
 */
export const EventScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const [loading, setLoading] = useState(true)
  const [battleTypes, setBattleTypes] = useState<BattleType[]>([])

  useEffect(() => {
    loadBattleTypes()
  }, [])

  const loadBattleTypes = async () => {
    try {
      setLoading(true)
      const response = await battleApi.getBattleTypes()
      if (response.success && response.data) {
        setBattleTypes(response.data)
      }
    } catch (error) {
      console.error('Failed to load battle types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBattleTypeSelect = (battleType: BattleType) => {
    router.push({
      pathname: '/battle-selection' as any,
      params: { 
        battleType: battleType.id,
        battleName: battleType.name,
      },
    })
  }

  const renderBattleCard = (battleType: BattleType) => {
    const gradientColors = battleType.available 
      ? [...battleType.gradient.map(c => c + 'DD'), ...battleType.gradient.map(c => c + '66')] as [string, string, ...string[]]
      : ['rgba(100, 100, 100, 0.3)', 'rgba(50, 50, 50, 0.3)'] as [string, string]
    
    return (
      <TouchableOpacity
        key={battleType.id}
        style={styles.battleCard}
        onPress={() => handleBattleTypeSelect(battleType)}
        disabled={!battleType.available}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.battleGradient}
        >
          <View style={styles.battleContent}>
            {/* Header */}
            <View style={styles.battleHeader}>
              <View style={styles.battleTitleRow}>
                <Ionicons 
                  name={battleType.icon as any} 
                  size={28} 
                  color={battleType.available ? colors.secondaryContainer : colors.outline} 
                />
                <View style={styles.battleTitleContainer}>
                  <ThemedText style={styles.battleTitle}>
                    {battleType.name}
                  </ThemedText>
                  {battleType.endDate && (
                    <View style={styles.endDateBadge}>
                      <Ionicons name="time" size={12} color="#FF5252" />
                      <ThemedText style={styles.endDateText}>
                        {battleType.endDate}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Description */}
            <ThemedText style={styles.battleDescription}>
              {battleType.description}
            </ThemedText>

            {/* Rewards */}
            <View style={styles.rewardsSection}>
              <ThemedText style={styles.rewardsTitle}>Rewards:</ThemedText>
              <View style={styles.rewardsList}>
                {battleType.rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardBadge}>
                    <Ionicons name="gift" size={12} color="#4CAF50" />
                    <ThemedText style={styles.rewardText}>{reward}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>
              <LinearGradient
                colors={
                  battleType.available
                    ? ['rgba(68, 216, 241, 0.25)', 'rgba(0, 188, 212, 0.4)']
                    : ['rgba(158, 158, 158, 0.3)', 'rgba(97, 97, 97, 0.5)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionButtonBorder}>
                  <ThemedText
                    style={[
                      styles.actionButtonText,
                      !battleType.available && styles.actionButtonTextDisabled,
                    ]}
                  >
                    {battleType.available ? 'Start Battle' : 'Coming Soon'}
                  </ThemedText>
                  {battleType.available && (
                    <Ionicons name="arrow-forward" size={16} color="#66BB6A" />
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Status Badge */}
            {!battleType.available && (
              <View style={styles.statusBadge}>
                <ThemedText style={styles.statusText}>LOCKED</ThemedText>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
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

        {/* Header */}
        <View style={styles.header}>
          <Panel variant="transparent" style={styles.headerPanel}>
            <ThemedText style={styles.headerTitle}>⚔️ Events</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Choose your battle type and challenge opponents!
            </ThemedText>
          </Panel>
        </View>

        {/* Battle Types */}
        <View style={styles.battleTypesContainer}>
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator color={colors.secondaryContainer} size="large" />
              <ThemedText style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>
                Loading battle types...
              </ThemedText>
            </View>
          ) : (
            battleTypes.map(renderBattleCard)
          )}
        </View>
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
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerPanel: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  battleTypesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  battleCard: {
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  battleGradient: {
    padding: 3,
  },
  battleContent: {
    backgroundColor: 'rgba(10, 14, 26, 0.7)',
    borderRadius: 14,
    padding: spacing.lg,
    position: 'relative',
  },
  battleHeader: {
    marginBottom: spacing.md,
  },
  battleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  battleTitleContainer: {
    flex: 1,
  },
  battleTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  endDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  endDateText: {
    fontSize: 11,
    color: colors.error,
    fontFamily: fonts.semiBold,
  },
  battleDescription: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  rewardsSection: {
    marginBottom: spacing.md,
  },
  rewardsTitle: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    marginBottom: 6,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(35, 193, 107, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(35, 193, 107, 0.25)',
  },
  rewardText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
  actionButtonContainer: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 2,
  },
  actionButtonBorder: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  actionButtonTextDisabled: {
    color: colors.outline,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(158, 158, 158, 0.4)',
  },
  statusText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.outline,
  },
})
