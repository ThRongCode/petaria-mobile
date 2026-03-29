/**
 * SessionStats — "Lapis Glassworks" pill-shaped stats bar
 *
 * Horizontal glass pill with XP / COINS / PETS / ITEMS separated by
 * thin white dividers. Matches the design's rounded-full stat bar.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { SessionRewards } from '../types'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface SessionStatsProps {
  rewards: SessionRewards
}

export const SessionStats: React.FC<SessionStatsProps> = ({ rewards }) => (
  <View style={styles.statsBar}>
    <StatItem label="XP" value={rewards.totalXp} />
    <View style={styles.divider} />
    <StatItem label="COINS" value={rewards.totalCoins} />
    <View style={styles.divider} />
    <StatItem label="PETS" value={rewards.petsFound} />
    <View style={styles.divider} />
    <StatItem label="ITEMS" value={rewards.itemsFound} />
  </View>
)

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
)

/* ═══════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  statsBar: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.full,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
  statValue: {
    fontSize: fontSizes.span,
    fontFamily: fonts.extraBold,
    color: '#FFFFFF',
  },
})
