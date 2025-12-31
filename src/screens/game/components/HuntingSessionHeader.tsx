import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'

interface SessionRewards {
  totalXp: number
  totalCoins: number
  petsFound: number
  itemsFound: number
}

interface HuntingSessionHeaderProps {
  regionName: string
  actionsLeft: number
  sessionRewards: SessionRewards
}

export const HuntingSessionHeader: React.FC<HuntingSessionHeaderProps> = ({
  regionName,
  actionsLeft,
  sessionRewards,
}) => {
  return (
    <>
      {/* Header Panel */}
      <Panel variant="dark" style={styles.headerPanel}>
        <View style={styles.headerContent}>
          <View style={styles.sessionInfo}>
            <ThemedText style={styles.regionName}>
              {regionName}
            </ThemedText>
            <ThemedText style={styles.sessionSubtitle}>Dungeon Exploration</ThemedText>
          </View>
          <View style={styles.actionsCounter}>
            <ThemedText style={styles.actionsText}>Actions Left</ThemedText>
            <ThemedText style={styles.actionsNumber}>{actionsLeft}</ThemedText>
          </View>
        </View>
      </Panel>

      {/* Session rewards summary */}
      <Panel variant="dark" style={styles.rewardsPanel}>
        <View style={styles.rewardsBar}>
          <View style={styles.rewardItem}>
            <ThemedText style={styles.rewardLabel}>XP</ThemedText>
            <ThemedText style={styles.rewardValue}>{sessionRewards.totalXp}</ThemedText>
          </View>
          <View style={styles.rewardItem}>
            <ThemedText style={styles.rewardLabel}>Coins</ThemedText>
            <ThemedText style={styles.rewardValue}>{sessionRewards.totalCoins}</ThemedText>
          </View>
          <View style={styles.rewardItem}>
            <ThemedText style={styles.rewardLabel}>Pets</ThemedText>
            <ThemedText style={styles.rewardValue}>{sessionRewards.petsFound}</ThemedText>
          </View>
          <View style={styles.rewardItem}>
            <ThemedText style={styles.rewardLabel}>Items</ThemedText>
            <ThemedText style={styles.rewardValue}>{sessionRewards.itemsFound}</ThemedText>
          </View>
        </View>
      </Panel>
    </>
  )
}

const styles = StyleSheet.create({
  headerPanel: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  actionsCounter: {
    alignItems: 'center',
  },
  actionsText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  actionsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rewardsPanel: {
    marginBottom: 16,
  },
  rewardsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
})
