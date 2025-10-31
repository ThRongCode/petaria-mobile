/**
 * TypeBadge Component
 * 
 * Displays a Pokemon type badge with appropriate styling and color
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { TYPE_COLORS, PokemonType } from './types'
import { metrics } from '@/themes'

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
    borderRadius: metrics.borderRadius,
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: metrics.tiny,
    paddingVertical: 2,
    borderRadius: metrics.borderRadius,
  },
  medium: {
    paddingHorizontal: metrics.small,
    paddingVertical: metrics.tiny,
  },
  large: {
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.small,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
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
