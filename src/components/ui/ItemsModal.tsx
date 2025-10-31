import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from './Panel'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { apiClient } from '@/services/api'
import type { Item, Pet } from '@/stores/types/game'

interface ItemsModalProps {
  visible: boolean
  onClose: () => void
  selectedPet?: Pet
  onItemUsed?: (pet: Pet, message: string) => void
}

export const ItemsModal: React.FC<ItemsModalProps> = ({
  visible,
  onClose,
  selectedPet,
  onItemUsed,
}) => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [using, setUsing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'Consumable' | 'StatBoost' | 'Evolution'>('all')

  useEffect(() => {
    if (visible) {
      loadItems()
    }
  }, [visible])

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getItemsCatalog()
      if (response.success && response.data) {
        setItems(response.data)
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseItem = async () => {
    if (!selectedItem || !selectedPet) return

    setUsing(true)
    try {
      const response = await apiClient.useItemOnPet(selectedItem.id, selectedPet.id)
      if (response.success && response.data) {
        onItemUsed?.(response.data.pet, response.data.message)
        setSelectedItem(null)
        onClose()
      }
    } catch (error) {
      console.error('Failed to use item:', error)
    } finally {
      setUsing(false)
    }
  }

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

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.type === filter)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Panel variant="dark" style={styles.modalPanel}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <ThemedText style={styles.title}>
                  {selectedPet ? `Items for ${selectedPet.name}` : 'All Items'}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  {selectedPet ? 'Select an item to use' : 'Browse available items'}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {(['all', 'Consumable', 'StatBoost', 'Evolution'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilter(type)}
                  style={styles.filterButton}
                >
                  <LinearGradient
                    colors={
                      filter === type
                        ? ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']
                        : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                    }
                    style={styles.filterGradient}
                  >
                    <ThemedText
                      style={[
                        styles.filterText,
                        filter === type && styles.filterTextActive,
                      ]}
                    >
                      {type === 'all' ? 'All' : type}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Items Grid */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
              </View>
            ) : (
              <ScrollView
                style={styles.itemsScroll}
                contentContainerStyle={styles.itemsContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    style={styles.itemCard}
                  >
                    <LinearGradient
                      colors={
                        selectedItem?.id === item.id
                          ? ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']
                          : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                      }
                      style={[
                        styles.itemGradient,
                        selectedItem?.id === item.id && styles.itemSelected,
                      ]}
                    >
                      {/* Rarity Indicator */}
                      <View
                        style={[
                          styles.rarityIndicator,
                          { backgroundColor: getRarityColor(item.rarity) },
                        ]}
                      />

                      {/* Item Image */}
                      <View style={styles.itemImageContainer}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Item Info */}
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                          <ThemedText style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </ThemedText>
                          <Ionicons
                            name={getTypeIcon(item.type) as any}
                            size={16}
                            color={getRarityColor(item.rarity)}
                          />
                        </View>
                        <ThemedText style={styles.itemDescription} numberOfLines={2}>
                          {item.description}
                        </ThemedText>
                        <View style={styles.itemFooter}>
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
                              {item.rarity}
                            </ThemedText>
                          </View>
                          <View style={styles.priceContainer}>
                            {item.price.coins && (
                              <View style={styles.price}>
                                <ThemedText style={styles.priceText}>
                                  {item.price.coins}
                                </ThemedText>
                                <ThemedText style={styles.priceIcon}>💰</ThemedText>
                              </View>
                            )}
                            {item.price.gems && (
                              <View style={styles.price}>
                                <ThemedText style={styles.priceText}>
                                  {item.price.gems}
                                </ThemedText>
                                <ThemedText style={styles.priceIcon}>💎</ThemedText>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Action Button */}
            {selectedItem && selectedPet && (
              <TouchableOpacity
                onPress={handleUseItem}
                disabled={using}
                style={styles.actionButton}
              >
                <LinearGradient
                  colors={['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.5)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionButtonBorder}>
                    {using ? (
                      <ActivityIndicator color="#66BB6A" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <ThemedText style={styles.actionButtonText}>
                          Use {selectedItem.name}
                        </ThemedText>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
  },
  modalPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 16,
    maxHeight: 50,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFD700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  itemsScroll: {
    flex: 1,
  },
  itemsContent: {
    gap: 12,
    paddingBottom: 20,
  },
  itemCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemGradient: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemSelected: {
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderWidth: 2,
  },
  rarityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  itemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    lineHeight: 16,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  priceIcon: {
    fontSize: 12,
  },
  actionButton: {
    marginTop: 16,
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
})
