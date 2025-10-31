import React from 'react'
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  FlatList,
  Image,
  Dimensions 
} from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from './Panel'
import { getPokemonImage } from '@/assets/images'
import type { Pet } from '@/stores/types/game'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface PokemonSelectionDialogProps {
  visible: boolean
  pets: Pet[]
  onSelect: (pet: Pet) => void
  onClose: () => void
  title?: string
}

/**
 * PokemonSelectionDialog - Modern Pokemon selection popup
 * Displays user's Pokemon in a grid for battle selection
 */
export const PokemonSelectionDialog: React.FC<PokemonSelectionDialogProps> = ({
  visible,
  pets,
  onSelect,
  onClose,
  title = 'Choose Your Pokemon'
}) => {
  const renderPokemonCard = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.pokemonCard}
      onPress={() => onSelect(pet)}
    >
      <Panel variant="dark" style={styles.cardPanel}>
        {/* Pokemon Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={getPokemonImage(pet.species) as any}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
        </View>

        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
        </View>

        {/* Pokemon Info */}
        <View style={styles.pokemonInfo}>
          <ThemedText style={styles.pokemonName} numberOfLines={1}>
            {pet.name}
          </ThemedText>
          <ThemedText style={styles.pokemonSpecies} numberOfLines={1}>
            {pet.species}
          </ThemedText>

          {/* HP Bar */}
          <View style={styles.hpBarContainer}>
            <View style={styles.hpBarOuter}>
              <View 
                style={[
                  styles.hpBarInner,
                  { width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%` }
                ]} 
              />
            </View>
            <ThemedText style={styles.hpText}>
              {pet.stats.hp}/{pet.stats.maxHp}
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flash" size={12} color="#FFA726" />
              <ThemedText style={styles.statText}>{pet.stats.attack}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="shield" size={12} color="#2196F3" />
              <ThemedText style={styles.statText}>{pet.stats.defense}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="speedometer" size={12} color="#9C27B0" />
              <ThemedText style={styles.statText}>{pet.stats.speed}</ThemedText>
            </View>
          </View>
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => onSelect(pet)}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.selectGradient}
          >
            <ThemedText style={styles.selectButtonText}>Select</ThemedText>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Panel>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <Panel variant="dark" style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <ThemedText style={styles.headerTitle}>{title}</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  {pets.length} Pokemon available
                </ThemedText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </Panel>

          {/* Pokemon Grid */}
          {pets.length > 0 ? (
            <FlatList
              data={pets}
              renderItem={renderPokemonCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Panel variant="dark" style={styles.emptyPanel}>
                <ThemedText style={styles.emptyIcon}>🎒</ThemedText>
                <ThemedText style={styles.emptyTitle}>No Pokemon Available</ThemedText>
                <ThemedText style={styles.emptyText}>
                  You need to catch Pokemon first!
                </ThemedText>
              </Panel>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 4,
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 12,
  },
  gridContent: {
    paddingVertical: 12,
    paddingBottom: 20,
  },
  pokemonCard: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  cardPanel: {
    padding: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  levelBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pokemonInfo: {
    gap: 4,
  },
  pokemonName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  pokemonSpecies: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  hpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  hpText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  selectButton: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPanel: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
})
