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
import { colors, fonts, spacing, radii } from '@/themes'
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
            colors={[colors.primaryContainer, colors.primary]}
            style={styles.selectGradient}
          >
            <ThemedText style={styles.selectButtonText}>Select</ThemedText>
            <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
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
                <Ionicons name="close-circle" size={32} color={colors.onSurface} />
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
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  closeButton: {
    padding: spacing.xs,
  },
  gridRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  gridContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  pokemonCard: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: spacing.md,
  },
  cardPanel: {
    padding: spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.secondaryContainer,
  },
  levelText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  pokemonInfo: {
    gap: spacing.xs,
  },
  pokemonName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  pokemonSpecies: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  hpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
    backgroundColor: colors.success,
  },
  hpText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    minWidth: 35,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
  selectButton: {
    marginTop: spacing.md,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  selectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
  },
  emptyContainer: {
    flex: 1,
    padding: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPanel: {
    padding: spacing['3xl'],
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
})
