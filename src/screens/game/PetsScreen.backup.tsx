import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { TopBar, Panel, ItemDetailDialog, LoadingContainer } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getAllPets, getIsLoadingPets, getIsLoadingItems, getUserInventory } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import { apiClient, itemApi } from '@/services/api'
import type { Pet, Item } from '@/stores/types/game'
import { SvgUri } from 'react-native-svg'

/**
 * PetsScreen - Modern collection view for Pokemon
 * Grid layout with filtering and sorting options
 */
export const PetsScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets) as Pet[]
  const inventory = useSelector(getUserInventory)
  const isLoadingPets = useSelector(getIsLoadingPets)
  const isLoadingItems = useSelector(getIsLoadingItems)
  const [activeTab, setActiveTab] = useState<'pokemon' | 'items'>('pokemon')
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    if (activeTab === 'items') {
      loadItems()
    }
  }, [activeTab, inventory.items])

  const loadItems = async () => {
    setLoadingItems(true)
    try {
      const response = await itemApi.getCatalog()
      if (response.success && response.data) {
        // Filter to show only owned items
        const ownedItems = response.data
          .filter(item => (inventory.items[item.id] || 0) > 0)
          .map(item => ({
            ...item,
            quantity: inventory.items[item.id] || 0
          }))
        setItems(ownedItems)
      }
    } catch (error) {
      console.error('Failed to load items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleItemPress = (item: Item) => {
    setSelectedItem(item)
    setShowItemDialog(true)
  }

  const handleUseItem = () => {
    setShowItemDialog(false)
    if (selectedItem) {
      // Navigate to item use screen with item data
      router.push({
        pathname: '/item-use',
        params: { item: JSON.stringify(selectedItem) }
      })
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

  const handleToggleFavorite = async (pet: Pet, e: any) => {
    e.stopPropagation()
    
    // Prevent multiple clicks
    if (togglingFavorite === pet.id) return
    
    setTogglingFavorite(pet.id)
    
    try {
      if (pet.isFavorite) {
        const response = await apiClient.removePetFromFavorites(pet.id)
        if (response.success) {
          // Update local state
          dispatch(gameActions.loadUserData())
        }
      } else {
        const response = await apiClient.addPetToFavorites(pet.id)
        if (response.success) {
          // Update local state
          dispatch(gameActions.loadUserData())
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      Alert.alert('Error', 'Failed to update favorite status')
    } finally {
      setTogglingFavorite(null)
    }
  }

  // Filter pets based on favorites toggle
  const filteredPets = pets.filter((pet) => {
    if (showFavoritesOnly) {
      return pet.isFavorite === true
    }
    return true
  })

  const getTypeColor = (type?: string) => {
    if (!type) return '#9E9E9E' // Default gray color for normal/unknown type
    
    const colors: Record<string, string> = {
      grass: '#4CAF50',
      fire: '#F44336',
      water: '#2196F3',
      electric: '#FFC107',
      psychic: '#9C27B0',
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

  const renderPetCard = ({ item: pet }: { item: Pet }) => {
    // Use type from API, fallback to Normal
    const petType = pet.type || 'Normal'
    // Get primary type (first type if dual-typed like "Fire/Flying")
    const primaryType = petType.split('/')[0]
    
    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => {
          // Navigate to pet detail
          router.push({
            pathname: '/pet-details',
            params: { petId: pet.id }
          })
        }}
      >
      <Panel variant="dark" style={styles.petPanel}>
        {/* Pet Image */}
        <View style={styles.petImageContainer}>
          <Image 
            source={getPokemonImage(pet.species) as any}
            style={styles.petImage}
            resizeMode="contain"
          />
          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>Lv.{pet.level}</ThemedText>
          </View>
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => handleToggleFavorite(pet, e)}
            disabled={togglingFavorite === pet.id}
          >
            {togglingFavorite === pet.id ? (
              <ActivityIndicator size="small" color="#FFD700" />
            ) : (
              <Ionicons 
                name={pet.isFavorite ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={pet.isFavorite ? "#FFD700" : "#FFFFFF"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          {/* Name Row with Type Badge */}
          <View style={styles.nameRow}>
            <ThemedText style={styles.petName} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            <View 
              style={[
                styles.typeBadgeSmall,
                { backgroundColor: getTypeColor(primaryType) }
              ]}
            >
              <ThemedText style={styles.typeTextSmall}>{primaryType}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.petSpecies} numberOfLines={1}>
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
                    backgroundColor: pet.stats.hp > pet.stats.maxHp * 0.5 ? '#4CAF50' : pet.stats.hp > pet.stats.maxHp * 0.2 ? '#FFA726' : '#F44336'
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.hpValue}>{pet.stats.hp}/{pet.stats.maxHp}</ThemedText>
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
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
      >
        <Panel variant="dark" style={styles.itemPanel}>
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
            <ThemedText style={styles.itemName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={styles.itemType} numberOfLines={1}>
              {item.type}
            </ThemedText>

            {/* Rarity Badge */}
            <View
              style={[
                styles.itemRarityBadge,
                { backgroundColor: getRarityColor(item.rarity) + '30' },
              ]}
            >
              <ThemedText
                style={[
                  styles.itemRarityText,
                  { color: getRarityColor(item.rarity) },
                ]}
              >
                {item.rarity}
              </ThemedText>
            </View>

            {/* Price */}
            <View style={styles.itemPrice}>
              {item.price?.coins && (
                <View style={styles.priceTag}>
                  <ThemedText style={styles.priceValue}>{item.price.coins}</ThemedText>
                  <ThemedText style={styles.priceIcon}>💰</ThemedText>
                </View>
              )}
              {item.price?.gems && (
                <View style={styles.priceTag}>
                  <ThemedText style={styles.priceValue}>{item.price.gems}</ThemedText>
                  <ThemedText style={styles.priceIcon}>💎</ThemedText>
                </View>
              )}
            </View>
          </View>
        </Panel>
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
      <View style={styles.content}>
        {/* Top Bar */}
        <TopBar
          username={profile.username}
          coins={profile.currency?.coins || 0}
          gems={profile.currency?.gems || 150}
          pokeballs={profile.currency?.pokeballs || 0}
          
          
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Compact Tabs with Count and Favorite Toggle */}
        <View style={styles.compactHeader}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.compactTab,
                activeTab === 'pokemon' && styles.compactTabActive,
              ]}
              onPress={() => setActiveTab('pokemon')}
            >
              <Ionicons
                name="paw"
                size={18}
                color={activeTab === 'pokemon' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
              />
              <ThemedText
                style={[
                  styles.compactTabText,
                  activeTab === 'pokemon' && styles.compactTabTextActive,
                ]}
              >
                Pokemon
              </ThemedText>
              {activeTab === 'pokemon' && (
                <View style={styles.countBadge}>
                  <ThemedText style={styles.countText}>{showFavoritesOnly ? filteredPets.length : pets.length}</ThemedText>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.compactTab,
                activeTab === 'items' && styles.compactTabActive,
              ]}
              onPress={() => setActiveTab('items')}
            >
              <Ionicons
                name="cube"
                size={18}
                color={activeTab === 'items' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
              />
              <ThemedText
                style={[
                  styles.compactTabText,
                  activeTab === 'items' && styles.compactTabTextActive,
                ]}
              >
                Inventory
              </ThemedText>
              {activeTab === 'items' && (
                <View style={styles.countBadge}>
                  <ThemedText style={styles.countText}>{items.length}</ThemedText>
                </View>
              )}
            </TouchableOpacity>

            {/* Favorite Toggle - Only show for Pokemon tab */}
            {activeTab === 'pokemon' && (
              <TouchableOpacity
                style={[
                  styles.favoriteToggle,
                  showFavoritesOnly && styles.favoriteToggleActive,
                ]}
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Ionicons
                  name={showFavoritesOnly ? 'heart' : 'heart-outline'}
                  size={18}
                  color={showFavoritesOnly ? '#FF4081' : 'rgba(255, 255, 255, 0.5)'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pokemon Grid */}
        {activeTab === 'pokemon' && (
          isLoadingPets ? (
            <LoadingContainer message="Loading your Pokemon..." />
          ) : (
            <FlatList
              data={filteredPets}
              renderItem={renderPetCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Panel variant="dark" style={styles.emptyPanel}>
                    <ThemedText style={styles.emptyIcon}>🎒</ThemedText>
                    <ThemedText style={styles.emptyTitle}>No Pokemon Yet</ThemedText>
                    <ThemedText style={styles.emptyText}>
                    Start hunting to catch your first Pokemon!
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => router.push('/(app)/hunt')}
                    style={styles.emptyButton}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#2E7D32']}
                      style={styles.emptyGradient}
                    >
                      <ThemedText style={styles.emptyButtonText}>
                        Go Hunt
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </Panel>
              </View>
            )}
            />
          )
        )}

        {/* Items View */}
        {activeTab === 'items' && (
          <>
            {loadingItems ? (
              <LoadingContainer message="Loading items..." />
            ) : items.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Panel variant="dark" style={styles.emptyPanel}>
                  <Ionicons name="cube-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                  <ThemedText style={styles.emptyTitle}>No Items Yet</ThemedText>
                  <ThemedText style={styles.emptyText}>
                    Visit the shop to purchase items for your Pokémon
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => router.push('/shop')}
                  >
                    <LinearGradient
                      colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 152, 0, 0.5)']}
                      style={styles.shopButtonGradient}
                    >
                      <Ionicons name="cart" size={20} color="#FFD700" />
                      <ThemedText style={styles.shopButtonText}>Visit Shop</ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </Panel>
              </View>
            ) : (
              <FlatList
                data={items}
                renderItem={renderItemCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </View>

      {/* Item Detail Dialog */}
      <ItemDetailDialog
        visible={showItemDialog}
        item={selectedItem}
        onClose={() => {
          setShowItemDialog(false)
          setSelectedItem(null)
        }}
        onUse={handleUseItem}
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
  content: {
    flex: 1,
  },
  // Compact header styles
  compactHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactTabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  compactTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  compactTabTextActive: {
    color: '#FFD700',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  favoriteToggle: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 'auto',
  },
  favoriteToggleActive: {
    backgroundColor: 'rgba(255, 64, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 64, 129, 0.5)',
  },
  // Legacy header styles (can be removed later)
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  headerPanel: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  addButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  addGradient: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  petCard: {
    flex: 1,
    maxWidth: '48%',
    marginBottom: 12,
  },
  petPanel: {
    padding: 12,
  },
  petImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  petImage: {
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
  petInfo: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  typeBadgeSmall: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeTextSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  petSpecies: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
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
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPanel: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  // Item Card Styles
  itemCard: {
    flex: 1,
    marginBottom: 12,
  },
  itemPanel: {
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
  itemImageContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  itemImage: {
    width: 70,
    height: 70,
  },
  itemInfo: {
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemType: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  itemRarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  itemRarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemPrice: {
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
  priceIcon: {
    fontSize: 12,
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsPanel: {
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  itemsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  itemsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  browseGradient: {
    padding: 2,
  },
  browseButtonBorder: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B39DDB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyPanel: {
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
})
