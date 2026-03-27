/**
 * Design Token: Shared Styles
 *
 * Reusable style presets extracted from the Stitch "Lapis Glassworks" design system.
 * These are the visual building blocks used across all screens.
 *
 * Usage:
 *   import { sharedStyles } from '@/themes/styles'
 *   <View style={sharedStyles.glassPanel}>
 *
 * For glass panels with blur, use the <GlassPanel> component instead,
 * which wraps expo-blur for cross-platform support.
 */

import { StyleSheet } from 'react-native'
import { colors, getColorOpacity } from './colors'
import { radii, spacing } from './metrics'
import { fonts } from './fonts'

// ─── Glass Panel ────────────────────────────────────────────────────────────
// Frosted glass effect matching Stitch .glass-panel class:
//   background: rgba(255,255,255,0.12)
//   backdrop-filter: blur(20px)   ← needs <BlurView> in RN
//   border: 1px solid rgba(255,255,255,0.2)
//   box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.1)
const glassPanelBase = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: radii.DEFAULT,
} as const

// ─── Shadow Presets ─────────────────────────────────────────────────────────
const shadowLight = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 3,
} as const

const shadowMedium = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 6,
} as const

const shadowHeavy = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.35,
  shadowRadius: 32,
  elevation: 12,
} as const

// ─── Neon Glow (for rarity / special items) ─────────────────────────────────
const neonGlow = (color: string) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 12,
  elevation: 8,
})

// ─── Stylesheet ─────────────────────────────────────────────────────────────
const sharedStyles = StyleSheet.create({
  // Screen background
  screenBackground: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },

  // Glass panel (without blur — use <GlassPanel> for blur)
  glassPanel: {
    ...glassPanelBase,
    padding: spacing.lg,
  },

  glassPanelCompact: {
    ...glassPanelBase,
    padding: spacing.md,
  },

  glassPanelFlush: {
    ...glassPanelBase,
    padding: 0,
  },

  // Text styles
  textHeadline: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.onSurface,
  },

  textTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.onSurface,
  },

  textBody: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.onSurface,
  },

  textLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  textMuted: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },

  textPrimary: {
    color: colors.primary,
  },

  textSecondary: {
    color: colors.secondaryContainer,
  },

  // Glow text (matches .text-glow-primary)
  textGlowPrimary: {
    textShadowColor: getColorOpacity(colors.primary, 0.6),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Common layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider (ghost border style — subtle, not harsh)
  divider: {
    height: 1,
    backgroundColor: getColorOpacity(colors.outlineVariant, 0.3),
  },
})

export {
  sharedStyles,
  glassPanelBase,
  shadowLight,
  shadowMedium,
  shadowHeavy,
  neonGlow,
}
