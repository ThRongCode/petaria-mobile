import React from 'react'
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from './Panel'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, fonts, spacing, radii } from '@/themes'

interface QuestReward {
  type: 'coins' | 'gems' | 'exp' | 'item'
  amount: number
  icon?: keyof typeof Ionicons.glyphMap
}

interface QuestPopupProps {
  visible: boolean
  title: string
  progress: number
  maxProgress: number
  rewards: QuestReward[]
  onClaim: () => void
  onClose: () => void
}

/**
 * QuestPopup - Modal for displaying quest completion and rewards
 * Shows quest title, progress, and claimable rewards
 */
export const QuestPopup: React.FC<QuestPopupProps> = ({
  visible,
  title,
  progress,
  maxProgress,
  rewards,
  onClaim,
  onClose,
}) => {
  const isComplete = progress >= maxProgress

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Panel variant="dark" style={styles.popup}>
          {/* Title */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Rewards */}
          <View style={styles.rewardsContainer}>
            {rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <Panel variant="dark" style={styles.rewardPanel}>
                  <Ionicons
                    name={getRewardIcon(reward.type)}
                    size={32}
                    color={getRewardColor(reward.type)}
                  />
                  <ThemedText style={styles.rewardAmount}>
                    {reward.amount}
                  </ThemedText>
                </Panel>
              </View>
            ))}
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <ThemedText style={styles.progressText}>
              達成度 {progress} / {maxProgress}
            </ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(progress / maxProgress) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Claim Button */}
          <TouchableOpacity
            onPress={onClaim}
            disabled={!isComplete}
            style={styles.claimButton}
          >
            <LinearGradient
              colors={isComplete ? [colors.primaryContainer, colors.primary] : [colors.surfaceContainerHighest, colors.surfaceContainerHigh]}
              style={styles.claimGradient}
            >
              <ThemedText style={styles.claimText}>
                {isComplete ? '報酬' : 'Locked'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Panel>
      </View>
    </Modal>
  )
}

const getRewardIcon = (type: QuestReward['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'coins': return 'cash'
    case 'gems': return 'diamond'
    case 'exp': return 'star'
    case 'item': return 'gift'
    default: return 'cash'
  }
}

const getRewardColor = (type: QuestReward['type']): string => {
  switch (type) {
    case 'coins': return colors.secondaryContainer
    case 'gems': return colors.primary
    case 'exp': return colors.tertiary
    case 'item': return colors.success
    default: return colors.secondaryContainer
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    padding: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardPanel: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rewardAmount: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  claimButton: {
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  claimText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
  },
})
