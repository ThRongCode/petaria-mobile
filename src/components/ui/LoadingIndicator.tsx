import React from 'react'
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, spacing } from '@/themes'

interface LoadingIndicatorProps {
  /** Loading message to display */
  message?: string
  /** Size of the spinner */
  size?: 'small' | 'large'
  /** Color of the spinner */
  color?: string
  /** Whether to show full screen overlay */
  fullScreen?: boolean
  /** Custom container style */
  style?: ViewStyle
  /** Show pokeball icon instead of spinner */
  showPokeball?: boolean
}

/**
 * Custom Loading Indicator component
 * 
 * Usage:
 * - Inline: <LoadingIndicator message="Loading..." />
 * - Full screen: <LoadingIndicator fullScreen message="Loading..." />
 * - Small button: <LoadingIndicator size="small" />
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 'large',
  color = colors.primary,
  fullScreen = false,
  style,
  showPokeball = false,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      {showPokeball ? (
        <View style={styles.pokeballContainer}>
          <Ionicons name="ellipse" size={size === 'large' ? 50 : 30} color={color} />
        </View>
      ) : (
        <ActivityIndicator size={size} color={color} />
      )}
      {message && (
        <ThemedText style={[styles.message, { color: fullScreen ? colors.onSurface : colors.onSurfaceVariant }]}>
          {message}
        </ThemedText>
      )}
    </View>
  )

  if (fullScreen) {
    return (
      <View style={styles.fullScreenOverlay}>
        <LinearGradient
          colors={['rgba(10, 14, 26, 0.7)', 'rgba(10, 14, 26, 0.95)']}
          style={styles.gradientOverlay}
        />
        {content}
      </View>
    )
  }

  return content
}

/**
 * Inline loading indicator for buttons or small areas
 */
export const InlineLoadingIndicator: React.FC<{
  color?: string
  size?: number
}> = ({ color = colors.onSurface, size = 20 }) => (
  <ActivityIndicator size={size} color={color} />
)

/**
 * Loading container with consistent styling for screens
 */
export const LoadingContainer: React.FC<{
  message?: string
  color?: string
}> = ({ message = 'Loading...', color = colors.primary }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={color} />
    <ThemedText style={styles.loadingText}>{message}</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pokeballContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Standard loading container style (can be used in screens)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
  },
})

export default LoadingIndicator
