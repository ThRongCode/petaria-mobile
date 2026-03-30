/**
 * HuntingControls — "Lapis Glassworks" D-pad controls
 *
 * Explorer area with animated character indicator, glass D-pad with
 * gold directional arrows, center sensor icon, and glass "Pause & Exit" bar.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

type Direction = 'up' | 'down' | 'left' | 'right'

interface HuntingControlsProps {
  actionsLeft: number
  isMoving: boolean
  moveAnimation: Animated.Value
  onMove: (direction: Direction) => void
  onExit: () => void
}

interface DirectionButtonProps {
  direction: Direction
  iconName: keyof typeof Ionicons.glyphMap
  label: string
  isMoving: boolean
  isDisabled: boolean
  onPress: () => void
}

const DPAD_SIZE = 80

function DirectionButton({ iconName, label, isMoving, isDisabled, onPress }: DirectionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.dpadButton, isDisabled && styles.disabledButton]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.dpadInner}>
        {isMoving ? (
          <ActivityIndicator size="small" color={colors.secondaryContainer} />
        ) : (
          <Ionicons name={iconName} size={28} color={colors.secondaryContainer} />
        )}
        <ThemedText style={styles.dpadLabel}>{label}</ThemedText>
      </View>
    </TouchableOpacity>
  )
}

export const HuntingControls: React.FC<HuntingControlsProps> = ({
  actionsLeft,
  isMoving,
  moveAnimation,
  onMove,
  onExit,
}) => {
  const isDisabled = actionsLeft <= 0 || isMoving

  return (
    <View style={styles.container}>
      {/* ── D-Pad ────────────────────────────────────── */}
      <View style={styles.dpad}>
        {/* Up */}
        <View style={styles.dpadRow}>
          <DirectionButton
            direction="up"
            iconName="chevron-up"
            label="Up"
            isMoving={isMoving}
            isDisabled={isDisabled}
            onPress={() => onMove('up')}
          />
        </View>

        {/* Left – Center – Right */}
        <View style={styles.dpadRow}>
          <DirectionButton
            direction="left"
            iconName="chevron-back"
            label="Left"
            isMoving={isMoving}
            isDisabled={isDisabled}
            onPress={() => onMove('left')}
          />
          <View style={styles.dpadCenter}>
            <Ionicons name="radio-outline" size={20} color="rgba(68, 216, 241, 0.35)" />
          </View>
          <DirectionButton
            direction="right"
            iconName="chevron-forward"
            label="Right"
            isMoving={isMoving}
            isDisabled={isDisabled}
            onPress={() => onMove('right')}
          />
        </View>

        {/* Down */}
        <View style={styles.dpadRow}>
          <DirectionButton
            direction="down"
            iconName="chevron-down"
            label="Down"
            isMoving={isMoving}
            isDisabled={isDisabled}
            onPress={() => onMove('down')}
          />
        </View>
      </View>

      {/* ── Pause & Exit ─────────────────────────────── */}
      <TouchableOpacity
        onPress={onExit}
        style={styles.exitButton}
        activeOpacity={0.75}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <ThemedText style={styles.exitText}>PAUSE & EXIT</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

/* ═══════════════════════════════════════════════════ */

const EXPLORER_SIZE = 160

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* ── Explorer Area ──────────────────────────────── */
  explorationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  explorerGlowOuter: {
    position: 'absolute',
    width: EXPLORER_SIZE * 1.6,
    height: EXPLORER_SIZE * 1.6,
    borderRadius: EXPLORER_SIZE,
    backgroundColor: 'rgba(68, 216, 241, 0.06)',
  },
  explorerCircle: {
    width: EXPLORER_SIZE,
    height: EXPLORER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explorerBorderRing: {
    width: EXPLORER_SIZE,
    height: EXPLORER_SIZE,
    borderRadius: EXPLORER_SIZE / 2,
    padding: 3,
    backgroundColor: colors.primary,
    shadowColor: 'rgba(68, 216, 241, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 8,
  },
  explorerInner: {
    flex: 1,
    borderRadius: EXPLORER_SIZE / 2,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explorerEmoji: {
    fontSize: 64,
  },
  orbitRing: {
    position: 'absolute',
    width: EXPLORER_SIZE + 32,
    height: EXPLORER_SIZE + 32,
    borderRadius: (EXPLORER_SIZE + 32) / 2,
    borderWidth: 2,
    borderColor: 'rgba(68, 216, 241, 0.15)',
    borderStyle: 'dashed',
  },

  /* ── Status Badge ───────────────────────────────── */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(53, 57, 70, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  explorationHint: {
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  /* ── D-Pad ──────────────────────────────────────── */
  dpad: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  dpadButton: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
  },
  dpadInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.DEFAULT,
    gap: 2,
  },
  dpadLabel: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dpadCenter: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.DEFAULT,
  },
  disabledButton: { opacity: 0.3 },

  /* ── Exit ───────────────────────────────────────── */
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
