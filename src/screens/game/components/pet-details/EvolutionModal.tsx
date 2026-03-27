import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { Pet } from '@/stores/types/game'
import Ionicons from '@expo/vector-icons/Ionicons'
import { EvolutionPath } from './EvolutionsTab'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface EvolutionModalProps {
  visible: boolean
  pet: Pet
  selectedEvolution: EvolutionPath | null
  evolving: boolean
  onClose: () => void
  onEvolve: (evolution: EvolutionPath, itemId: string) => void
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  visible,
  pet,
  selectedEvolution,
  evolving,
  onClose,
  onEvolve,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Panel variant="dark" style={styles.modalPanel}>
          <ThemedText style={styles.modalTitle}>🌟 Evolve Pet?</ThemedText>
          
          {selectedEvolution && (
            <>
              <View style={styles.evolutionPreview}>
                <View style={styles.evolutionPetPreview}>
                  <Image
                    source={getPokemonImage(pet.species) as any}
                    style={styles.evolutionImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.evolutionPetName}>{pet.species}</ThemedText>
                </View>
                
                <Ionicons name="arrow-forward" size={32} color={colors.secondaryContainer} />
                
                <View style={styles.evolutionPetPreview}>
                  <Image
                    source={getPokemonImage(selectedEvolution.evolvesTo) as any}
                    style={styles.evolutionImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.evolutionPetName}>{selectedEvolution.evolvesTo}</ThemedText>
                </View>
              </View>
              
              {selectedEvolution.itemRequired && (
                <View style={styles.itemCostRow}>
                  <Ionicons name="diamond" size={20} color={colors.tertiary} />
                  <ThemedText style={styles.itemCostText}>
                    Will use 1x {selectedEvolution.itemRequired.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </ThemedText>
                </View>
              )}
              
              <ThemedText style={styles.modalDescription}>
                This action cannot be undone. Your pet will transform into {selectedEvolution.evolvesTo} and gain new stats!
              </ThemedText>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={evolving}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.evolveButtonModal]}
                  onPress={() => onEvolve(selectedEvolution, selectedEvolution.itemRequired || '')}
                  disabled={evolving}
                >
                  {evolving ? (
                    <ActivityIndicator size="small" color={colors.onSurface} />
                  ) : (
                    <ThemedText style={styles.evolveButtonText}>✨ Evolve!</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Panel>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.xl,
    borderRadius: radii.xl,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  evolutionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  evolutionPetPreview: {
    alignItems: 'center',
  },
  evolutionImage: {
    width: 80,
    height: 80,
  },
  evolutionPetName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  itemCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  itemCostText: {
    color: colors.tertiary,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cancelButtonText: {
    color: colors.onSurface,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  evolveButtonModal: {
    backgroundColor: colors.secondaryContainer,
  },
  evolveButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.surfaceContainerLowest,
  },
})
