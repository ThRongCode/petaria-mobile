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
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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
            colors={[colors.success, '#2E7D32']}
            style={styles.actionGradient}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.onSurface} />
            <ThemedText style={styles.actionText}>Complete Hunt</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.actionButton} onPress={onExit}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.actionGradient}
          >
            <Ionicons name="pause" size={20} color={colors.onSurface} />
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
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    marginBottom: spacing.xs,
  },
  regionSubtitle: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  movesContainer: {
    alignItems: 'flex-end',
  },
  movesLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  movesValue: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.sm,
  },
  actionText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})
