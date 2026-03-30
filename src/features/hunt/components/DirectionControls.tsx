/**
 * DirectionControls — "Lapis Glassworks" D-pad + Explorer
 *
 * Central explorer circle with glowing rings, "Scouting..." status badge,
 * glass D-pad with gold chevron arrows and center sensor icon.
 * Design ref: desgin/hunting_session_exploration/code.html
 */

import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { Direction } from '../types'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface DirectionControlsProps {
  onMove: (direction: Direction) => void
  disabled?: boolean
  isMoving?: boolean
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

export const DirectionControls: React.FC<DirectionControlsProps> = ({
  onMove,
  disabled = false,
  isMoving = false,
}) => {
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
            isDisabled={disabled}
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
            isDisabled={disabled}
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
            isDisabled={disabled}
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
            isDisabled={disabled}
            onPress={() => onMove('down')}
          />
        </View>
      </View>
    </View>
  )
}

/* ═══════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: { alignItems: 'center' },

  /* ── Exploration Area ───────────────────────────── */
  explorationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.lg,
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
})
