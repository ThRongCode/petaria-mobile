/**
 * SessionHeader — "Lapis Glassworks" glass header
 *
 * Region name (large bold white), "DUNGEON EXPLORATION" subtitle with compass
 * icon, and gold "ACTIONS LEFT" counter with glow.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { HuntSession } from '../types'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface SessionHeaderProps {
  session: HuntSession | null
  regionName?: string
  movesLeft: number
  onComplete: () => void
  onExit: () => void
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  regionName,
  movesLeft,
}) => {
  const router = useRouter()
  const displayRegionName = session?.region.name || regionName || 'Unknown Region'

  return (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
        </TouchableOpacity>

        {/* Region info */}
        <View style={styles.regionInfo}>
          <ThemedText style={styles.regionName} numberOfLines={1}>
            {displayRegionName}
          </ThemedText>
          <View style={styles.subtitleRow}>
            <Ionicons name="compass-outline" size={12} color={colors.primary} />
            <ThemedText style={styles.subtitle}>DUNGEON EXPLORATION</ThemedText>
          </View>
        </View>

        {/* Actions counter */}
        <View style={styles.actionsBox}>
          <ThemedText style={styles.actionsLabel}>ACTIONS LEFT</ThemedText>
          <ThemedText style={styles.actionsNum}>{movesLeft}</ThemedText>
        </View>
      </View>
    </View>
  )
}

/* ── Session Actions (Pause & Exit / Complete) ──── */

interface SessionActionsProps {
  onComplete: () => void
  onExit: () => void
  movesLeft: number
}

export const SessionActions: React.FC<SessionActionsProps> = ({
  onComplete,
  onExit,
  movesLeft,
}) => {
  if (movesLeft === 0) {
    return (
      <TouchableOpacity onPress={onComplete} style={styles.exitButton} activeOpacity={0.75}>
        <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
        <ThemedText style={[styles.exitText, { color: colors.success }]}>COMPLETE HUNT</ThemedText>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onExit} style={styles.exitButton} activeOpacity={0.75}>
      <Ionicons name="log-out-outline" size={18} color={colors.error} />
      <ThemedText style={styles.exitText}>PAUSE & EXIT</ThemedText>
    </TouchableOpacity>
  )
}

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
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  regionInfo: { flex: 1, marginRight: spacing.md },
  regionName: {
    fontSize: fontSizes.title,
    fontFamily: fonts.extraBold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 2,
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

  /* ── Actions counter ────────────────────────────── */
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

  /* ── Pause / Exit ───────────────────────────────── */
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.DEFAULT,
    paddingVertical: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  exitText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
})
