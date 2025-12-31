import React from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from './Panel'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getItemImage } from '@/assets/images'
import type { Item } from '@/stores/types/game'

interface ItemDetailDialogProps {
  visible: boolean
  item: Item | null
  onClose: () => void
  onUse?: () => void
  onBuy?: (item: Item) => void
  userInventory?: Record<string, number>
}

export const ItemDetailDialog: React.FC<ItemDetailDialogProps> = ({
  visible,
  item,
  onClose,
  onUse,
  onBuy,
  userInventory = {},
}) => {
  if (!item) return null

  const userOwnsItem = (userInventory[item.id] || 0) > 0
  const itemQuantity = userInventory[item.id] || 0

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#9E9E9E'
      case 'Rare': return '#2196F3'
      case 'Epic': return '#9C27B0'
      case 'Legendary': return '#FFD700'
      default: return '#9E9E9E'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Consumable': return 'flask'
      case 'StatBoost': return 'trending-up'
      case 'Evolution': return 'sparkles'
      case 'Cosmetic': return 'shirt'
      default: return 'cube'
    }
  }

  const isUsable = item.type === 'Consumable' || item.type === 'StatBoost' || item.type === 'Evolution'

  const getEffectDescription = () => {
    const effects: string[] = []
    if (item.effects.hp) {
      effects.push(`${item.effects.permanent ? 'Permanently increases' : 'Restores'} ${item.effects.hp} HP`)
    }
    if (item.effects.attack) {
      effects.push(`Increases Attack by ${item.effects.attack}`)
    }
    if (item.effects.defense) {
      effects.push(`Increases Defense by ${item.effects.defense}`)
    }
    if (item.effects.speed) {
      effects.push(`Increases Speed by ${item.effects.speed}`)
    }
    if (item.effects.xpBoost) {
      effects.push(`Grants ${item.effects.xpBoost} XP`)
    }
    return effects
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <Panel variant="dark" style={styles.dialogPanel}>
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Rarity Indicator */}
            <View
              style={[
                styles.rarityIndicator,
                { backgroundColor: getRarityColor(item.rarity) },
              ]}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Item Image */}
              <View style={styles.imageContainer}>
                <View
                  style={[
                    styles.imageBorder,
                    { borderColor: getRarityColor(item.rarity) },
                  ]}
                >
                  <Image
                    source={getItemImage(item.id || item.name)}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Item Name & Type */}
              <View style={styles.header}>
                <ThemedText style={styles.name}>{item.name}</ThemedText>
                <View style={styles.typeBadge}>
                  <Ionicons
                    name={getTypeIcon(item.type) as any}
                    size={16}
                    color={getRarityColor(item.rarity)}
                  />
                  <ThemedText
                    style={[
                      styles.typeText,
                      { color: getRarityColor(item.rarity) },
                    ]}
                  >
                    {item.type}
                  </ThemedText>
                </View>
              </View>

              {/* Rarity Badge */}
              <View
                style={[
                  styles.rarityBadge,
                  { backgroundColor: getRarityColor(item.rarity) + '30' },
                ]}
              >
                <ThemedText
                  style={[
                    styles.rarityText,
                    { color: getRarityColor(item.rarity) },
                  ]}
                >
                  ★ {item.rarity}
                </ThemedText>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText style={styles.description}>
                  {item.description}
                </ThemedText>
              </View>

              {/* Effects */}
              {getEffectDescription().length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Effects</ThemedText>
                  {getEffectDescription().map((effect, index) => (
                    <View key={index} style={styles.effectRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <ThemedText style={styles.effectText}>{effect}</ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {/* Quantity Owned */}
              {userOwnsItem && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>In Inventory</ThemedText>
                  <View style={styles.quantityContainer}>
                    <Ionicons name="cube" size={20} color="#4CAF50" />
                    <ThemedText style={styles.quantityText}>
                      {itemQuantity} owned
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Price */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Price</ThemedText>
                <View style={styles.priceContainer}>
                  {item.price.coins && (
                    <View style={styles.priceRow}>
                      <ThemedText style={styles.priceAmount}>
                        {item.price.coins}
                      </ThemedText>
                      <ThemedText style={styles.priceIcon}>💰</ThemedText>
                      <ThemedText style={styles.priceCurrency}>Coins</ThemedText>
                    </View>
                  )}
                  {item.price.gems && (
                    <View style={styles.priceRow}>
                      <ThemedText style={styles.priceAmount}>
                        {item.price.gems}
                      </ThemedText>
                      <ThemedText style={styles.priceIcon}>💎</ThemedText>
                      <ThemedText style={styles.priceCurrency}>Gems</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {onBuy && (
                <TouchableOpacity onPress={() => onBuy(item)} style={styles.actionButton}>
                  <LinearGradient
                    colors={['rgba(255, 193, 7, 0.3)', 'rgba(255, 152, 0, 0.5)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <View style={styles.actionButtonBorder}>
                      <Ionicons name="cart" size={20} color="#FFC107" />
                      <ThemedText style={[styles.actionButtonText, { color: '#FFC107' }]}>
                        Buy Item
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {isUsable && onUse && userOwnsItem && (
                <TouchableOpacity onPress={onUse} style={styles.actionButton}>
                  <LinearGradient
                    colors={['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.5)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionGradient}
                  >
                    <View style={styles.actionButtonBorder}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      <ThemedText style={styles.actionButtonText}>
                        Use Item
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.actionButton}>
                <LinearGradient
                  colors={['rgba(158, 158, 158, 0.3)', 'rgba(97, 97, 97, 0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionButtonBorder}>
                    <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Panel>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  dialogPanel: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  imageBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rarityBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  effectText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  priceContainer: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  priceIcon: {
    fontSize: 18,
  },
  priceCurrency: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 2,
  },
  actionButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#66BB6A',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B0B0B0',
  },
})
