/**
 * PetsScreen - Pokemon & Items Collection View
 * 
 * Refactored to use extracted components for better maintainability
 * Grid layout with filtering and sorting options
 */

import React, { useState, useEffect, useCallback } from 'react'
import { 
  StyleSheet, 
  View, 
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import { TopBar, Panel, ItemDetailDialog, LoadingContainer } from '@/components/ui'
import { ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getAllPets, getIsLoadingPets, getUserInventory } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { Ionicons } from '@expo/vector-icons'
import { apiClient, itemApi } from '@/services/api'
import type { Pet, Item } from '@/stores/types/game'

// Extracted components
import { PetGridCard, ItemGridCard, EmptyState } from './components'

type TabType = 'pokemon' | 'items'

export const PetsScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets) as Pet[]
  const inventory = useSelector(getUserInventory)
  const isLoadingPets = useSelector(getIsLoadingPets)
  
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<TabType>('pokemon')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  // Items state
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  
  // Dialog state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  
  // Favorite toggle state
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)

  // Load items when tab changes
  useEffect(() => {
    if (activeTab === 'items') {
      loadItems()
    }
  }, [activeTab, inventory.items])

  const loadItems = useCallback(async () => {
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
  }, [inventory.items])

  // Filter pets based on favorites toggle
  const filteredPets = pets.filter((pet) => {
    if (showFavoritesOnly) {
      return pet.isFavorite === true
    }
    return true
  })

  // Handlers
  const handlePetPress = useCallback((pet: Pet) => {
    router.push({
      pathname: '/pet-details',
      params: { petId: pet.id }
    })
  }, [router])

  const handleToggleFavorite = useCallback(async (pet: Pet, e: any) => {
    e.stopPropagation()
    
    if (togglingFavorite === pet.id) return
    
    setTogglingFavorite(pet.id)
    
    try {
      if (pet.isFavorite) {
        const response = await apiClient.removePetFromFavorites(pet.id)
        if (response.success) {
          dispatch(gameActions.loadUserData())
        }
      } else {
        const response = await apiClient.addPetToFavorites(pet.id)
        if (response.success) {
          dispatch(gameActions.loadUserData())
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      Alert.alert('Error', 'Failed to update favorite status')
    } finally {
      setTogglingFavorite(null)
    }
  }, [togglingFavorite, dispatch])

  const handleItemPress = useCallback((item: Item) => {
    setSelectedItem(item)
    setShowItemDialog(true)
  }, [])

  const handleUseItem = useCallback(() => {
    setShowItemDialog(false)
    if (selectedItem) {
      router.push({
        pathname: '/item-use',
        params: { item: JSON.stringify(selectedItem) }
      })
    }
  }, [selectedItem, router])

  const handleGoHunt = useCallback(() => {
    router.push('/(app)/hunt')
  }, [router])

  const handleGoShop = useCallback(() => {
    router.push('/shop')
  }, [router])

  // Render functions
  const renderPetCard = useCallback(({ item: pet }: { item: Pet }) => (
    <PetGridCard
      pet={pet}
      onPress={handlePetPress}
      onToggleFavorite={handleToggleFavorite}
      isTogglingFavorite={togglingFavorite === pet.id}
    />
  ), [handlePetPress, handleToggleFavorite, togglingFavorite])

  const renderItemCard = useCallback(({ item }: { item: Item }) => (
    <ItemGridCard item={item} onPress={handleItemPress} />
  ), [handleItemPress])

  const renderPetEmptyState = useCallback(() => (
    <EmptyState
      icon="🎒"
      title="No Pokemon Yet"
      message="Start hunting to catch your first Pokemon!"
      buttonText="Go Hunt"
      onButtonPress={handleGoHunt}
      buttonColors={['#4CAF50', '#2E7D32']}
    />
  ), [handleGoHunt])

  const renderItemEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Panel variant="dark" style={styles.emptyPanel}>
        <Ionicons name="cube-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
        <ThemedText style={styles.emptyTitle}>No Items Yet</ThemedText>
        <ThemedText style={styles.emptyText}>
          Visit the shop to purchase items for your Pokémon
        </ThemedText>
        <TouchableOpacity style={styles.shopButton} onPress={handleGoShop}>
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
  ), [handleGoShop])

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
          gems={profile.currency?.gems || 0}
          pokeballs={profile.currency?.pokeballs || 0}
          battleTickets={profile.battleTickets}
          huntTickets={profile.huntTickets}
          onSettingsPress={() => router.push('/profile')}
        />

        {/* Tab Header */}
        <View style={styles.header}>
          <View style={styles.tabsRow}>
            {/* Pokemon Tab */}
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pokemon' && styles.tabActive]}
              onPress={() => setActiveTab('pokemon')}
            >
              <Ionicons
                name="paw"
                size={18}
                color={activeTab === 'pokemon' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
              />
              <ThemedText style={[styles.tabText, activeTab === 'pokemon' && styles.tabTextActive]}>
                Pokemon
              </ThemedText>
              {activeTab === 'pokemon' && (
                <View style={styles.countBadge}>
                  <ThemedText style={styles.countText}>
                    {showFavoritesOnly ? filteredPets.length : pets.length}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>

            {/* Items Tab */}
            <TouchableOpacity
              style={[styles.tab, activeTab === 'items' && styles.tabActive]}
              onPress={() => setActiveTab('items')}
            >
              <Ionicons
                name="cube"
                size={18}
                color={activeTab === 'items' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'}
              />
              <ThemedText style={[styles.tabText, activeTab === 'items' && styles.tabTextActive]}>
                Inventory
              </ThemedText>
              {activeTab === 'items' && (
                <View style={styles.countBadge}>
                  <ThemedText style={styles.countText}>{items.length}</ThemedText>
                </View>
              )}
            </TouchableOpacity>

            {/* Favorite Toggle - Only for Pokemon tab */}
            {activeTab === 'pokemon' && (
              <TouchableOpacity
                style={[styles.favoriteToggle, showFavoritesOnly && styles.favoriteToggleActive]}
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
              ListEmptyComponent={renderPetEmptyState}
            />
          )
        )}

        {/* Items Grid */}
        {activeTab === 'items' && (
          loadingItems ? (
            <LoadingContainer message="Loading items..." />
          ) : items.length === 0 ? (
            renderItemEmptyState()
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
          )
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
  // Header & Tabs
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
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
  // Grid
  gridRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  // Empty States
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
