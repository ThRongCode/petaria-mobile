import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing } from '@/themes/metrics'

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

    <StatRow name="HP" value={pet.stats.hp} color={colors.success} />
    <StatRow name="Attack" value={pet.stats.attack} color={colors.error} />
    <StatRow name="Defense" value={pet.stats.defense} color={colors.info} />
    <StatRow name="Speed" value={pet.stats.speed} color={colors.warning} />
  </Panel>
)

const styles = StyleSheet.create({
  tabPanel: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    width: 80,
  },
  statBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    width: 40,
    textAlign: 'right',
  },
})
