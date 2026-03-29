/**
 * Design Token: Shared Styles
 *
 * Visual building blocks from "The Luminous Glass Initiative" (DESIGN.md).
 * Every reusable style preset lives here. Screens compose these — never inline
 * raw color/shadow values.
 *
 * Hierarchy (SOLID — Single Responsibility):
 *   colors.ts   → palette values
 *   metrics.ts  → spacing / radii / font sizes
 *   fonts.ts    → font family names
 *   styles.ts   → composed StyleSheet presets (this file)
 *
 * DESIGN.md rules enforced:
 *   • No black shadows — cyan-tinted glow only (§4)
 *   • Three glass depths: subtle / default / prominent (§2)
 *   • 32px (radii.xl) defining silhouette on main containers (§5)
 *   • No 1px divider lines — use spacing or bg-color shift (§6)
 *   • Primary CTA gradient: primary → primaryContainer (§2)
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { colors, getColorOpacity } from './colors'
import { radii, spacing, fontSizes } from './metrics'
import { fonts } from './fonts'

// ═══════════════════════════════════════════════════════════════════════════
// GLASS PANEL BASES — Three-tier depth system (§2 "The Glass Layer")
// ═══════════════════════════════════════════════════════════════════════════

/** Subtle glass — barely visible lift, for nested inner cards */
const glassPanelSubtle = {
  backgroundColor: colors.glass.subtle,
  borderWidth: 1,
  borderColor: colors.glass.innerGlowSubtle,
  borderRadius: radii.lg,        // 24px — inner cards use md-lg
} as const

/** Default glass — standard panels (most common) */
const glassPanelBase = {
  backgroundColor: colors.glass.default,
  borderWidth: 1,
  borderColor: colors.glass.innerGlow,
  borderRadius: radii.xl,        // 32px — THE defining silhouette (§5, §6)
} as const

/** Prominent glass — hero cards, modals, featured content */
const glassPanelProminent = {
  backgroundColor: colors.glass.prominent,
  borderWidth: 1,
  borderColor: colors.glass.innerGlow,
  borderRadius: radii.xl,        // 32px
} as const

/** Dark glass — used in designs as rgba(15,19,31,0.7) for high-contrast panels */
const glassPanelDark = {
  backgroundColor: colors.glass.darkFill,
  borderWidth: 1,
  borderColor: colors.glass.innerGlowSubtle,
  borderRadius: radii.xl,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// GLOW SHADOW PRESETS — Cyan-tinted, never black (§4 "Ambient Shadows")
// ═══════════════════════════════════════════════════════════════════════════

/** Ambient glow — default card float. Cyan tinted, 48px blur per §4 */
const glowAmbient: ViewStyle = {
  shadowColor: colors.glow.cyan,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 24,              // 48px blur ÷ 2 for RN
  elevation: 4,
}

/** Medium glow — elevated cards, active states */
const glowMedium: ViewStyle = {
  shadowColor: colors.glow.cyanStrong,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 32,
  elevation: 8,
}

/** Hero glow — for hero frames, featured Pokémon, encounter modals */
const glowHero: ViewStyle = {
  shadowColor: colors.glow.cyanIntense,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 48,
  elevation: 12,
}

/** Gold glow — legendary items, rarity indicators, gold-standard buttons */
const glowGold: ViewStyle = {
  shadowColor: colors.glow.gold,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 6,
}

const glowGoldStrong: ViewStyle = {
  shadowColor: colors.glow.goldStrong,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 32,
  elevation: 10,
}

/** Error glow — danger actions, error states */
const glowError: ViewStyle = {
  shadowColor: colors.glow.error,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 6,
}

const glowErrorStrong: ViewStyle = {
  shadowColor: colors.glow.errorStrong,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 32,
  elevation: 10,
}

/** Purple glow — epic rarity */
const glowPurple: ViewStyle = {
  shadowColor: colors.glow.purple,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 6,
}

/**
 * Dynamic neon glow factory — use for any custom color.
 * Replaces old neonGlow(); now with configurable radius.
 */
const neonGlow = (color: string, radius: number = 12) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 } as const,
  shadowOpacity: 0.6,
  shadowRadius: radius,
  elevation: 8,
})

// Legacy shadow aliases — map to glow equivalents so old callsites still work
// TODO: remove once all screens are migrated
const shadowLight = glowAmbient
const shadowMedium = glowMedium
const shadowHeavy = glowHero

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT PRESETS — Reusable color stops for LinearGradient
// ═══════════════════════════════════════════════════════════════════════════

/** Primary CTA gradient (§2): primary → primaryContainer */
const gradientPrimary = [colors.primary, colors.primaryContainer] as const

/** Gold / Secondary CTA gradient */
const gradientGold = [colors.secondaryFixed, colors.secondaryContainer] as const

/** Error / Danger gradient */
const gradientError = ['rgba(255,180,171,0.80)', colors.errorContainer] as const

/** Screen overlay gradient (top → bottom fade to dark) */
const gradientScreenOverlay = [
  'rgba(10, 14, 26, 0.20)',
  'rgba(10, 14, 26, 0.45)',
  'rgba(10, 14, 26, 0.80)',
] as const

/** Bottom fade (content → bottom nav transition) */
const gradientBottomFade = [
  'transparent',
  colors.surfaceContainerLowest,
] as const

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON PRESETS — Kinetic Triggers (§5 "Buttons")
// ═══════════════════════════════════════════════════════════════════════════

