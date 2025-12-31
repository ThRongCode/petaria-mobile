import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'

interface StatsTabProps {
  pet: Pet
}

export const StatsTab: React.FC<StatsTabProps> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Base Stats</ThemedText>
    
    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>HP</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.hp / 200) * 100}%`, backgroundColor: '#4CAF50' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.hp}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Attack</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.attack / 200) * 100}%`, backgroundColor: '#FF5722' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.attack}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Defense</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.defense / 200) * 100}%`, backgroundColor: '#2196F3' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.defense}</ThemedText>
    </View>

    <View style={styles.statRow}>
      <ThemedText style={styles.statName}>Speed</ThemedText>
      <View style={styles.statBarBackground}>
        <View 
          style={[styles.statBarFill, { width: `${(pet.stats.speed / 200) * 100}%`, backgroundColor: '#FFC107' }]} 
        />
      </View>
      <ThemedText style={styles.statValue}>{pet.stats.speed}</ThemedText>
    </View>
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
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    width: 80,
  },
  statBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    width: 40,
    textAlign: 'right',
  },
})
