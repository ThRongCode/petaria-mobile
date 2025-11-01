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
import { userActions } from '@/stores/reducers'

/**
 * ProfileScreenNew - Trainer profile with stats and achievements
 * Modern card-based layout for profile information
 */
export const ProfileScreenNew: React.FC = () => {
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

  const stats = [
    { label: 'Total Battles', value: profile.stats?.battlesWon || 0, icon: 'flame', color: '#F44336' },
    { label: 'Pokemon Caught', value: profile.stats?.petsOwned || 0, icon: 'pokeball', color: '#4CAF50' },
    { label: 'Hunts Completed', value: profile.stats?.huntsCompleted || 0, icon: 'map', color: '#2196F3' },
    { label: 'Days Active', value: 42, icon: 'calendar', color: '#9C27B0' },
  ]

  const achievements = [
    { id: 1, title: 'First Catch', desc: 'Caught your first Pokemon', icon: '🎯', unlocked: true },
    { id: 2, title: 'Battle Master', desc: 'Won 10 battles', icon: '⚔️', unlocked: true },
    { id: 3, title: 'Collector', desc: 'Caught 25 Pokemon', icon: '📚', unlocked: false },
    { id: 4, title: 'Legendary Hunter', desc: 'Caught a legendary', icon: '👑', unlocked: false },
  ]

  const badges = [
    { name: 'Boulder', acquired: true, icon: '🪨' },
    { name: 'Cascade', acquired: true, icon: '💧' },
    { name: 'Thunder', acquired: false, icon: '⚡' },
    { name: 'Rainbow', acquired: false, icon: '🌈' },
    { name: 'Soul', acquired: false, icon: '👻' },
    { name: 'Marsh', acquired: false, icon: '☠️' },
    { name: 'Volcano', acquired: false, icon: '🌋' },
    { name: 'Earth', acquired: false, icon: '🌍' },
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
          gems={profile.currency?.gems || 150}
          energy={80}
          maxEnergy={100}
          onSettingsPress={() => {}}
        />

        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <Panel variant="dark" style={styles.headerPanel}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="rgba(255, 255, 255, 0.5)" />
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
                    colors={['#9C27B0', '#673AB7']}
                    style={[styles.xpBarInner, { width: '65%' }]}
                  />
                </View>
                <ThemedText style={styles.xpText}>6,500 / 10,000 XP</ThemedText>
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

        {/* Badges */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🏆 Gym Badges</ThemedText>
          <Panel variant="dark" style={styles.badgesPanel}>
            <View style={styles.badgesGrid}>
              {badges.map((badge, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.badgeItem,
                    !badge.acquired && styles.badgeItemLocked
                  ]}
                >
                  <View 
                    style={[
                      styles.badgeCircle,
                      badge.acquired && styles.badgeCircleAcquired
                    ]}
                  >
                    <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                  </View>
                  <ThemedText 
                    style={[
                      styles.badgeName,
                      !badge.acquired && styles.badgeNameLocked
                    ]}
                  >
                    {badge.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Panel>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎖️ Achievements</ThemedText>
          {achievements.map((achievement) => (
            <View 
              key={achievement.id}
              style={!achievement.unlocked && styles.achievementLocked}
            >
              <Panel variant="dark" style={styles.achievementPanel}>
                <View style={styles.achievementContent}>
                  <View 
                    style={[
                      styles.achievementIcon,
                      achievement.unlocked && styles.achievementIconUnlocked
                    ]}
                  >
                    <ThemedText style={styles.achievementEmoji}>
                      {achievement.icon}
                    </ThemedText>
                  </View>
                  <View style={styles.achievementText}>
                    <ThemedText 
                      style={[
                        styles.achievementTitle,
                        !achievement.unlocked && styles.textLocked
                      ]}
                    >
                      {achievement.title}
                    </ThemedText>
                    <ThemedText 
                      style={[
                        styles.achievementDesc,
                        !achievement.unlocked && styles.textLocked
                      ]}
                    >
                      {achievement.desc}
                    </ThemedText>
                  </View>
                  {achievement.unlocked && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                  {!achievement.unlocked && (
                    <Ionicons name="lock-closed" size={24} color="rgba(255, 255, 255, 0.3)" />
                  )}
                </View>
              </Panel>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  headerPanel: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trainerId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  trainerTitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 12,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  xpBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statPanel: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  badgesPanel: {
    padding: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    width: '22%',
  },
  badgeItemLocked: {
    opacity: 0.4,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeCircleAcquired: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  badgeNameLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  achievementPanel: {
    padding: 16,
    marginBottom: 12,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textLocked: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 2,
  },
  actionButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})
