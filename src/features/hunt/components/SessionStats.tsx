/**
 * SessionStats Component
 * Single Responsibility: Display hunt session statistics
 */

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { SessionRewards } from '../types'

interface SessionStatsProps {
  rewards: SessionRewards
}

export const SessionStats: React.FC<SessionStatsProps> = ({ rewards }) => {
  return (
    <Panel variant="dark" style={styles.container}>
      <View style={styles.statsRow}>
        <StatItem label="XP" value={rewards.totalXp} />
        <StatItem label="Coins" value={rewards.totalCoins} />
        <StatItem label="Pets" value={rewards.petsFound} />
        <StatItem label="Items" value={rewards.itemsFound} />
      </View>
    </Panel>
  )
}

interface StatItemProps {
  label: string
  value: number
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
})
