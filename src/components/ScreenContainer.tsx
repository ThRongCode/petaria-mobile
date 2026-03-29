import React, { PropsWithChildren } from 'react'
import { StyleSheet, View, ViewStyle, StyleProp, ImageBackground, ImageSourcePropType } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '@/themes'
import { gradientScreenOverlay } from '@/themes/styles'

interface BlurOrbConfig {
  /** Orb color (use colors.primary, colors.tertiary, etc.) */
  color: string
  /** Diameter in px */
  size: number
  /** Position from top (absolute) */
  top?: number
  /** Position from left */
  left?: number
  /** Position from right */
  right?: number
  /** Position from bottom */
  bottom?: number
  /** Opacity override (default 0.10) */
  opacity?: number
}

interface ScreenContainerProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>
  /**
   * Full-bleed background image source. Renders as absolute-fill
   * ImageBackground underneath content. Used by 13/17 design screens.
   */
  backgroundImage?: ImageSourcePropType
  /**
   * Enable the dark gradient overlay on top of backgroundImage.
   * Uses gradientScreenOverlay (30% → 60% → 85% dark).
   * @default true when backgroundImage is set
   */
  backgroundOverlay?: boolean
  /**
   * Legacy: Show the subtle cyan hero gradient at top.
   * Prefer backgroundImage + overlay for new designs.
   */
  heroGradient?: boolean
  /**
   * Decorative blur orbs for ambient lighting.
   * Per DESIGN.md: huge blur(120px) circles at 10% opacity.
   * Only the Settings screen and auth screens use these instead of bg images.
   */
  blurOrbs?: BlurOrbConfig[]
}

/**
 * ScreenContainer — Root wrapper for every screen.
 *
 * Provides the deep-navy background (surfaceContainerLowest = #0A0E1A)
 * and composable layers:
 *   1. Background image (optional, absolute-fill)
 *   2. Gradient overlay (optional, on top of bg image)
 *   3. Decorative blur orbs (optional, ambient lighting)
 *   4. Children (the actual screen content)
 */
export const ScreenContainer = ({
  children,
  style,
  backgroundImage,
  backgroundOverlay,
  heroGradient = false,
  blurOrbs,
  ...rest
}: ScreenContainerProps) => {
  const showOverlay = backgroundOverlay ?? !!backgroundImage

  return (
    <View style={[styles.container, style]} {...rest}>
      {/* Layer 1: Full-bleed background image */}
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          style={styles.absoluteFill}
          resizeMode="cover"
        />
      )}

      {/* Layer 2: Gradient overlay */}
      {showOverlay && (
        <LinearGradient
          colors={[...gradientScreenOverlay]}
          style={styles.absoluteFill}
        />
      )}

      {/* Legacy hero gradient */}
      {heroGradient && !backgroundImage && (
        <LinearGradient
          colors={['rgba(68, 216, 241, 0.15)', 'transparent']}
          style={styles.heroOverlay}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
        />
      )}

      {/* Layer 3: Decorative blur orbs */}
      {blurOrbs?.map((orb, i) => (
        <View
          key={i}
          style={[
            styles.blurOrb,
            {
              width: orb.size,
              height: orb.size,
              borderRadius: orb.size / 2,
              backgroundColor: orb.color,
              opacity: orb.opacity ?? 0.10,
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
            },
          ]}
        />
      ))}

      {/* Layer 4: Content */}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  blurOrb: {
    position: 'absolute',
  },
})
