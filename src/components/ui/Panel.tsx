import React from 'react'
import { StyleSheet, View, ViewStyle, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, radii, spacing } from '@/themes'

type PanelVariant = 'glass' | 'solid' | 'dark' | 'transparent'

interface PanelProps {
  children: React.ReactNode
  style?: ViewStyle
  /** @default 'glass' */
  variant?: PanelVariant
  /** Use native blur (slower but true frosted glass). Defaults to false for perf. */
  nativeBlur?: boolean
  /** Remove default padding. Useful when children handle their own padding. */
  flush?: boolean
}

/**
 * Panel — Frosted glass card matching the Stitch .glass-panel style.
 *
 * Variants:
 *   glass       → rgba(255,255,255,0.12) + subtle border (default)
 *   solid       → surfaceContainerHigh opaque
 *   dark        → surfaceContainer opaque (legacy compat + currency pills)
 *   transparent → no background, just border
 */
export const Panel: React.FC<PanelProps> = ({
  children,
  style,
  variant = 'glass',
  nativeBlur = false,
  flush = false,
}) => {
  const paddingStyle = flush ? undefined : styles.padding

  if (nativeBlur && variant === 'glass') {
    return (
      <BlurView intensity={40} tint="dark" style={[styles.base, styles.glass, paddingStyle, style]}>
        {children}
      </BlurView>
    )
  }

  return (
    <View style={[styles.base, variantStyles[variant], paddingStyle, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.DEFAULT,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.lg,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.1)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 0,
      },
    }),
  },
})

const variantStyles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  solid: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outlineVariant,
  },
  dark: {
    backgroundColor: colors.surfaceContainer,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
})
