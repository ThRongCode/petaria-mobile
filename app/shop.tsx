import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { TopBar, Panel, ItemDetailDialog } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getUserInventory } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { Ionicons } from '@expo/vector-icons'
import { itemApi } from '@/services/api'
import type { Item } from '@/stores/types/game'

/**
 * ShopScreen - Item shop where users can purchase items
 */
export default function ShopScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const profile = useSelector(getUserProfile)
  const inventory = useSelector(getUserInventory)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consumable' | 'boost' | 'evolution' | 'pokeball'>('all')

  const categories = [
    { id: 'all' as const, label: 'All Items', icon: 'apps' },
    { id: 'pokeball' as const, label: 'Pokeballs', icon: 'baseball' },
    { id: 'consumable' as const, label: 'Consumables', icon: 'flask' },
    { id: 'boost' as const, label: 'Stat Boosts', icon: 'trending-up' },
    { id: 'evolution' as const, label: 'Evolution', icon: 'sparkles' },
  ]

  useEffect(() => {
    loadShopItems()
  }, [])

  const loadShopItems = async () => {
    setLoading(true)
    try {
      const response = await itemApi.getCatalog()
      if (response.success && response.data) {
        setItems(response.data)
      }
    } catch (error) {
      console.error('Failed to load shop items:', error)
      Alert.alert('Error', 'Failed to load shop items')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyItem = async (item: Item) => {
    if (!item) return

    // Check if user has enough currency
    const cost = item.price.coins || item.price.gems || 0
    const currency = item.price.coins ? 'coins' : 'gems'
    const userBalance = item.price.coins ? profile.currency.coins : profile.currency.gems

    if (userBalance < cost) {
      Alert.alert(
        'Insufficient Funds',
        `You need ${cost} ${currency} to purchase ${item.name}. You have ${userBalance} ${currency}.`
      )
      return
    }

    Alert.alert(
      'Purchase Item',
      `Buy ${item.name} for ${cost} ${currency}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            try {
              const response = await itemApi.buyItem(item.id, 1)
              if (response.success) {
                Alert.alert('Success', `You purchased ${item.name}!`)
                // Reload user data to update inventory and currency
                dispatch(gameActions.loadUserData())
                setShowItemDialog(false)
              } else {
                Alert.alert('Error', 'Failed to purchase item')
              }
            } catch (error) {
              console.error('Error buying item:', error)
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to purchase item')
            }
          }
        }
      ]
    )
  }

  const handleItemPress = (item: Item) => {
    setSelectedItem(item)
    setShowItemDialog(true)
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'pokeball') return item.type === 'Pokeball'
    if (selectedCategory === 'consumable') return item.type === 'Consumable'
    if (selectedCategory === 'boost') return item.type === 'StatBoost'
    if (selectedCategory === 'evolution') return item.type === 'Evolution'
    return true
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#9E9E9E'
      case 'Rare': return '#2196F3'
      case 'Epic': return '#9C27B0'
      case 'Legendary': return '#FFD700'
      default: return '#9E9E9E'
    }
  }

  const renderItemCard = ({ item }: { item: Item }) => {
    const userOwns = (inventory.items[item.id] || 0) > 0
    const quantity = inventory.items[item.id] || 0

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.itemGradient}
        >
          <Panel variant="dark" style={styles.itemPanel}>
            {/* Rarity Indicator */}
            <View style={[styles.rarityBar, { backgroundColor: getRarityColor(item.rarity) }]} />
            
            {/* Item Image */}
            <View style={styles.itemImageContainer}>
              <View style={[styles.itemImageBorder, { borderColor: getRarityColor(item.rarity) }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons name="cube" size={40} color={getRarityColor(item.rarity)} />
                  </View>
                )}
              </View>
              
              {/* Owned Badge */}
              {userOwns && (
                <View style={styles.ownedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <ThemedText style={styles.ownedText}>{quantity}</ThemedText>
                </View>
              )}
            </View>

            {/* Item Info */}
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemName} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                {item.rarity}
              </ThemedText>
              <ThemedText style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </ThemedText>

              {/* Price */}
              <View style={styles.priceContainer}>
                {item.price.coins && (
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.priceIcon}>💰</ThemedText>
                    <ThemedText style={styles.priceAmount}>{item.price.coins}</ThemedText>
                  </View>
                )}
                {item.price.gems && (
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.priceIcon}>💎</ThemedText>
                    <ThemedText style={styles.priceAmount}>{item.price.gems}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Panel>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={require('@/assets/images/background/mobile_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 150}
          pokeballs={profile.currency?.pokeballs || 0}
          energy={80}
          maxEnergy={100}
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Panel variant="transparent" style={styles.headerPanel}>
            <ThemedText style={styles.headerTitle}>🛒 Item Shop</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Purchase items to help your Pokémon
            </ThemedText>
          </Panel>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === category.id && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={selectedCategory === category.id ? '#4CAF50' : 'rgba(255, 255, 255, 0.6)'}
                  />
                  <ThemedText
                    style={[
                      styles.filterText,
                      selectedCategory === category.id && styles.filterTextActive
                    ]}
                  >
                    {category.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Loading shop...</ThemedText>
          </View>
        )}

        {/* Items Grid */}
        {!loading && (
          <View style={styles.itemsContainer}>
            <FlatList
              data={filteredItems}
              renderItem={renderItemCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                  <ThemedText style={styles.emptyText}>No items available</ThemedText>
                </View>
              }
            />
          </View>
        )}
      </ScrollView>

      {/* Item Detail Dialog */}
      <ItemDetailDialog
        visible={showItemDialog}
        item={selectedItem}
        onClose={() => {
          setShowItemDialog(false)
          setSelectedItem(null)
        }}
        onBuy={handleBuyItem}
        userInventory={inventory.items}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPanel: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#4CAF50',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  itemsContainer: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  itemCard: {
    width: '48%',
    marginBottom: 4,
  },
  itemGradient: {
    borderRadius: 16,
  },
  itemPanel: {
    padding: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  rarityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  itemImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    position: 'relative',
  },
  itemImageBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  itemImage: {
    width: 60,
    height: 60,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemInfo: {
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemRarity: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceIcon: {
    fontSize: 14,
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
  },
})
