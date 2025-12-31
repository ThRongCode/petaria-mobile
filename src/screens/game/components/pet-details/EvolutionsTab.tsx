import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel, LoadingContainer } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Pet } from '@/stores/types/game'
import { getPokemonImage } from '@/assets/images'
import Ionicons from '@expo/vector-icons/Ionicons'

// Evolution types for API response
export interface EvolutionPath {
  evolvesTo: string
  levelRequired: number
  itemRequired: string | null
  description?: string
  meetsLevelRequirement?: boolean
  hasItem: boolean
  itemQuantity: number | null
  canEvolveNow?: boolean
}

export interface EvolutionOptions {
  petId: string
  species: string
  level: number
  canEvolve: boolean
  canEvolveNow?: boolean
  currentStage: number
  maxStage: number
  evolvesFrom: string | null
  availableEvolutions: EvolutionPath[]
}

interface EvolutionsTabProps {
  pet: Pet
  evolutionOptions: EvolutionOptions | null
  loading: boolean
  onEvolve: (evolution: EvolutionPath) => void
}

export const EvolutionsTab: React.FC<EvolutionsTabProps> = ({ pet, evolutionOptions, loading, onEvolve }) => {
  if (loading) {
    return (
      <Panel variant="dark" style={styles.tabPanel}>
        <LoadingContainer message="Loading evolution data..." />
      </Panel>
    )
  }

  const isFullyEvolved = pet.evolutionStage >= pet.maxEvolutionStage

  return (
    <Panel variant="dark" style={styles.tabPanel}>
      <ThemedText style={styles.sectionTitle}>Evolution Chain</ThemedText>
      
      {/* Current Evolution Status */}
      <View style={styles.evolutionStatusCard}>
        <View style={styles.evolutionStageIndicator}>
          {Array.from({ length: pet.maxEvolutionStage }).map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.stageDot,
                idx < pet.evolutionStage && styles.stageDotFilled,
                idx === pet.evolutionStage - 1 && styles.stageDotCurrent
              ]} 
            />
          ))}
        </View>
        <ThemedText style={styles.evolutionStageText}>
          Stage {pet.evolutionStage} of {pet.maxEvolutionStage}
        </ThemedText>
        {isFullyEvolved && (
          <View style={styles.fullyEvolvedBadge}>
            <ThemedText style={styles.fullyEvolvedText}>✨ Fully Evolved!</ThemedText>
          </View>
        )}
      </View>

      {/* Previous Evolution */}
      {evolutionOptions?.evolvesFrom && (
        <View style={styles.evolutionSection}>
          <ThemedText style={styles.evolutionSectionTitle}>Evolved From</ThemedText>
          <View style={styles.evolutionFromCard}>
            <Image
              source={getPokemonImage(evolutionOptions.evolvesFrom) as any}
              style={styles.evolutionThumb}
              resizeMode="contain"
            />
            <ThemedText style={styles.evolutionFromName}>{evolutionOptions.evolvesFrom}</ThemedText>
          </View>
        </View>
      )}

      {/* Available Evolutions */}
      {!isFullyEvolved && evolutionOptions?.availableEvolutions && evolutionOptions.availableEvolutions.length > 0 && (
        <View style={styles.evolutionSection}>
          <ThemedText style={styles.evolutionSectionTitle}>Available Evolutions</ThemedText>
          
          {evolutionOptions.availableEvolutions.map((evolution, idx) => {
            const canEvolve = evolution.canEvolveNow
            const levelMet = evolution.meetsLevelRequirement
            
            return (
              <View key={idx} style={styles.evolutionCard}>
                <View style={styles.evolutionCardHeader}>
                  <Image
                    source={getPokemonImage(evolution.evolvesTo) as any}
                    style={styles.evolutionThumb}
                    resizeMode="contain"
                  />
                  <View style={styles.evolutionCardInfo}>
                    <ThemedText style={styles.evolutionName}>{evolution.evolvesTo}</ThemedText>
                    {evolution.description && (
                      <ThemedText style={styles.evolutionDescription}>{evolution.description}</ThemedText>
                    )}
                  </View>
                </View>
                
                {/* Requirements */}
                <View style={styles.requirementsList}>
                  <View style={[styles.requirementRow, levelMet && styles.requirementMet]}>
                    <Ionicons 
                      name={levelMet ? "checkmark-circle" : "close-circle"} 
                      size={18} 
                      color={levelMet ? "#4CAF50" : "#FF5722"} 
                    />
                    <ThemedText style={[styles.requirementText, levelMet && styles.requirementTextMet]}>
                      Level {evolution.levelRequired} {levelMet ? '✓' : `(Current: ${pet.level})`}
                    </ThemedText>
                  </View>
                  
                  {evolution.itemRequired && (
                    <View style={[styles.requirementRow, evolution.hasItem && styles.requirementMet]}>
                      <Ionicons 
                        name={evolution.hasItem ? "checkmark-circle" : "close-circle"} 
                        size={18} 
                        color={evolution.hasItem ? "#4CAF50" : "#FF5722"} 
                      />
                      <ThemedText style={[styles.requirementText, evolution.hasItem && styles.requirementTextMet]}>
                        {evolution.itemRequired.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {evolution.hasItem 
                          ? ` ✓ (${evolution.itemQuantity} owned)` 
                          : ' (Not owned - buy in shop!)'}
                      </ThemedText>
                    </View>
                  )}
                </View>
                
                {/* Evolve Button */}
                <TouchableOpacity
                  style={[styles.evolveButton, !canEvolve && styles.evolveButtonDisabled]}
                  onPress={() => canEvolve && onEvolve(evolution)}
                  disabled={!canEvolve}
                >
                  <LinearGradient
                    colors={canEvolve ? ['#FFD700', '#FFA000'] : ['#555', '#333']}
                    style={styles.evolveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name="sparkles" 
                      size={18} 
                      color={canEvolve ? '#000' : '#888'} 
                    />
                    <ThemedText style={[styles.evolveButtonText, !canEvolve && styles.evolveButtonTextDisabled]}>
                      {canEvolve ? 'Evolve Now!' : 'Requirements Not Met'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      )}

      {/* No Evolutions Available */}
      {!isFullyEvolved && (!evolutionOptions?.availableEvolutions || evolutionOptions.availableEvolutions.length === 0) && (
        <View style={styles.noEvolutionContainer}>
          <Ionicons name="help-circle-outline" size={48} color="rgba(255,255,255,0.3)" />
          <ThemedText style={styles.noEvolutionText}>
            No evolution data available for this species.
          </ThemedText>
        </View>
      )}
    </Panel>
  )
}

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
  evolutionStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionStageIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  stageDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stageDotFilled: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stageDotCurrent: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  evolutionStageText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  fullyEvolvedBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  fullyEvolvedText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  evolutionSection: {
    marginBottom: 20,
  },
  evolutionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  evolutionFromCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionFromName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  evolutionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  evolutionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  evolutionThumb: {
    width: 60,
    height: 60,
  },
  evolutionCardInfo: {
    flex: 1,
  },
  evolutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  evolutionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  requirementsList: {
    marginBottom: 12,
    gap: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,82,34,0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,82,34,0.3)',
  },
  requirementMet: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderColor: 'rgba(76,175,80,0.3)',
  },
  requirementText: {
    fontSize: 13,
    color: '#FF5722',
    flex: 1,
  },
  requirementTextMet: {
    color: '#4CAF50',
  },
  evolveButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  evolveButtonDisabled: {
    opacity: 0.7,
  },
  evolveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  evolveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  evolveButtonTextDisabled: {
    color: '#888',
  },
  noEvolutionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noEvolutionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
})
