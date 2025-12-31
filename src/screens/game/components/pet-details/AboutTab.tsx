import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { Pet } from '@/stores/types/game'

interface AboutTabProps {
  pet: Pet
}

export const AboutTab: React.FC<AboutTabProps> = ({ pet }) => (
  <Panel variant="dark" style={styles.tabPanel}>
    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
    <ThemedText style={styles.description}>
      A powerful {pet.species} with incredible abilities. Known for its strength and loyalty in battles.
    </ThemedText>
    
    <View style={styles.infoGrid}>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>⚔️ Attack</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.attack}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>🛡️ Defense</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.defense}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>⚡ Speed</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.stats.speed}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>✨ Experience</ThemedText>
        <View style={styles.xpProgressContainer}>
          <View style={styles.xpProgressBar}>
            <View 
              style={[
                styles.xpProgressFill, 
                { width: `${(pet.xp / pet.xpToNext) * 100}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.xpProgressText}>
            {pet.xp} / {pet.xpToNext} XP
          </ThemedText>
        </View>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>🌟 Rarity</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.rarity}</ThemedText>
      </View>
      <View style={styles.infoItem}>
        <ThemedText style={styles.infoLabel}>😊 Mood</ThemedText>
        <ThemedText style={styles.infoValue}>{pet.mood}/100</ThemedText>
      </View>
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  xpProgressContainer: {
    marginTop: 4,
    gap: 4,
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  xpProgressText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'right',
  },
})
