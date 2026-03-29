import React from 'react'
import { StyleSheet, View, ViewStyle, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, radii, spacing } from '@/themes'

/**
 * Glass intensity tiers matching DESIGN.md §2 "The Glass Layer":
 *   subtle     → rgba(255,255,255,0.05) — nested inner cards
 *   default    → rgba(255,255,255,0.10) — most panels
 *   prominent  → rgba(255,255,255,0.15) — hero cards, modals
 *
 * Non-glass variants (legacy + utility):
 *   solid       → surfaceContainerHigh opaque
 *   dark        → darkFill rgba(15,19,31,0.70) — per HTML designs
 *   transparent → no bg, just border
 */
type PanelVariant = 'glass' | 'solid' | 'dark' | 'transparent'
type GlassIntensity = 'subtle' | 'default' | 'prominent'

interface PanelProps {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  /** @default 'glass' */
  variant?: PanelVariant
  /**
   * Glass depth tier. Only applies when variant='glass'.
   * Maps to the three-layer glass hierarchy from DESIGN.md §2.
   * @default 'default'
   */
  intensity?: GlassIntensity
  /**
   * Enable native backdrop blur (expo-blur). Slower but true frosted glass.
   * Only applies when variant='glass'.
   * @default false
   */
  nativeBlur?: boolean
  /** Blur intensity (0–100) when nativeBlur=true. @default 40 */
  blurAmount?: number
  /** Remove default padding. @default false */
  flush?: boolean
}

/**
 * Panel — Frosted glass card system.
 *
 * DESIGN.md enforced rules:
 *   • 32px corner radius on main containers, 24px on inner nested cards
 *   • No 1px solid borders — inner glow (inset shadow) only
 *   • Backdrop blur 20px mandatory on glass containers
 *   • Three glass depths via `intensity` prop
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  style,
  variant = 'glass',
  intensity = 'default',
  nativeBlur = false,
  blurAmount = 40,
  flush = false,
}) => {
  const paddingStyle = flush ? undefined : styles.padding
  const glassStyle = variant === 'glass' ? glassIntensityStyles[intensity] : undefined

  if (nativeBlur && variant === 'glass') {
    return (
      <BlurView
        intensity={blurAmount}
        tint="dark"
        style={[
          styles.base,
          glassStyle,
          paddingStyle,
          style,
        ]}
      >
        {children}
      </BlurView>
    )
  }

  return (
    <View style={[
      styles.base,
      variant === 'glass' ? glassStyle : variantStyles[variant],
      paddingStyle,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,       // 32px — the defining silhouette (§5, §6)
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.lg,
  },
})

/**
 * Three-tier glass fills per DESIGN.md §2.
 * Each tier has its own bg opacity and border glow intensity.
 */
const glassIntensityStyles = StyleSheet.create({
  subtle: {
    backgroundColor: colors.glass.subtle,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,       // 24px — inner nested cards
  },
  default: {
    backgroundColor: colors.glass.default,
    borderColor: colors.glass.innerGlow,
  },
  prominent: {
    backgroundColor: colors.glass.prominent,
    borderColor: colors.glass.innerGlow,
    ...Platform.select({
      ios: {
        shadowColor: colors.glow.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 24,
      },
    }),
  },
})

const variantStyles = StyleSheet.create({
  glass: {
    // unused — handled by glassIntensityStyles
    backgroundColor: colors.glass.default,
    borderColor: colors.glass.innerGlow,
  },
  solid: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outlineVariant,
  },
  dark: {
    backgroundColor: colors.glass.darkFill,
    borderColor: colors.glass.innerGlowSubtle,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderColor: colors.glass.innerGlowSubtle,
  },
})
