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
import type { Item } from '@/stores/types/game'

interface ItemGridCardProps {
  item: Item & { quantity?: number }
  onPress: (item: Item) => void
}

// Get color for item rarity
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common':
      return '#9E9E9E'
    case 'Rare':
      return '#2196F3'
    case 'Epic':
      return '#9C27B0'
    case 'Legendary':
      return '#FFD700'
    default:
      return '#9E9E9E'
  }
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
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube" size={40} color="rgba(255,255,255,0.3)" />
            </View>
          )}
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
                <Ionicons name="cash" size={12} color="#FFD700" />
                <ThemedText style={styles.priceValue}>{item.price.coins}</ThemedText>
              </View>
            )}
            {item.price.gems && item.price.gems > 0 && (
              <View style={styles.priceTag}>
                <Ionicons name="diamond" size={12} color="#00BFFF" />
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
    marginBottom: 12,
  },
  panel: {
    padding: 12,
    position: 'relative',
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
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
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  type: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceValue: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
})
