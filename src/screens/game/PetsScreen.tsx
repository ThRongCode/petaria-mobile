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
import { TopBar, Panel, ItemDetailDialog } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile, getAllPets, getIsLoadingPets, getIsLoadingItems } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import { apiClient } from '@/services/api'
import type { Pet, Item } from '@/stores/types/game'

/**
 * PetsScreen - Modern collection view for Pokemon
 * Grid layout with filtering and sorting options
 */
export const PetsScreen: React.FC = () => {
  const router = useRouter()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets) as Pet[]
  const isLoadingPets = useSelector(getIsLoadingPets)
  const isLoadingItems = useSelector(getIsLoadingItems)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [selectedSort, setSelectedSort] = useState<'level' | 'name' | 'rarity'>('level')
  const [activeTab, setActiveTab] = useState<'pokemon' | 'items'>('pokemon')
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)

  const filters = [
    { id: 'all' as const, label: 'All', icon: 'apps' },
    { id: 'favorites' as const, label: 'Favorites', icon: 'heart' },
    { id: 'recent' as const, label: 'Recent', icon: 'time' },
  ]

  useEffect(() => {
    if (activeTab === 'items' && items.length === 0) {
      loadItems()
    }
  }, [activeTab])

  const loadItems = async () => {
    setLoadingItems(true)
    try {
      const response = await apiClient.getItemsCatalog()
      if (response.success && response.data) {
        setItems(response.data)
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
    // Derive type from species name or use default
    const petType = 'normal' // You can enhance this to map species to types
    
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
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          <ThemedText style={styles.petName} numberOfLines={1}>
            {pet.name}
          </ThemedText>
          <ThemedText style={styles.petSpecies} numberOfLines={1}>
            {pet.species}
          </ThemedText>

          {/* Type Badge */}
          <View 
            style={[
              styles.typeBadge,
              { backgroundColor: getTypeColor(petType) }
            ]}
          >
            <ThemedText style={styles.typeText}>{petType}</ThemedText>
          </View>

          {/* HP Bar */}
          <View style={styles.hpBarContainer}>
            <ThemedText style={styles.hpLabel}>HP</ThemedText>
            <View style={styles.hpBarOuter}>
              <View 
                style={[
                  styles.hpBarInner,
                  { 
                    width: `${(pet.stats.hp / 200) * 100}%`,
                    backgroundColor: pet.stats.hp > 100 ? '#4CAF50' : '#FFA726' 
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.hpValue}>{pet.stats.hp}</ThemedText>
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

          {/* Use Item Button */}
          <TouchableOpacity
            style={styles.useItemButton}
            onPress={(e) => {
              e.stopPropagation()
              router.push('/item-use')
            }}
          >
            <Ionicons name="cube-outline" size={16} color="#9C27B0" />
            <ThemedText style={styles.useItemText}>Use Item</ThemedText>
          </TouchableOpacity>
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
          energy={80}
          maxEnergy={100}
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Header with Collection Stats */}
        <View style={styles.header}>
          <Panel variant="transparent" style={styles.headerPanel}>
            <View style={styles.headerRow}>
              <View>
                <ThemedText style={styles.headerTitle}>📚 Collection</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  {activeTab === 'pokemon' 
                    ? `${pets.length} Pokemon collected`
                    : `${items.length} items available`
                  }
                </ThemedText>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('pokemon')}
              >
                <LinearGradient
                  colors={
                    activeTab === 'pokemon'
                      ? ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']
                      : ['transparent', 'transparent']
                  }
                  style={styles.tabGradient}
                >
                  <Ionicons
                    name="paw"
                    size={20}
                    color={activeTab === 'pokemon' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
                  />
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === 'pokemon' && styles.tabTextActive,
                    ]}
                  >
                    Pokemon
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tab}
                onPress={() => setActiveTab('items')}
              >
                <LinearGradient
                  colors={
                    activeTab === 'items'
                      ? ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.1)']
                      : ['transparent', 'transparent']
                  }
                  style={styles.tabGradient}
                >
                  <Ionicons
                    name="cube"
                    size={20}
                    color={activeTab === 'items' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
                  />
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === 'items' && styles.tabTextActive,
                    ]}
                  >
                    Items
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Panel>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                style={styles.filterButton}
              >
                <Panel 
                  variant={selectedFilter === filter.id ? 'light' : 'dark'}
                  style={styles.filterPanel}
                >
                  <Ionicons 
                    name={filter.icon as any} 
                    size={20} 
                    color={selectedFilter === filter.id ? '#000' : '#fff'} 
                  />
                  <ThemedText 
                    style={[
                      styles.filterText,
                      selectedFilter === filter.id && styles.filterTextActive
                    ]}
                  >
                    {filter.label}
                  </ThemedText>
                </Panel>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pokemon Grid */}
        {activeTab === 'pokemon' && (
          isLoadingPets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <ThemedText style={styles.loadingText}>Loading your Pokemon...</ThemedText>
            </View>
          ) : (
            <FlatList
              data={pets}
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
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
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
  filtersContainer: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  filtersContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    marginBottom: 4,
  },
  filterPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filterTextActive: {
    color: '#000',
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
  petInfo: {
    gap: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
    color: '#FFD700',
  },
  useItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  useItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C27B0',
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
})
