/**
 * HeaderBase Component
 * 
 * Reusable curved header with gradient background for consistent app design
 */

import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'

interface HeaderBaseProps {
  title: string
  gradientColors?: [string, string]
  height?: number
  children?: React.ReactNode
  style?: ViewStyle
}

export const HeaderBase: React.FC<HeaderBaseProps> = ({
  title,
  gradientColors = ['#FF6B9D', '#C44569'], // Default pink/red
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
    borderBottomLeftRadius: metrics.borderRadiusHuge,
    borderBottomRightRadius: metrics.borderRadiusHuge,
    paddingTop: 50, // Space for status bar
    paddingHorizontal: metrics.large,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  childrenContainer: {
    marginTop: metrics.medium,
  },
})
