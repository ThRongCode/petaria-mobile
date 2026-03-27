/**
 * HeaderBase Component
 * 
 * Reusable curved header with gradient background for consistent app design
 */

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { colors, fonts, spacing, radii } from '@/themes'

interface HeaderBaseProps {
  title: string
  gradientColors?: [string, string]
  height?: number
  children?: React.ReactNode
  style?: ViewStyle
}

export const HeaderBase: React.FC<HeaderBaseProps> = ({
  title,
  gradientColors = ['#00BCD4', '#004E59'],
  height = 140,
  children,
  style,
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { height }, style]}
    >
      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {/* Optional additional content */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomLeftRadius: radii['2xl'],
    borderBottomRightRadius: radii['2xl'],
    paddingTop: 50,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textAlign: 'center',
  },
  childrenContainer: {
    marginTop: spacing.lg,
  },
})
