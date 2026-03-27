/**
 * PetStatBar Component
 * 
 * Displays a stat with name, value, and visual dot-based progress indicator
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, fonts, spacing, radii } from '@/themes'

interface PetStatBarProps {
  name: string
  value: number
  maxValue?: number
  color?: string
}

const MAX_DOTS = 15

export const PetStatBar: React.FC<PetStatBarProps> = ({ 
  name, 
  value, 
  maxValue = 150,
  color = colors.secondaryContainer // Gold default
}) => {
  // Calculate how many dots should be filled
  const filledDots = Math.round((value / maxValue) * MAX_DOTS)
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.statName}>{name}</ThemedText>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
      </View>
      
      <View style={styles.dotsContainer}>
        {Array.from({ length: MAX_DOTS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < filledDots 
                ? { backgroundColor: color }
                : { backgroundColor: colors.surfaceContainerHighest }
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statName: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginRight: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
})
