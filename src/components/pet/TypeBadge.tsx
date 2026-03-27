/**
 * TypeBadge Component
 * 
 * Displays a Pokemon type badge with appropriate styling and color
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { TYPE_COLORS, PokemonType } from './types'
import { radii, spacing, fonts } from '@/themes'

interface TypeBadgeProps {
  type: PokemonType
  size?: 'small' | 'medium' | 'large'
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'medium' }) => {
  const backgroundColor = TYPE_COLORS[type]
  
  return (
    <View style={[styles.badge, styles[size], { backgroundColor }]}>
      <ThemedText style={[styles.text, styles[`${size}Text`]]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
})
