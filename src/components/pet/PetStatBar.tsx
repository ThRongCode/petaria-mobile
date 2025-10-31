/**
 * PetStatBar Component
 * 
 * Displays a stat with name, value, and visual dot-based progress indicator
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'

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
  color = '#F8D030' // Yellow by default
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
                : { backgroundColor: colors.disabled }
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.medium,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.xxs,
  },
  statName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginRight: metrics.small,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
})
