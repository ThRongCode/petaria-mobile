/**
 * EmptyState — "Lapis Glassworks" glass empty state card
 *
 * Generic empty state with glass panel, centered icon, and optional CTA.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

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
  buttonColors = [...gradientPrimary] as [string, string],
}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      {/* Decorative glow */}
      <View style={styles.glowDot} />

      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>

      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress} activeOpacity={0.8}>
          <LinearGradient
            colors={buttonColors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {buttonIcon && <Ionicons name={buttonIcon} size={18} color={colors.onPrimary} />}
            <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.xl,
    padding: spacing['3xl'],
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  glowDot: {
    position: 'absolute',
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(68, 216, 241, 0.06)',
  },
  icon: { fontSize: 56, marginBottom: spacing.lg },
  title: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: { borderRadius: radii.md, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  buttonText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
  },
})