const buttonBase: ViewStyle = {
  borderRadius: radii.xl,         // 32px per §5
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}

const buttonPrimary: ViewStyle = {
  ...buttonBase,
  // Background handled via <LinearGradient colors={gradientPrimary}>
}

const buttonSecondary: ViewStyle = {
  ...buttonBase,
  backgroundColor: colors.secondaryContainer,
}

const buttonTertiary: ViewStyle = {
  ...buttonBase,
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: getColorOpacity(colors.outlineVariant, 0.2),
}

const buttonDanger: ViewStyle = {
  ...buttonBase,
  // Background handled via <LinearGradient colors={gradientError}>
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING ACTION CHIPS (§5)
// ═══════════════════════════════════════════════════════════════════════════

const chipBase: ViewStyle = {
  borderRadius: radii.full,
  backgroundColor: getColorOpacity(colors.surfaceBright, 0.4),
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  flexDirection: 'row',
  alignItems: 'center',
}

const chipActive: ViewStyle = {
  ...chipBase,
  backgroundColor: colors.primary,
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLESHEET — Composed presets for direct use in screens
// ═══════════════════════════════════════════════════════════════════════════

const sharedStyles = StyleSheet.create({
  // ── Screen backgrounds ─────────────────────────────────────
  screenBackground: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },

  /** Absolute-fill background image container */
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /** Gradient overlay on top of background images */
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // ── Glass panels (three depths) ────────────────────────────
  /** Standard glass (most panels) — 32px radius, 0.10 fill */
  glassPanel: {
    ...glassPanelBase,
    padding: spacing.lg,
  },

  /** Compact glass — less padding */
  glassPanelCompact: {
    ...glassPanelBase,
    padding: spacing.md,
  },

  /** Flush glass — no padding (children handle their own) */
  glassPanelFlush: {
    ...glassPanelBase,
    padding: 0,
  },

  /** Subtle glass — for nested inner cards */
  glassPanelSubtle: {
    ...glassPanelSubtle,
    padding: spacing.md,
  },

  /** Prominent glass — hero cards, featured content */
  glassPanelProminent: {
    ...glassPanelProminent,
    padding: spacing.lg,
  },

  /** Dark glass fill — high-contrast panels over busy backgrounds */
  glassPanelDark: {
    ...glassPanelDark,
    padding: spacing.lg,
  },

  // ── Typography ─────────────────────────────────────────────
  textDisplay: {
    fontFamily: fonts.extraBold,
    fontSize: fontSizes.display,
    color: colors.onSurface,
    letterSpacing: -0.5,          // §3: tight lockup for display
  },

  textHeadline: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.heading,
    color: colors.onSurface,
  },

  textTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    color: colors.onSurface,
  },

  textBody: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    color: colors.onSurface,
  },

  /** Micro label — 10px uppercase, extra-wide tracking (game HUD style) */
  textLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.xs,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.5,           // widest tracking per HTML designs
  },

  /** Standard label — 12px uppercase */
  textLabelMd: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  textMuted: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.span,
    color: colors.onSurfaceVariant,
  },

  textPrimary: {
    color: colors.primary,
  },

  textSecondary: {
    color: colors.secondaryContainer,
  },

  /** Glow text — text-shadow neon effect (§3 headline accent) */
  textGlowPrimary: {
    textShadowColor: getColorOpacity(colors.primary, 0.6),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  textGlowGold: {
    textShadowColor: getColorOpacity(colors.secondaryContainer, 0.5),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // ── Layout helpers ─────────────────────────────────────────
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

  /** Content padding — standard horizontal screen margins */
  contentPadding: {
    paddingHorizontal: spacing.lg,
  },

  /** Section gap — vertical spacing between content blocks (§5: spacing-6) */
  sectionGap: {
    marginBottom: spacing['2xl'],
  },

  // ── Divider ────────────────────────────────────────────────
  // §6: No 1px solid lines. Use bg-color shift or spacing gaps.
  // This is a "ghost" divider — barely visible, for rare cases only.
  divider: {
    height: 1,
    backgroundColor: colors.glass.divider,
  },

  // ── Decorative blur orb (ambient light) ────────────────────
  /** Absolute-positioned decorative glow orb */
  blurOrb: {
    position: 'absolute',
    borderRadius: radii.full,
    opacity: 0.10,
  },
})

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Composed stylesheet
  sharedStyles,

  // Glass panel bases (for custom composition)
  glassPanelBase,
  glassPanelSubtle,
  glassPanelProminent,
  glassPanelDark,

  // Glow shadows (cyan-tinted, per DESIGN.md §4)
  glowAmbient,
  glowMedium,
  glowHero,
  glowGold,
  glowGoldStrong,
  glowError,
  glowErrorStrong,
  glowPurple,
  neonGlow,

  // Legacy shadow aliases (backward compat — remove when migrated)
  shadowLight,
  shadowMedium,
  shadowHeavy,

  // Gradient color-stop arrays (for <LinearGradient colors={...}>)
  gradientPrimary,
  gradientGold,
  gradientError,
  gradientScreenOverlay,
  gradientBottomFade,

  // Button & chip bases
  buttonBase,
  buttonPrimary,
  buttonSecondary,
  buttonTertiary,
  buttonDanger,
  chipBase,
  chipActive,
}
