import React from 'react'
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

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
  color = '#FFD700',
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
        <ThemedText style={[styles.message, { color: fullScreen ? '#fff' : 'rgba(255, 255, 255, 0.7)' }]}>
          {message}
        </ThemedText>
      )}
    </View>
  )

  if (fullScreen) {
    return (
      <View style={styles.fullScreenOverlay}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
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
}> = ({ color = '#fff', size = 20 }) => (
  <ActivityIndicator size={size} color={color} />
)

/**
 * Loading container with consistent styling for screens
 */
export const LoadingContainer: React.FC<{
  message?: string
  color?: string
}> = ({ message = 'Loading...', color = '#FFD700' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={color} />
    <ThemedText style={styles.loadingText}>{message}</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})

export default LoadingIndicator
