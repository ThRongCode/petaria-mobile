/**
 * CurrencyBar — Compact coins + gems display for main tab screen headers.
 *
 * Usage:
 *   <CurrencyBar coins={profile.currency?.coins} gems={profile.currency?.gems} />
 */

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { AppIcons } from '@/constants/icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface CurrencyBarProps {
  coins?: number
  gems?: number
}

export const CurrencyBar: React.FC<CurrencyBarProps> = React.memo(({ coins = 0, gems = 0 }) => {
  return (
    <View style={styles.row}>
      {/* Coins pill */}
      <View style={[styles.pill, styles.coinsPill]}>
        <ThemedText style={styles.coinsText}>
          {formatCurrency(coins)}
        </ThemedText>
        <AppIcons.coins size={14} color={colors.secondaryContainer} />
      </View>

      {/* Gems pill */}
      <View style={[styles.pill, styles.gemsPill]}>
        <ThemedText style={styles.gemsText}>
          {formatCurrency(gems)}
        </ThemedText>
        <AppIcons.gems size={14} color={colors.primaryFixed} />
      </View>
    </View>
  )
})

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  coinsPill: {
    backgroundColor: 'rgba(255, 219, 60, 0.08)',
    borderColor: 'rgba(255, 219, 60, 0.20)',
  },
  gemsPill: {
    backgroundColor: 'rgba(68, 216, 241, 0.08)',
    borderColor: 'rgba(68, 216, 241, 0.20)',
  },
  coinsText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  gemsText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.primaryFixed,
  },
})
