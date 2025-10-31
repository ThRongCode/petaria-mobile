import React, { useState } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Dimensions 
} from 'react-native'
import { TopBar, Panel, IconButton, QuestPopup } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * HomeHubScreen - Main dashboard/home screen
 * Central hub with quick access to all game features
 * Displays quests, events, and navigation
 */
export const HomeHubScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const [questPopupVisible, setQuestPopupVisible] = useState(false)

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
          gems={profile.currency?.gems || 150}
          energy={80}
          maxEnergy={100}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Welcome Section */}
          <Panel variant="transparent" style={styles.welcomePanel}>
            <ThemedText style={styles.welcomeTitle}>
              Welcome, Trainer {profile.username}!
            </ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>
              Level {profile.level} • Ready for adventure
            </ThemedText>
          </Panel>

          {/* Quick Actions - Featured Buttons */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push('/(app)/hunt')}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
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
                colors={['#F44336', '#C62828']}
                style={styles.featureGradient}
              >
                <ThemedText style={styles.featureTitle}>⚔️ Battle Arena</ThemedText>
                <ThemedText style={styles.featureSubtitle}>
                  Challenge trainers and test your skills
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Daily Quest Banner */}
          <TouchableOpacity 
            onPress={() => setQuestPopupVisible(true)}
            style={styles.questBanner}
          >
            <Panel variant="dark" style={styles.questPanel}>
              <View style={styles.questContent}>
                <View>
                  <ThemedText style={styles.questTitle}>
                    📋 Daily Quest
                  </ThemedText>
                  <ThemedText style={styles.questDescription}>
                    Catch 3 Pokemon today
                  </ThemedText>
                  <ThemedText style={styles.questProgress}>
                    Progress: 0 / 3
                  </ThemedText>
                </View>
                <View style={styles.questReward}>
                  <ThemedText style={styles.rewardText}>+5000</ThemedText>
                  <ThemedText style={styles.rewardIcon}>💰</ThemedText>
                </View>
              </View>
            </Panel>
          </TouchableOpacity>

          {/* Navigation Grid */}
          <View style={styles.navigationGrid}>
            <IconButton
              icon="albums"
              label="Collection"
              onPress={() => router.push('/(app)/pets')}
            />
            <IconButton
              icon="trophy"
              label="Achievements"
              onPress={() => {}}
              locked={true}
            />
            <IconButton
              icon="people"
              label="Friends"
              onPress={() => {}}
              locked={true}
            />
            <IconButton
              icon="mail"
              label="Mail"
              onPress={() => {}}
              badge={3}
              locked={true}
            />
            <IconButton
              icon="gift"
              label="Shop"
              onPress={() => {}}
              locked={true}
            />
            <IconButton
              icon="newspaper"
              label="News"
              onPress={() => {}}
              locked={true}
            />
          </View>

          {/* Stats Overview */}
          <Panel variant="dark" style={styles.statsPanel}>
            <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.stats?.petsOwned || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Pokemon</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.stats?.battlesWon || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Battles Won</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.level}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Trainer Level</ThemedText>
              </View>
            </View>
          </Panel>
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  welcomePanel: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickActionsContainer: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  featureGradient: {
    padding: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  questBanner: {
    marginVertical: 8,
  },
  questPanel: {
    padding: 16,
  },
  questContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  questProgress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  questReward: {
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rewardIcon: {
    fontSize: 24,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
    paddingVertical: 8,
  },
  statsPanel: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})
