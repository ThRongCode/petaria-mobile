import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { Pet } from '@/stores/types/game'
import Ionicons from '@expo/vector-icons/Ionicons'
import { EvolutionPath } from './EvolutionsTab'

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
                
                <Ionicons name="arrow-forward" size={32} color="#FFD700" />
                
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
                  <Ionicons name="diamond" size={20} color="#9C27B0" />
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
                    <ActivityIndicator size="small" color="#fff" />
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalPanel: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  evolutionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
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
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  itemCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(156,39,176,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemCostText: {
    color: '#CE93D8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  evolveButtonModal: {
    backgroundColor: '#FFD700',
  },
  evolveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
})
