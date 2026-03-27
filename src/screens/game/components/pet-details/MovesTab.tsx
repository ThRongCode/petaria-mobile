import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface MovesTabProps {
  pet: Pet
}

export const MovesTab: React.FC<MovesTabProps> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Known Moves</ThemedText>
    {pet.moves && pet.moves.length > 0 ? (
      pet.moves.map((move, index) => (
        <View key={index} style={styles.moveCard}>
          <View style={styles.moveHeader}>
            <ThemedText style={styles.moveName}>{move.name}</ThemedText>
            <View style={styles.movePpBadge}>
              <ThemedText style={styles.movePpText}>PP {move.pp}/{move.maxPp}</ThemedText>
            </View>
          </View>
          <View style={styles.moveStats}>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Power</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.power}</ThemedText>
            </View>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Accuracy</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.accuracy}%</ThemedText>
            </View>
            <View style={styles.moveStatItem}>
              <ThemedText style={styles.moveStatLabel}>Type</ThemedText>
              <ThemedText style={styles.moveStatValue}>{move.type}</ThemedText>
            </View>
          </View>
        </View>
      ))
    ) : (
      <ThemedText style={styles.emptyText}>No moves learned yet.</ThemedText>
    )}
  </Panel>
)

const styles = StyleSheet.create({
  tabPanel: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  moveCard: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moveName: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  movePpBadge: {
    backgroundColor: 'rgba(99, 144, 240, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.info,
  },
  movePpText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.info,
  },
  moveStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  moveStatItem: {
    flex: 1,
  },
  moveStatLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  moveStatValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
