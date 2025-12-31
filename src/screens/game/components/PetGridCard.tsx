/**
 * PetGridCard Component
 * 
 * Grid card for displaying a pet in the collection view
 * Extracted from PetsScreen for better maintainability
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import type { Pet } from '@/stores/types/game'

interface PetGridCardProps {
  pet: Pet
  onPress: (pet: Pet) => void
  onToggleFavorite: (pet: Pet, event: any) => void
  isTogglingFavorite: boolean
}

// Get color for Pokemon type
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    fire: '#F44336',
    water: '#2196F3',
    grass: '#4CAF50',
    electric: '#FFEB3B',
    psychic: '#E91E63',
    ice: '#00BCD4',
    fighting: '#FF5722',
    normal: '#9E9E9E',
    flying: '#03A9F4',
    poison: '#7B1FA2',
    ground: '#795548',
    rock: '#5D4037',
    bug: '#8BC34A',
    ghost: '#673AB7',
    steel: '#607D8B',
    dragon: '#3F51B5',
    dark: '#424242',
    fairy: '#E91E63',
  }
  return colors[type.toLowerCase()] || '#999'
}

export const PetGridCard: React.FC<PetGridCardProps> = ({
  pet,
  onPress,
  onToggleFavorite,
  isTogglingFavorite,
}) => {
  // Use type from API, fallback to Normal
  const petType = pet.type || 'Normal'
  // Get primary type (first type if dual-typed like "Fire/Flying")
  const primaryType = petType.split('/')[0]

  // Get HP bar color based on HP percentage
  const getHpBarColor = () => {
    const hpPercent = pet.stats.hp / pet.stats.maxHp
    if (hpPercent > 0.5) return '#4CAF50'
    if (hpPercent > 0.2) return '#FFA726'
    return '#F44336'
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(pet)}>
      <Panel variant="dark" style={styles.panel}>
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getPokemonImage(pet.species) as any}
            style={styles.image}
            resizeMode="contain"
          />
          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
          </View>
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => onToggleFavorite(pet, e)}
            disabled={isTogglingFavorite}
          >
            {isTogglingFavorite ? (
              <ActivityIndicator size="small" color="#FFD700" />
            ) : (
              <Ionicons
                name={pet.isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={pet.isFavorite ? '#FFD700' : '#FFFFFF'}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Pet Info */}
        <View style={styles.info}>
          {/* Name Row with Type Badge */}
          <View style={styles.nameRow}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(primaryType) }]}>
              <ThemedText style={styles.typeText}>{primaryType}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.species} numberOfLines={1}>
            {pet.species}
          </ThemedText>

          {/* HP Bar */}
          <View style={styles.hpBarContainer}>
            <ThemedText style={styles.hpLabel}>HP</ThemedText>
            <View style={styles.hpBarOuter}>
              <View
                style={[
                  styles.hpBarInner,
                  {
                    width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%`,
                    backgroundColor: getHpBarColor(),
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.hpValue}>
              {pet.stats.hp}/{pet.stats.maxHp}
            </ThemedText>
          </View>

          {/* XP Bar */}
          <View style={styles.xpBarContainer}>
            <ThemedText style={styles.xpLabel}>XP</ThemedText>
            <View style={styles.xpBarOuter}>
              <View
                style={[
                  styles.xpBarInner,
                  {
                    width: `${(pet.xpToNext ?? pet.level * 100) > 0 ? ((pet.xp ?? 0) / (pet.xpToNext ?? pet.level * 100)) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.xpValue}>
              {pet.xp ?? 0}/{pet.xpToNext ?? pet.level * 100}
            </ThemedText>
          </View>

          {/* Stats Preview */}
          <View style={styles.statsPreview}>
            <View style={styles.statMini}>
              <Ionicons name="flash" size={12} color="#FFA726" />
              <ThemedText style={styles.statMiniText}>{pet.stats.attack}</ThemedText>
            </View>
            <View style={styles.statMini}>
              <Ionicons name="shield" size={12} color="#2196F3" />
              <ThemedText style={styles.statMiniText}>{pet.stats.defense}</ThemedText>
            </View>
            <View style={styles.statMini}>
              <Ionicons name="speedometer" size={12} color="#9C27B0" />
              <ThemedText style={styles.statMiniText}>{pet.stats.speed}</ThemedText>
            </View>
          </View>
        </View>
      </Panel>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  panel: {
    padding: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
  },
  levelBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  info: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  species: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  hpLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold',
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
  },
  hpValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'right',
  },
  xpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  xpLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold',
  },
  xpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    backgroundColor: '#64B5F6',
  },
  xpValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'right',
  },
  statsPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statMiniText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
})
