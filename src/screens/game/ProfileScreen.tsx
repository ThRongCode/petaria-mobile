import React from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Alert
} from 'react-native'
import { TopBar, Panel } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { useAppDispatch } from '@/stores/store'
import { userActions, gameActions } from '@/stores/reducers'
import { userApi } from '@/services/api'
import { colors, fonts, spacing, radii } from '@/themes'

/**
 * ProfileScreen - Trainer profile with stats and achievements
 * Modern card-based layout for profile information
 */
export const ProfileScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('🚪 Logging out...')
            dispatch(userActions.logout())
          },
        },
      ]
    )
  }

  const handleAddBattleTickets = async () => {
    try {
      console.log('🎫 Adding battle tickets...')
      const response = await userApi.addBattleTickets()
      if (response.success) {
        Alert.alert('Success', response.data.message)
        // Reload user data to refresh tickets
        dispatch(gameActions.loadUserData())
      }
    } catch (error) {
      console.error('❌ Error adding battle tickets:', error)
      Alert.alert('Error', 'Failed to add battle tickets')
    }
  }

  const handleAddHuntTickets = async () => {
    try {
      console.log('🎫 Adding hunt tickets...')
      const response = await userApi.addHuntTickets()
      if (response.success) {
        Alert.alert('Success', response.data.message)
        // Reload user data to refresh tickets
        dispatch(gameActions.loadUserData())
      }
    } catch (error) {
      console.error('❌ Error adding hunt tickets:', error)
      Alert.alert('Error', 'Failed to add hunt tickets')
    }
  }

  const stats = [
    { label: 'Total Battles', value: profile.stats?.battlesWon || 0, icon: 'flame', color: colors.error },
    { label: 'Pokemon Caught', value: profile.stats?.petsOwned || 0, icon: 'cube', color: colors.success },
    { label: 'Pokeballs', value: profile.currency?.pokeballs || 0, icon: 'baseball', color: '#FF6B6B' },
    { label: 'Hunts Completed', value: profile.stats?.huntsCompleted || 0, icon: 'map', color: colors.primary },
  ]

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
        style={styles.content}
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
          onSettingsPress={() => {}}
        />

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <Panel variant="dark" style={styles.headerPanel}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={colors.onSurfaceVariant} />
              </View>
              <View style={styles.levelBadge}>
                <ThemedText style={styles.levelText}>Lv.{profile.level}</ThemedText>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.trainerName}>{profile.username}</ThemedText>
              <ThemedText style={styles.trainerId}>ID: {profile.id}</ThemedText>
              <ThemedText style={styles.trainerTitle}>Pokemon Trainer</ThemedText>
              
              {/* XP Progress */}
              <View style={styles.xpContainer}>
                <View style={styles.xpBarOuter}>
                  <LinearGradient
                    colors={[colors.primaryContainer, colors.primary]}
                    style={[styles.xpBarInner, { width: `${Math.min((profile.xp / profile.xpToNext) * 100, 100)}%` }]}
                  />
                </View>
                <ThemedText style={styles.xpText}>{profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP</ThemedText>
              </View>
            </View>
          </Panel>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📊 Statistics</ThemedText>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Panel variant="dark" style={styles.statPanel}>
                  <Ionicons 
                    name={stat.icon as any} 
                    size={32} 
                    color={stat.color} 
                  />
                  <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                  <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
                </Panel>
              </View>
            ))}
          </View>
        </View>

        {/* DEV Tools */}
        {__DEV__ && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>🛠️ Dev Tools</ThemedText>
            <View style={styles.devButtonsRow}>
              <TouchableOpacity style={styles.devButton} onPress={handleAddBattleTickets}>
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.3)', 'rgba(198, 40, 40, 0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.devGradient}
                >
                  <View style={styles.devButtonContent}>
                    <Ionicons name="shield" size={18} color="#FF6B6B" />
                    <ThemedText style={styles.devButtonText}>+5 Battle</ThemedText>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.devButton} onPress={handleAddHuntTickets}>
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.3)', 'rgba(56, 142, 60, 0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.devGradient}
                >
                  <View style={styles.devButtonContent}>
                    <Ionicons name="leaf" size={18} color="#4CAF50" />
                    <ThemedText style={styles.devButtonText}>+5 Hunt</ThemedText>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings' as any)}>
            <LinearGradient
              colors={['rgba(33, 150, 243, 0.3)', 'rgba(25, 118, 210, 0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <View style={styles.actionButtonBorder}>
                <Ionicons name="settings" size={20} color="#2196F3" />
                <ThemedText style={[styles.actionButtonText, { color: '#64B5F6' }]}>Settings</ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.3)', 'rgba(198, 40, 40, 0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <View style={styles.actionButtonBorder}>
                <Ionicons name="log-out" size={20} color="#F44336" />
                <ThemedText style={[styles.actionButtonText, { color: '#EF5350' }]}>Logout</ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerPanel: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  levelText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSecondaryContainer,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  trainerName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  trainerId: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  trainerTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    borderRadius: radii.sm,
  },
  xpText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
  },
  statPanel: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: spacing.md,
    borderRadius: radii.md,
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
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  devButton: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  devGradient: {
    padding: 2,
  },
  devButtonContent: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  devButtonText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})
