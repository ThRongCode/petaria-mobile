/**
 * DirectionControls Component
 * Single Responsibility: Provide directional movement controls
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Direction } from '../types'

interface DirectionControlsProps {
  onMove: (direction: Direction) => void
  disabled?: boolean
}

export const DirectionControls: React.FC<DirectionControlsProps> = ({
  onMove,
  disabled = false,
}) => {
  const renderButton = (direction: Direction, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.directionButton, disabled && styles.disabledButton]}
      onPress={() => onMove(direction)}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? ['rgba(100,100,100,0.3)', 'rgba(50,50,50,0.3)'] : ['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.1)']}
        style={styles.buttonGradient}
      >
        <ThemedText style={styles.directionIcon}>{icon}</ThemedText>
        <ThemedText style={[styles.directionLabel, disabled && styles.disabledText]}>
          {label}
        </ThemedText>
      </LinearGradient>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Choose a direction to explore</ThemedText>

      <View style={styles.controlsGrid}>
        {/* Up */}
        <View style={styles.topRow}>
          {renderButton('up', 'Up', '↑')}
        </View>

        {/* Left and Right */}
        <View style={styles.middleRow}>
          {renderButton('left', 'Left', '←')}
          {renderButton('right', 'Right', '→')}
        </View>

        {/* Down */}
        <View style={styles.bottomRow}>
          {renderButton('down', 'Down', '↓')}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  controlsGrid: {
    alignItems: 'center',
    gap: 8,
  },
  topRow: {
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    gap: 60,
  },
  bottomRow: {
    alignItems: 'center',
  },
  directionButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  directionIcon: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  directionLabel: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  disabledText: {
    color: 'rgba(100, 100, 100, 0.8)',
  },
})
