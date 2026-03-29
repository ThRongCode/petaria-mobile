/**
 * Quest Screen — "Lapis Glassworks" redesign
 *
 * Shows daily quests with progress and claim functionality.
 * Design ref: desgin/quests_immersive/code.html
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { ScreenContainer } from '@/components/ScreenContainer'
import { LoadingContainer } from '@/components/ui'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers/game'
import { questApi, Quest } from '@/services/api/questApi'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientGold, gradientPrimary } from '@/themes/styles'

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  hunt: { icon: 'leaf', color: colors.success },
  battle: { icon: 'flash', color: '#FF5722' },
  care: { icon: 'heart', color: '#E91E63' },
  evolution: { icon: 'sparkles', color: colors.secondaryContainer },
  shop: { icon: 'cart', color: colors.info },
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: colors.success,
  normal: colors.info,
  hard: colors.warning,
}

export default function QuestScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const userProfile = useSelector(getUserProfile)

  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)

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

  useEffect(() => { fetchQuests() }, [fetchQuests])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchQuests()
  }, [fetchQuests])

  const handleClaim = async (quest: Quest) => {
    setClaimingId(quest.id)
    try {
      const response = await questApi.claimReward(quest.id)
      if (response.success && response.data) {
        let rewardsMessage = 'You received:\n'
        if (response.data.rewards.coins > 0) rewardsMessage += `💰 ${response.data.rewards.coins} Coins\n`
        if (response.data.rewards.gems > 0) rewardsMessage += `💎 ${response.data.rewards.gems} Gems\n`
        if (response.data.rewards.xp > 0) rewardsMessage += `⭐ ${response.data.rewards.xp} XP\n`
        if (response.data.rewards.item) rewardsMessage += `🎁 ${response.data.rewards.item.quantity}x ${response.data.rewards.item.item.name}\n`
        if (response.data.user?.leveledUp) rewardsMessage += `\n🎉 LEVEL UP! You are now Lv.${response.data.user.newLevel}!`

        Alert.alert('🎉 Rewards Claimed!', rewardsMessage, [{ text: 'Awesome!' }])
        fetchQuests()
        dispatch(gameActions.loadUserData())
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to claim reward')
    } finally {
      setClaimingId(null)
    }
  }

  const renderQuestCard = (quest: Quest) => {
    const isComplete = quest.status === 'completed'
    const isClaimed = quest.status === 'claimed'
    const progressPercent = Math.min((quest.progress / quest.targetCount) * 100, 100)
    const categoryConfig = CATEGORY_CONFIG[quest.category] || { icon: 'help', color: '#888' }

    return (
      <View key={quest.id} style={styles.questCard}>
        {/* Header */}
        <View style={styles.questHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryConfig.color + '20' }]}>
            <Ionicons name={categoryConfig.icon} size={20} color={categoryConfig.color} />
          </View>
          <View style={styles.questInfo}>
            <ThemedText style={styles.questCategory}>
              {quest.category.toUpperCase()} QUEST
            </ThemedText>
            <ThemedText style={styles.questName}>{quest.name}</ThemedText>
            <ThemedText style={styles.questDescription} numberOfLines={2}>
              {quest.description}
            </ThemedText>
          </View>
        </View>

        {/* Progress */}
        {!isClaimed && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <View style={styles.progressBadge}>
                <ThemedText style={styles.progressBadgeText}>
                  {isComplete ? 'COMPLETE' : 'IN PROGRESS'}
                </ThemedText>
              </View>
              <ThemedText style={styles.progressValue}>
                {quest.progress}/{quest.targetCount} ({Math.round(progressPercent)}%)
              </ThemedText>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                  isComplete && styles.progressFillComplete,
                ]}
              />
            </View>
          </View>
        )}

        {/* Rewards + Action */}
        <View style={styles.questFooter}>
          <View style={styles.rewardsList}>
            {quest.rewards.coins > 0 && (
              <View style={styles.rewardChip}>
                <ThemedText style={styles.rewardChipGold}>{quest.rewards.coins}</ThemedText>
                <Ionicons name="cash" size={14} color={colors.secondaryFixed} />
              </View>
            )}
            {quest.rewards.gems > 0 && (
              <View style={styles.rewardChip}>
                <ThemedText style={styles.rewardChipCyan}>{quest.rewards.gems}</ThemedText>
                <Ionicons name="diamond" size={14} color={colors.primary} />
              </View>
            )}
            {quest.rewards.xp > 0 && (
              <View style={styles.rewardChip}>
                <ThemedText style={styles.rewardChipCyan}>{quest.rewards.xp} XP</ThemedText>
              </View>
            )}
          </View>

          {isClaimed ? (
            <View style={styles.claimedBadge}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <ThemedText style={styles.claimedText}>Claimed</ThemedText>
            </View>
          ) : isComplete ? (
            <TouchableOpacity
              onPress={() => handleClaim(quest)}
              disabled={claimingId === quest.id}
            >
              <LinearGradient
                colors={[...gradientGold]}
                style={styles.claimBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {claimingId === quest.id ? (
                  <ActivityIndicator size="small" color={colors.onSecondary} />
                ) : (
                  <ThemedText style={styles.claimBtnText}>CLAIM</ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.inProgressLabel}>
              <ThemedText style={styles.inProgressText}>In Progress</ThemedText>
            </View>
          )}
        </View>
      </View>
    )
  }

  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const claimedQuests = quests.filter(q => q.status === 'claimed')

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <ThemedText style={styles.headerTitle}>Quest Log</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Complete tasks to earn artifacts and ascend.
            </ThemedText>
          </View>
        </View>

        {loading ? (
          <LoadingContainer message="Loading quests..." />
        ) : quests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color="rgba(255,255,255,0.2)" />
            <ThemedText style={styles.emptyText}>No quests available</ThemedText>
            <ThemedText style={styles.emptySubtext}>Check back tomorrow!</ThemedText>
          </View>
        ) : (
          <>
            {/* Ready to Claim */}
            {completedQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star" size={20} color={colors.secondaryFixed} />
                  <ThemedText style={styles.sectionTitle}>READY TO CLAIM</ThemedText>
                  <View style={styles.countBadge}>
                    <ThemedText style={styles.countBadgeText}>
                      {completedQuests.length} PENDING
                    </ThemedText>
                  </View>
                </View>
                {completedQuests.map(renderQuestCard)}
              </View>
            )}

            {/* In Progress */}
            {activeQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <ThemedText style={styles.sectionTitle}>IN PROGRESS</ThemedText>
                </View>
                {activeQuests.map(renderQuestCard)}
              </View>
            )}

            {/* Claimed */}
            {claimedQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <ThemedText style={styles.sectionTitle}>COMPLETED</ThemedText>
                </View>
                {claimedQuests.map(renderQuestCard)}
              </View>
            )}
          </>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },

  // ── Header ────────────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    fontSize: fontSizes.display,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },

  // ── Section ───────────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: 'rgba(255,219,60,0.20)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,219,60,0.30)',
  },
  countBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.secondaryFixed,
  },

  // ── Quest Card ────────────────────────────────────────────
  questCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  questHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  questInfo: { flex: 1, gap: 2 },
  questCategory: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  questName: {
    fontSize: fontSizes.large,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
  },
  questDescription: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // ── Progress ──────────────────────────────────────────────
  progressSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBadge: {
    backgroundColor: 'rgba(68,216,241,0.10)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  progressBadgeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  progressFillComplete: {
    backgroundColor: colors.secondaryFixed,
    shadowColor: colors.secondaryFixed,
  },

  // ── Footer ────────────────────────────────────────────────
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardsList: { flexDirection: 'row', gap: spacing.md },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  rewardChipGold: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.secondaryFixed },
  rewardChipCyan: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.primary },

  claimBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: 'center',
    shadowColor: 'rgba(255,225,109,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  claimBtnText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  claimedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  claimedText: { fontSize: fontSizes.span, fontFamily: fonts.semiBold, color: colors.success },
  inProgressLabel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  inProgressText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },

  // ── Empty State ───────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.outline,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.outlineVariant,
    marginTop: spacing.sm,
  },
})