/**
 * SessionHeader Component
 * Single Responsibility: Display hunt session header with region info and moves left
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { HuntSession } from '../types'

interface SessionHeaderProps {
  session: HuntSession | null
  regionName?: string
  movesLeft: number
  onComplete: () => void
  onExit: () => void
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  regionName,
  movesLeft,
  onComplete,
  onExit,
}) => {
  const displayRegionName = session?.region.name || regionName || 'Unknown Region'

  return (
    <Panel variant="dark" style={styles.container}>
      <View style={styles.regionInfo}>
        <ThemedText style={styles.regionName}>{displayRegionName}</ThemedText>
        <ThemedText style={styles.regionSubtitle}>Dungeon Exploration</ThemedText>
      </View>

      <View style={styles.movesContainer}>
        <ThemedText style={styles.movesLabel}>Actions Left</ThemedText>
        <ThemedText style={styles.movesValue}>{movesLeft}</ThemedText>
      </View>
    </Panel>
  )
}

interface SessionActionsProps {
  onComplete: () => void
  onExit: () => void
  movesLeft: number
}

export const SessionActions: React.FC<SessionActionsProps> = ({
  onComplete,
  onExit,
  movesLeft,
}) => {
  return (
    <View style={styles.actionsContainer}>
      {movesLeft === 0 ? (
        <TouchableOpacity style={styles.actionButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            style={styles.actionGradient}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <ThemedText style={styles.actionText}>Complete Hunt</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={onExit}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.actionGradient}
          >
            <Ionicons name="pause" size={20} color="#fff" />
            <ThemedText style={styles.actionText}>Pause & Exit</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  regionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  movesContainer: {
    alignItems: 'flex-end',
  },
  movesLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  movesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})
