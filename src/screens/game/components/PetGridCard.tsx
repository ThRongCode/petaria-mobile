/**
 * PetGridCard — "Lapis Glassworks" glass pet card
 *
 * Grid card for displaying a pet in the collection view.
 * Uses glass panel, gradient HP/XP bars, type badge, and glow effects.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getPokemonImage } from '@/assets/images'
import type { Pet } from '@/stores/types/game'
import { colors, typeColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary, gradientGold } from '@/themes/styles'

interface PetGridCardProps {
  pet: Pet
  onPress: (pet: Pet) => void
  onToggleFavorite: (pet: Pet, event: any) => void
  isTogglingFavorite: boolean
}

const getTypeColor = (type: string): string =>
  typeColors[type.toLowerCase()] ?? '#9E9E9E'

function getHpColor(current: number, max: number): string {
  const pct = current / max
  if (pct > 0.5) return colors.success
  if (pct > 0.2) return colors.warning
  return colors.error
}

export const PetGridCard: React.FC<PetGridCardProps> = ({
  pet,
  onPress,
  onToggleFavorite,
  isTogglingFavorite,
}) => {
  const primaryType = (pet.type || 'Normal').split('/')[0]
  const hpPct = Math.min((pet.stats.hp / pet.stats.maxHp) * 100, 100)
  const xpMax = pet.xpToNext ?? pet.level * 100 // fallback matches petXpPerLevel in game-constants.json
  const xpPct = xpMax > 0 ? Math.min(((pet.xp ?? 0) / xpMax) * 100, 100) : 0

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(pet)} activeOpacity={0.7}>
      <View style={styles.card}>
        {/* ── Pet Image ──────────────────────────────────── */}
        <View style={styles.imageSection}>
          <Image
            source={getPokemonImage(pet.species) as any}
            style={styles.sprite}
            resizeMode="contain"
          />

          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
          </View>

          {/* Favorite */}
          <TouchableOpacity
            style={styles.favButton}
            onPress={(e) => onToggleFavorite(pet, e)}
            disabled={isTogglingFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isTogglingFavorite ? (
              <ActivityIndicator size="small" color={colors.secondaryContainer} />
            ) : (
              <Ionicons
                name={pet.isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={pet.isFavorite ? colors.secondaryContainer : colors.onSurfaceVariant}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Info ───────────────────────────────────────── */}
        <View style={styles.info}>
          {/* Name + Type */}
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
          <View style={styles.barRow}>
            <ThemedText style={styles.barLabel}>HP</ThemedText>
            <View style={styles.barTrack}>
              <LinearGradient
                colors={[getHpColor(pet.stats.hp, pet.stats.maxHp), getHpColor(pet.stats.hp, pet.stats.maxHp) + '99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${hpPct}%` }]}
              />
            </View>
            <ThemedText style={styles.barValue}>
              {pet.stats.hp}/{pet.stats.maxHp}
            </ThemedText>
          </View>

          {/* XP Bar */}
          <View style={styles.barRow}>
            <ThemedText style={styles.barLabel}>XP</ThemedText>
            <View style={styles.barTrack}>
              <LinearGradient
                colors={[...gradientGold] as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${xpPct}%` }]}
              />
            </View>
            <ThemedText style={styles.barValue}>
              {pet.xp ?? 0}/{xpMax}
            </ThemedText>
          </View>

          {/* Mini Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="flash" size={10} color={colors.warning} />
              <ThemedText style={styles.statText}>{pet.stats.attack}</ThemedText>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="shield" size={10} color={colors.info} />
              <ThemedText style={styles.statText}>{pet.stats.defense}</ThemedText>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="speedometer" size={10} color={colors.tertiary} />
              <ThemedText style={styles.statText}>{pet.stats.speed}</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },

  // ── Image ──────────────────────────────────────
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  sprite: { width: 90, height: 90 },
  levelBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
  },
  levelText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  favButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.md,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },

  // ── Info ───────────────────────────────────────
  info: { gap: 3 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    flexShrink: 1,
  },
  typeBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  typeText: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textTransform: 'capitalize',
  },
  species: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },

  // ── Bars ───────────────────────────────────────
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  barLabel: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    width: 16,
  },
  barTrack: {
    flex: 1,
    height: 5,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  barValue: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    minWidth: 28,
    textAlign: 'right',
  },

  // ── Stats ──────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
})