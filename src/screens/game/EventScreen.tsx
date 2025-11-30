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
import { apiClient } from '@/services/api'

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
 */
export const EventScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const [loading, setLoading] = useState(false)

  // Battle types - can be fetched from API
  const battleTypes: BattleType[] = [
    {
      id: 'event',
      name: '⚡ Event Battle',
      description: 'Limited time event with exclusive rewards! Weekly rotating challenges.',
      icon: 'trophy',
      gradient: ['#FFD700', '#FFA500'],
      rewards: ['Rare Pokemon', 'Premium Items', 'Event Coins'],
      available: true,
      endDate: 'Ends in 3 days',
    },
    {
      id: 'exp',
      name: '📚 EXP Battle',
      description: 'Train your Pokemon and gain massive experience points!',
      icon: 'trending-up',
      gradient: ['#9C27B0', '#5E35B1'],
      rewards: ['High EXP', 'Rare Candy', 'Training Items'],
      available: true,
    },
    {
      id: 'material',
      name: '💎 Material Battle',
      description: 'Farm materials, gold, and evolution stones!',
      icon: 'diamond',
      gradient: ['#2196F3', '#1976D2'],
      rewards: ['Gold', 'Evolution Stones', 'Stat Boosters'],
      available: true,
    },
  ]

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
                  color={battleType.available ? '#FFD700' : '#999'} 
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
                    ? ['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.5)']
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
          {battleTypes.map(renderBattleCard)}
        </View>

        {/* Info Panel */}
        <Panel variant="dark" style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <ThemedText style={styles.infoTitle}>Battle Tips</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            • Event Battles refresh weekly with unique challenges
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • EXP Battles are perfect for leveling up your Pokemon
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Material Battles help you gather resources for evolution
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Higher difficulty opponents give better rewards!
          </ThemedText>
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
  },
  headerPanel: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  battleTypesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  battleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  battleGradient: {
    padding: 3,
  },
  battleContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 14,
    padding: 16,
    position: 'relative',
  },
  battleHeader: {
    marginBottom: 12,
  },
  battleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  battleTitleContainer: {
    flex: 1,
  },
  battleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  endDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  endDateText: {
    fontSize: 11,
    color: '#FF5252',
    fontWeight: '600',
  },
  battleDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 18,
  },
  rewardsSection: {
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
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
    gap: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  rewardText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  actionButtonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 2,
  },
  actionButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#66BB6A',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(158, 158, 158, 0.5)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
  },
  infoPanel: {
    margin: 16,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    lineHeight: 18,
  },
})
