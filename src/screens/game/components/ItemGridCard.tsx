/**
 * ItemGridCard — "Lapis Glassworks" glass item card
 *
 * Grid card for displaying an item in the inventory view.
 * Uses glass panel, rarity gradient accent bar, quantity badge.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getItemImage } from '@/assets/images'
import type { Item } from '@/stores/types/game'
import { colors, rarityGradients } from '@/themes/colors'
import { getRarityColor } from '@/features/hunt/utils'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface ItemGridCardProps {
  item: Item & { quantity?: number }
  onPress: (item: Item) => void
}

const getRarityGradient = (rarity: string): readonly [string, string] =>
  rarityGradients[rarity.toLowerCase() as keyof typeof rarityGradients] ?? rarityGradients.common

export const ItemGridCard: React.FC<ItemGridCardProps> = ({ item, onPress }) => {
  const rarityColor = getRarityColor(item.rarity)
  const gradient = getRarityGradient(item.rarity)

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.card}>
        {/* Rarity accent bar */}
        <LinearGradient
          colors={[...gradient] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.rarityBar}
        />

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getItemImage(item.id || item.name)}
            style={styles.image}
            resizeMode="contain"
          />
          {/* Quantity */}
          {item.quantity != null && item.quantity > 1 && (
            <View style={styles.quantityBadge}>
              <ThemedText style={styles.quantityText}>x{item.quantity}</ThemedText>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={styles.type}>{item.type}</ThemedText>

          <View style={[styles.rarityBadge, { backgroundColor: `${rarityColor}25` }]}>
            <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
              {item.rarity}
            </ThemedText>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            {item.price.coins != null && item.price.coins > 0 && (
              <View style={styles.priceChip}>
                <Ionicons name="cash" size={11} color={colors.secondaryContainer} />
                <ThemedText style={styles.priceValue}>{item.price.coins}</ThemedText>
              </View>
            )}
            {item.price.gems != null && item.price.gems > 0 && (
              <View style={styles.priceChip}>
                <Ionicons name="diamond" size={11} color={colors.primary} />
                <ThemedText style={styles.priceValue}>{item.price.gems}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },

  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },

  imageContainer: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    position: 'relative',
  },
  image: { width: 60, height: 60 },
  quantityBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  quantityText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },

  info: { gap: spacing.xs },
  name: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  type: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  rarityText: {
    fontSize: fontSizes.micro,
    fontFamily: fonts.bold,
    textTransform: 'capitalize',
  },

  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.glass.subtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  priceValue: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.secondaryContainer,
  },
})