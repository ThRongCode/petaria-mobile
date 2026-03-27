import React, { PropsWithChildren } from 'react'
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '@/themes'

interface ScreenContainerProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>
  /** Show the subtle hero gradient overlay (for Home/Hub screens) */
  heroGradient?: boolean
}

/**
 * ScreenContainer — Root wrapper for every screen.
 * Provides the dark deep-navy background from the design system.
 */
export const ScreenContainer = ({ children, style, heroGradient = false, ...rest }: ScreenContainerProps) => (
  <View style={[styles.container, style]} {...rest}>
    {heroGradient && (
      <LinearGradient
        colors={['rgba(68, 216, 241, 0.15)', 'transparent']}
        style={styles.heroOverlay}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
    )}
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
})
