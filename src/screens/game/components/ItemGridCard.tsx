/**
 * ItemGridCard Component
 * 
 * Grid card for displaying an item in the inventory view
 * Extracted from PetsScreen for better maintainability
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { getItemImage } from '@/assets/images'
import type { Item } from '@/stores/types/game'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface ItemGridCardProps {
  item: Item & { quantity?: number }
  onPress: (item: Item) => void
}

const getRarityColor = (rarity: string): string => {
  return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
}

export const ItemGridCard: React.FC<ItemGridCardProps> = ({ item, onPress }) => {
  const rarityColor = getRarityColor(item.rarity)

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <Panel variant="dark" style={styles.panel}>
        {/* Rarity Indicator */}
        <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />

        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image source={getItemImage(item.id || item.name)} style={styles.image} resizeMode="contain" />
          {/* Quantity Badge */}
          {item.quantity && item.quantity > 1 && (
            <View style={styles.quantityBadge}>
              <ThemedText style={styles.quantityText}>x{item.quantity}</ThemedText>
            </View>
          )}
        </View>

        {/* Item Info */}
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.type}>{item.type}</ThemedText>
          <View style={[styles.rarityBadge, { backgroundColor: `${rarityColor}30` }]}>
            <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
              {item.rarity}
            </ThemedText>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {item.price.coins && item.price.coins > 0 && (
              <View style={styles.priceTag}>
                <Ionicons name="cash" size={12} color={colors.secondaryContainer} />
                <ThemedText style={styles.priceValue}>{item.price.coins}</ThemedText>
              </View>
            )}
            {item.price.gems && item.price.gems > 0 && (
              <View style={styles.priceTag}>
                <Ionicons name="diamond" size={12} color={colors.info} />
                <ThemedText style={styles.priceValue}>{item.price.gems}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </Panel>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: spacing.md,
  },
  panel: {
    padding: spacing.md,
    position: 'relative',
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.md,
    position: 'relative',
  },
  image: {
    width: 70,
    height: 70,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(10, 14, 26, 0.8)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  quantityText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  info: {
    gap: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  type: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  priceValue: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.secondaryContainer,
  },
})
