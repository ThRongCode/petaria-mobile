/**
 * Design Token: Colors
 *
 * Material Design 3 dynamic color palette extracted from Stitch design system.
 * Single source of truth for all colors in the app.
 *
 * Surface hierarchy (darkest → lightest):
 *   surfaceContainerLowest → surfaceDim → surface → surfaceContainerLow
 *   → surfaceContainer → surfaceContainerHigh → surfaceContainerHighest → surfaceBright
 *
 * Usage:
 *   import { colors } from '@/themes/colors'
 *   backgroundColor: colors.surface
 */

// ─── Primary (Cyan / Teal) ──────────────────────────────────────────────────
const primary = {
  primary: '#44D8F1',
  primaryContainer: '#00BCD4',
  primaryFixed: '#A1EFFF',
  primaryFixedDim: '#44D8F1',
  onPrimary: '#00363E',
  onPrimaryContainer: '#004650',
  onPrimaryFixed: '#001F25',
  onPrimaryFixedVariant: '#004E59',
  inversePrimary: '#006876',
} as const

// ─── Secondary (Gold / Amber) ───────────────────────────────────────────────
const secondary = {
  secondary: '#FFF9EF',
  secondaryContainer: '#FFDB3C',
  secondaryFixed: '#FFE16D',
  secondaryFixedDim: '#E9C400',
  onSecondary: '#3A3000',
  onSecondaryContainer: '#725F00',
  onSecondaryFixed: '#221B00',
  onSecondaryFixedVariant: '#544600',
} as const

// ─── Tertiary (Bright Cyan) ─────────────────────────────────────────────────
const tertiary = {
  tertiary: '#00DAF3',
  tertiaryContainer: '#00BCD2',
  tertiaryFixed: '#9CF0FF',
  tertiaryFixedDim: '#00DAF3',
  onTertiary: '#00363D',
  onTertiaryContainer: '#00464F',
  onTertiaryFixed: '#001F24',
  onTertiaryFixedVariant: '#004F58',
} as const

// ─── Surface (Deep Navy / Dark) ─────────────────────────────────────────────
const surface = {
  surface: '#0F131F',
  surfaceDim: '#0F131F',
  surfaceBright: '#353946',
  surfaceVariant: '#313442',
  surfaceContainerLowest: '#0A0E1A',
  surfaceContainerLow: '#171B28',
  surfaceContainer: '#1B1F2C',
  surfaceContainerHigh: '#262A37',
  surfaceContainerHighest: '#313442',
  surfaceTint: '#44D8F1',
  onSurface: '#DFE2F3',
  onSurfaceVariant: '#BBC9CC',
  background: '#0F131F',
  onBackground: '#DFE2F3',
  inverseSurface: '#DFE2F3',
  inverseOnSurface: '#2C303D',
} as const

// ─── Error ──────────────────────────────────────────────────────────────────
const error = {
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',
} as const

// ─── Outline ────────────────────────────────────────────────────────────────
const outline = {
  outline: '#869396',
  outlineVariant: '#3C494C',
} as const

// ─── Semantic / Utility ─────────────────────────────────────────────────────
const semantic = {
  success: '#23C16B',
  warning: '#FFB323',
  info: '#48A7F8',
} as const

// ─── Glass Fill Opacities ───────────────────────────────────────────────────
// Three-tier glass hierarchy from DESIGN.md §2: "The Glass Layer"
// Usage: backgroundColor: colors.glass.subtle  (or .default / .prominent)
const glass = {
  /** Deepest glass — barely visible lift (nested inner cards) */
  subtle: 'rgba(255, 255, 255, 0.05)',
  /** Standard glass fill for most panels (DESIGN.md default) */
  default: 'rgba(255, 255, 255, 0.10)',
  /** Prominent glass — most visible lift (hero cards, modals) */
  prominent: 'rgba(255, 255, 255, 0.15)',
  /** Inner glow border — simulates light catching edge of glass */
  innerGlow: 'rgba(255, 255, 255, 0.2)',
  /** Faint inner glow for nested elements */
  innerGlowSubtle: 'rgba(255, 255, 255, 0.1)',
  /** Dark glass fill used in HTML designs (rgba(15,19,31,0.7-0.8)) */
  darkFill: 'rgba(15, 19, 31, 0.70)',
  darkFillStrong: 'rgba(15, 19, 31, 0.80)',
  /** Active/Focus state: glass brightens */
  activeFill: 'rgba(255, 255, 255, 0.18)',
  /** Divider — not a 1px line, just a color shift */
  divider: 'rgba(255, 255, 255, 0.05)',
} as const

