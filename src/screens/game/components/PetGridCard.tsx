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
import { colors, typeColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface PetGridCardProps {
  pet: Pet
  onPress: (pet: Pet) => void
  onToggleFavorite: (pet: Pet, event: any) => void
  isTogglingFavorite: boolean
}

// Get color for Pokemon type
const getTypeColor = (type: string): string => {
  return typeColors[type.toLowerCase()] ?? '#9E9E9E'
}

function getHpBarColor(currentHp: number, maxHp: number): string {
  const hpPercent = currentHp / maxHp
  if (hpPercent > 0.5) return colors.success
  if (hpPercent > 0.2) return colors.warning
  return colors.error
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
              <ActivityIndicator size="small" color={colors.secondaryContainer} />
            ) : (
              <Ionicons
                name={pet.isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={pet.isFavorite ? colors.secondaryContainer : colors.onSurface}
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
                    backgroundColor: getHpBarColor(pet.stats.hp, pet.stats.maxHp),
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
    marginBottom: spacing.md,
  },
  panel: {
    padding: spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    backgroundColor: 'rgba(10, 14, 26, 0.8)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.secondaryContainer,
  },
  levelText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.lg,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  typeBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textTransform: 'capitalize',
  },
  species: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  hpLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
  hpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
  },
  hpValue: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    minWidth: 30,
    textAlign: 'right',
  },
  xpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  xpLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
  xpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarInner: {
    height: '100%',
    backgroundColor: colors.info,
  },
  xpValue: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    minWidth: 30,
    textAlign: 'right',
  },
  statsPreview: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 6,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statMiniText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
})
