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
import { Panel, TopBar, LoadingContainer } from '@/components/ui'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers/game'
import { questApi, Quest } from '@/services/api/questApi'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  hunt: { icon: 'leaf', color: colors.success },
  battle: { icon: 'flash', color: '#FF5722' },
  care: { icon: 'heart', color: '#E91E63' },
  evolution: { icon: 'sparkles', color: colors.secondaryContainer },
  shop: { icon: 'cart', color: colors.info },
}

// Difficulty colors
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: colors.success,
  normal: colors.info,
  hard: colors.warning,
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
        // Build rewards message
        let rewardsMessage = 'You received:\n'
        if (response.data.rewards.coins > 0) {
          rewardsMessage += `💰 ${response.data.rewards.coins} Coins\n`
        }
        if (response.data.rewards.gems > 0) {
          rewardsMessage += `💎 ${response.data.rewards.gems} Gems\n`
        }
        if (response.data.rewards.xp > 0) {
          rewardsMessage += `⭐ ${response.data.rewards.xp} XP\n`
        }
        if (response.data.rewards.item) {
          rewardsMessage += `🎁 ${response.data.rewards.item.quantity}x ${response.data.rewards.item.item.name}\n`
        }
        
        // Add level up notification if applicable
        if (response.data.user?.leveledUp) {
          rewardsMessage += `\n🎉 LEVEL UP! You are now Lv.${response.data.user.newLevel}!`
        }
        
        Alert.alert('🎉 Rewards Claimed!', rewardsMessage, [{ text: 'Awesome!' }])
        
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
                colors={isComplete ? [colors.secondaryContainer, colors.warning] : [colors.surfaceContainerHighest, colors.surfaceContainerHigh]}
                style={styles.claimButton}
              >
                {claimingId === quest.id ? (
                  <ActivityIndicator size="small" color={colors.surfaceContainerLowest} />
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
            tintColor={colors.secondaryContainer}
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
          <LoadingContainer message="Loading quests..." />
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
                  <Ionicons name="gift" size={20} color={colors.secondaryContainer} />
                  <ThemedText style={styles.sectionTitle}>Ready to Claim!</ThemedText>
                </View>
                {completedQuests.map(renderQuestCard)}
              </View>
            )}
            
            {/* Active Quests */}
            {activeQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color={colors.info} />
                  <ThemedText style={styles.sectionTitle}>In Progress</ThemedText>
                </View>
                {activeQuests.map(renderQuestCard)}
              </View>
            )}
            
            {/* Claimed Quests */}
            {claimedQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['5xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['5xl'],
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.outline,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.outlineVariant,
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  questCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  questInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  questName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  questDescription: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
    minWidth: 50,
    textAlign: 'right',
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  claimButtonContainer: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  claimButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSecondary,
  },
  claimButtonTextDisabled: {
    color: colors.outline,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  claimedText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
})
