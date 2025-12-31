/**
 * Quest Screen
 * 
 * Shows daily quests with progress and claim functionality
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ImageBackground, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { Panel, TopBar } from '@/components/ui'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers/game'
import { questApi, Quest } from '@/services/api/questApi'
import Ionicons from '@expo/vector-icons/Ionicons'

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  hunt: { icon: 'leaf', color: '#4CAF50' },
  battle: { icon: 'flash', color: '#FF5722' },
  care: { icon: 'heart', color: '#E91E63' },
  evolution: { icon: 'sparkles', color: '#FFD700' },
  shop: { icon: 'cart', color: '#2196F3' },
}

// Difficulty colors
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  normal: '#2196F3',
  hard: '#FF9800',
}

export default function QuestScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const userProfile = useSelector(getUserProfile)
  
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  
  // Fetch quests
  const fetchQuests = useCallback(async () => {
    try {
      const response = await questApi.getQuests()
      if (response.success && response.data) {
        setQuests(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error)
      Alert.alert('Error', 'Failed to load quests')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])
  
  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchQuests()
  }, [fetchQuests])
  
  // Handle claim reward
  const handleClaim = async (quest: Quest) => {
    setClaimingId(quest.id)
    try {
      const response = await questApi.claimReward(quest.id)
      if (response.success && response.data) {
        Alert.alert(
          '🎉 Rewards Claimed!',
          `You received:\n` +
          (response.data.rewards.coins > 0 ? `💰 ${response.data.rewards.coins} Coins\n` : '') +
          (response.data.rewards.gems > 0 ? `💎 ${response.data.rewards.gems} Gems\n` : '') +
          (response.data.rewards.xp > 0 ? `⭐ ${response.data.rewards.xp} XP\n` : '') +
          (response.data.rewards.item ? `🎁 ${response.data.rewards.item.quantity}x ${response.data.rewards.item.item.name}` : ''),
          [{ text: 'Awesome!' }]
        )
        
        // Refresh quests and user data
        fetchQuests()
        dispatch(gameActions.loadUserData())
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to claim reward')
    } finally {
      setClaimingId(null)
    }
  }
  
  // Render quest card
  const renderQuestCard = (quest: Quest) => {
    const isComplete = quest.status === 'completed'
    const isClaimed = quest.status === 'claimed'
    const progressPercent = Math.min((quest.progress / quest.targetCount) * 100, 100)
    const categoryConfig = CATEGORY_CONFIG[quest.category] || { icon: 'help', color: '#888' }
    
    return (
      <Panel key={quest.id} variant="dark" style={styles.questCard}>
        <View style={styles.questHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '30' }]}>
            <Ionicons name={categoryConfig.icon} size={20} color={categoryConfig.color} />
          </View>
          
          <View style={styles.questInfo}>
            <ThemedText style={styles.questName}>{quest.name}</ThemedText>
            <ThemedText style={styles.questDescription}>{quest.description}</ThemedText>
          </View>
          
          <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[quest.difficulty] + '30' }]}>
            <ThemedText style={[styles.difficultyText, { color: DIFFICULTY_COLORS[quest.difficulty] }]}>
              {quest.difficulty.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>
            {quest.progress} / {quest.targetCount}
          </ThemedText>
        </View>
        
        {/* Rewards Row */}
        <View style={styles.rewardsRow}>
          <View style={styles.rewardsList}>
            {quest.rewards.coins > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="cash" size={16} color="#FFD700" />
                <ThemedText style={styles.rewardText}>{quest.rewards.coins}</ThemedText>
              </View>
            )}
            {quest.rewards.gems > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="diamond" size={16} color="#00BFFF" />
                <ThemedText style={styles.rewardText}>{quest.rewards.gems}</ThemedText>
              </View>
            )}
            {quest.rewards.xp > 0 && (
              <View style={styles.rewardItem}>
                <Ionicons name="star" size={16} color="#9C27B0" />
                <ThemedText style={styles.rewardText}>{quest.rewards.xp} XP</ThemedText>
              </View>
            )}
          </View>
          
          {/* Claim Button */}
          {isClaimed ? (
            <View style={styles.claimedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <ThemedText style={styles.claimedText}>Claimed</ThemedText>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => isComplete && handleClaim(quest)}
              disabled={!isComplete || claimingId === quest.id}
              style={styles.claimButtonContainer}
            >
              <LinearGradient
                colors={isComplete ? ['#FFD700', '#FFA000'] : ['#555', '#333']}
                style={styles.claimButton}
              >
                {claimingId === quest.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Ionicons 
                      name="gift" 
                      size={16} 
                      color={isComplete ? '#000' : '#888'} 
                    />
                    <ThemedText style={[styles.claimButtonText, !isComplete && styles.claimButtonTextDisabled]}>
                      {isComplete ? 'Claim' : 'In Progress'}
                    </ThemedText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Panel>
    )
  }
  
  // Separate quests by status
  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const claimedQuests = quests.filter(q => q.status === 'claimed')
  
  return (
    <ImageBackground 
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        username={userProfile?.username || 'Trainer'}
        coins={userProfile?.currency?.coins || 0}
        gems={userProfile?.currency?.gems || 0}
        pokeballs={userProfile?.currency?.pokeballs || 0}
        energy={80}
        maxEnergy={100}
        battleTickets={userProfile?.battleTickets}
        huntTickets={userProfile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Daily Quests</ThemedText>
          <View style={styles.placeholder} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <ThemedText style={styles.loadingText}>Loading quests...</ThemedText>
          </View>
        ) : quests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="rgba(255,255,255,0.3)" />
            <ThemedText style={styles.emptyText}>No quests available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Check back tomorrow!</ThemedText>
          </View>
        ) : (
          <>
            {/* Ready to Claim */}
            {completedQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="gift" size={20} color="#FFD700" />
                  <ThemedText style={styles.sectionTitle}>Ready to Claim!</ThemedText>
                </View>
                {completedQuests.map(renderQuestCard)}
              </View>
            )}
            
            {/* Active Quests */}
            {activeQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#2196F3" />
                  <ThemedText style={styles.sectionTitle}>In Progress</ThemedText>
                </View>
                {activeQuests.map(renderQuestCard)}
              </View>
            )}
            
            {/* Claimed Quests */}
            {claimedQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <ThemedText style={styles.sectionTitle}>Completed</ThemedText>
                </View>
                {claimedQuests.map(renderQuestCard)}
              </View>
            )}
          </>
        )}
        
        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  placeholder: {
    width: 40,
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
  
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Quest Card
  questCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
    marginRight: 8,
  },
  questName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Progress
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  
  // Rewards
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsList: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Claim Button
  claimButtonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  claimButtonTextDisabled: {
    color: '#888',
  },
  
  // Claimed Badge
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  claimedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
})
