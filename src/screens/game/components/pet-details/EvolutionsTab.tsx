import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel, LoadingContainer } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Pet } from '@/stores/types/game'
import { getPokemonImage } from '@/assets/images'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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
                      color={levelMet ? colors.success : colors.error} 
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
                        color={evolution.hasItem ? colors.success : colors.error} 
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
                    colors={canEvolve ? [colors.secondaryContainer, colors.warning] : [colors.surfaceContainerHighest, colors.surfaceContainerHigh]}
                    style={styles.evolveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name="sparkles" 
                      size={18} 
                      color={canEvolve ? colors.surfaceContainerLowest : colors.onSurfaceVariant} 
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
          <Ionicons name="help-circle-outline" size={48} color={colors.onSurfaceVariant} />
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
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  evolutionStatusCard: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  evolutionStageIndicator: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stageDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  stageDotFilled: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stageDotCurrent: {
    borderColor: colors.secondaryContainer,
    shadowColor: colors.secondaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  evolutionStageText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  fullyEvolvedBadge: {
    backgroundColor: 'rgba(255, 219, 60, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondaryContainer,
  },
  fullyEvolvedText: {
    color: colors.secondaryContainer,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  evolutionSection: {
    marginBottom: spacing.lg,
  },
  evolutionSectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  evolutionFromCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  evolutionFromName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  evolutionCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  evolutionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
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
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  evolutionDescription: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  requirementsList: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  requirementMet: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  requirementText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.error,
    flex: 1,
  },
  requirementTextMet: {
    color: colors.success,
  },
  evolveButton: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  evolveButtonDisabled: {
    opacity: 0.7,
  },
  evolveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  evolveButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.surfaceContainerLowest,
  },
  evolveButtonTextDisabled: {
    color: colors.onSurfaceVariant,
  },
  noEvolutionContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noEvolutionText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.md,
  },
})
