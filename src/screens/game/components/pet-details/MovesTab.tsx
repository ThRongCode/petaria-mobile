import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'

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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  moveCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moveName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  movePpBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  movePpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  moveStats: {
    flexDirection: 'row',
    gap: 12,
  },
  moveStatItem: {
    flex: 1,
  },
  moveStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  moveStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 24,
  },
})
