import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'

const MAX_STAT_VALUE = 200

interface StatRowProps {
  name: string
  value: number
  color: string
}

function StatRow({ name, value, color }: StatRowProps): React.ReactElement {
  const percentage = (value / MAX_STAT_VALUE) * 100

  return (
    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>{name}</ThemedText>
      <View style={styles.statBarBackground}>
        <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
    </View>
  )
}

interface StatsTabProps {
  pet: Pet
}

export const StatsTab: React.FC<StatsTabProps> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Base Stats</ThemedText>

    <StatRow name="HP" value={pet.stats.hp} color="#4CAF50" />
    <StatRow name="Attack" value={pet.stats.attack} color="#FF5722" />
    <StatRow name="Defense" value={pet.stats.defense} color="#2196F3" />
    <StatRow name="Speed" value={pet.stats.speed} color="#FFC107" />
  </Panel>
)

const styles = StyleSheet.create({
  tabPanel: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    width: 80,
  },
  statBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    width: 40,
    textAlign: 'right',
  },
})
