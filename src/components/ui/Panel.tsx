import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface PanelProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'dark' | 'light' | 'transparent'
  gradient?: boolean
}

/**
 * Panel component - Reusable container with dark semi-transparent background
 * Used throughout the app for cards, menus, and content containers
 */
export const Panel: React.FC<PanelProps> = ({ 
  children, 
  style, 
  variant = 'dark',
  gradient = false 
}) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
        style={[styles.panel, styles[variant], style]}
      >
        {children}
      </LinearGradient>
    )
  }

  return (
    <View style={[styles.panel, styles[variant], style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  transparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
})
