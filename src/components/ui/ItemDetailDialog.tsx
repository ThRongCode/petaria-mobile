import React from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { Panel } from './Panel'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getItemImage } from '@/assets/images'
import { colors, fonts, spacing, radii } from '@/themes'
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
      case 'Common': return colors.rarityColors.common
      case 'Rare': return colors.rarityColors.rare
      case 'Epic': return colors.rarityColors.epic
      case 'Legendary': return colors.rarityColors.legendary
      default: return colors.rarityColors.common
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
              <Ionicons name="close" size={24} color={colors.onSurface} />
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
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
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
                    <Ionicons name="cube" size={20} color={colors.success} />
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
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  dialogPanel: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.xs,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.md,
  },
  typeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  rarityBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.DEFAULT,
    marginBottom: spacing.xl,
  },
  rarityText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  effectText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.onSurface,
    flex: 1,
  },
  priceContainer: {
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  priceAmount: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  priceIcon: {
    fontSize: 18,
  },
  priceCurrency: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(35, 193, 107, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(35, 193, 107, 0.3)',
  },
  quantityText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.success,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionButton: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 2,
  },
  actionButtonBorder: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
})
