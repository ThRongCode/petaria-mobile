import React from 'react'
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from './Panel'
import { LinearGradient } from 'expo-linear-gradient'

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
              <Ionicons name="close" size={24} color="#fff" />
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
              colors={isComplete ? ['#FFA500', '#FF6B00'] : ['#555', '#333']}
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
    case 'coins': return '#FFD700'
    case 'gems': return '#00BFFF'
    case 'exp': return '#9C27B0'
    case 'item': return '#4CAF50'
    default: return '#FFD700'
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    gap: 4,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  claimButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  claimText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})