// ─── Glow Shadow Colors ─────────────────────────────────────────────────────
// DESIGN.md §4: "Cyan-Tinted Shadow" — no standard black shadows.
const glow = {
  /** Default ambient glow — cyan-tinted per DESIGN.md */
  cyan: 'rgba(0, 188, 212, 0.12)',
  /** Stronger cyan for hero elements */
  cyanStrong: 'rgba(0, 188, 212, 0.30)',
  /** Intense cyan for active/pressed states */
  cyanIntense: 'rgba(68, 216, 241, 0.40)',
  /** Gold glow — rarity indicators, legendary, gold standard buttons */
  gold: 'rgba(255, 219, 60, 0.25)',
  goldStrong: 'rgba(255, 219, 60, 0.40)',
  /** Red glow — error states, danger buttons */
  error: 'rgba(255, 180, 171, 0.20)',
  errorStrong: 'rgba(255, 180, 171, 0.35)',
  /** Purple glow — epic rarity */
  purple: 'rgba(163, 62, 161, 0.25)',
  /** White glow — for text neon effects */
  white: 'rgba(255, 255, 255, 0.15)',
} as const

// ─── Rarity Gradient Pairs (for thin accent strips & badges) ────────────────
// Extracted from HTML designs: each rarity has a gradient start→end
const rarityGradients = {
  common:    ['#A8A77A', '#8B8A5E'] as const,
  uncommon:  ['#23C16B', '#1A9E55'] as const,
  rare:      ['#6390F0', '#4A74D4'] as const,
  epic:      ['#A33EA1', '#7B2D7A'] as const,
  legendary: ['#FFD700', '#FF8F00'] as const,
} as const

// ─── Pokémon Type Colors (centralized) ──────────────────────────────────────
const typeColors: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
}

// ─── Rarity Colors ──────────────────────────────────────────────────────────
const rarityColors = {
  common: '#A8A77A',
  uncommon: '#23C16B',
  rare: '#6390F0',
  epic: '#A33EA1',
  legendary: '#FFD700',
} as const

// ─── Aggregated export ──────────────────────────────────────────────────────
const colors = {
  ...primary,
  ...secondary,
  ...tertiary,
  ...surface,
  ...error,
  ...outline,
  ...semantic,
  glass,
  glow,
  typeColors,
  rarityColors,
  rarityGradients,

  // Legacy aliases (for backward compat during migration)
  white: '#FFFFFF',
  black: '#1F1F1F',
  transparent: 'transparent',

  // ─── Legacy aliases mapping old tokens → new tokens ─────────────────────
  // Remove these once all screens are migrated to the new design tokens.
  gray: '#BBC9CC',                    // → onSurfaceVariant
  red: '#FFB4AB',                     // → error
  border: '#3C494C',                  // → outlineVariant
  disabled: '#313442',                // → surfaceContainerHighest
  placeholder: '#BBC9CC',             // → onSurfaceVariant
  backgroundPrimary: '#0A0E1A',       // → surfaceContainerLowest
  backgroundSecondary: '#0F131F',     // → surface
  light: {
    text: '#DFE2F3',                  // → onSurface
    background: '#0A0E1A',            // → surfaceContainerLowest
    tint: '#44D8F1',                  // → primary
    icon: '#BBC9CC',                  // → onSurfaceVariant
    tabIconDefault: '#BBC9CC',
    tabIconSelected: '#44D8F1',
  },
  dark: {
    text: '#DFE2F3',
    background: '#0A0E1A',
    tint: '#44D8F1',
    icon: '#BBC9CC',
    tabIconDefault: '#BBC9CC',
    tabIconSelected: '#44D8F1',
  },
} as const

/**
 * Returns a hex color with the given opacity (0–1).
 * Example: getColorOpacity('#44D8F1', 0.5) → '#44D8F180'
 */
const getColorOpacity = (color: string, opacity: number): string => {
  if (opacity >= 0 && opacity <= 1 && color.startsWith('#') && color.length >= 7) {
    const hexValue = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
    return `${color.slice(0, 7)}${hexValue}`
  }
  return color
}

export { colors, getColorOpacity, typeColors, rarityColors, rarityGradients, glass, glow }
export type ColorToken = keyof typeof colors
