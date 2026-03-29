/**
 * HuntingSessionHeader — "Lapis Glassworks" glass header
 *
 * Region name, actions-left counter, and session reward summary bar.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

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
}) => (
  <>
    {/* ── Header Panel ───────────────────────────────── */}
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        {/* Region info */}
        <View style={styles.regionInfo}>
          <ThemedText style={styles.regionName}>{regionName}</ThemedText>
          <View style={styles.subtitleRow}>
            <Ionicons name="compass-outline" size={14} color={colors.primary} />
            <ThemedText style={styles.subtitle}>DUNGEON EXPLORATION</ThemedText>
          </View>
        </View>

        {/* Actions counter */}
        <View style={styles.actionsBox}>
          <ThemedText style={styles.actionsLabel}>ACTIONS LEFT</ThemedText>
          <ThemedText style={styles.actionsNum}>{actionsLeft}</ThemedText>
        </View>
      </View>
    </View>

    {/* ── Stats Pill Bar ─────────────────────────────── */}
    <View style={styles.statsBar}>
      <StatItem label="XP" value={sessionRewards.totalXp} />
      <View style={styles.divider} />
      <StatItem label="COINS" value={sessionRewards.totalCoins} />
      <View style={styles.divider} />
      <StatItem label="PETS" value={sessionRewards.petsFound} />
      <View style={styles.divider} />
      <StatItem label="ITEMS" value={sessionRewards.itemsFound} />
    </View>
  </>
)

/* ── Small stat chip inside the pill bar ─────────── */
const StatItem = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statItem}>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
  </View>
)

/* ═══════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  /* ── Header Card ──────────────────────────────── */
  headerCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.DEFAULT,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionInfo: { flex: 1, marginRight: spacing.md },
  regionName: {
    fontSize: fontSizes.display,
    fontFamily: fonts.extraBold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
    opacity: 0.8,
  },

  /* ── Actions box ────────────────────────────────── */
  actionsBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 219, 60, 0.08)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 60, 0.2)',
  },
  actionsLabel: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    letterSpacing: 2,
    marginBottom: 2,
  },
  actionsNum: {
    fontSize: 40,
    fontFamily: fonts.extraBold,
    color: colors.secondaryContainer,
    lineHeight: 44,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  /* ── Stats Pill Bar ────────────────────────────── */
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
