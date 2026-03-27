/**
 * EmptyState Component
 * 
 * Generic empty state component for lists
 * Extracted from PetsScreen for reusability
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  buttonText?: string
  buttonIcon?: keyof typeof Ionicons.glyphMap
  onButtonPress?: () => void
  buttonColors?: [string, string]
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  buttonText,
  buttonIcon,
  onButtonPress,
  buttonColors = [colors.secondaryContainer, colors.warning],
}) => {
  return (
    <View style={styles.container}>
      <Panel variant="dark" style={styles.panel}>
        <ThemedText style={styles.icon}>{icon}</ThemedText>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        
        {buttonText && onButtonPress && (
          <TouchableOpacity style={styles.button} onPress={onButtonPress}>
            <LinearGradient
              colors={buttonColors}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {buttonIcon && <Ionicons name={buttonIcon} size={20} color={colors.onSurface} />}
              <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Panel>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})
