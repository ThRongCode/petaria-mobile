/**
 * PetsScreen — Immersive Pokémon & Items Collection
 *
 * Layout (matches pets_collection_immersive design):
 *   1. Background + blur orbs
 *   2. Glass-panel tab switcher (Pokémon / Inventory) with pill toggle
 *   3. Filter row (favorites toggle for pokemon tab)
 *   4. 2-column grid: glass cards with level badge, favorite heart,
 *      aspect-square sprite, name, type chips, HP/XP stat bars
 *   5. Storage capacity footer
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native'
import { Panel, ItemDetailDialog, LoadingContainer } from '@/components/ui'
import { ScreenContainer, ThemedText } from '@/components'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getAllPets, getIsLoadingPets, getUserInventory } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { Ionicons } from '@expo/vector-icons'
import { apiClient, itemApi } from '@/services/api'
import type { Pet, Item } from '@/stores/types/game'
import {
  colors,
  fonts,
  spacing,
  radii,
  fontSizes,
  glowAmbient,
} from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Extracted components
import { PetGridCard, ItemGridCard, EmptyState } from './components'

type TabType = 'pokemon' | 'items'

export const PetsScreen: React.FC = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
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
        const ownedItems = response.data
          .filter(item => (inventory.items[item.id] || 0) > 0)
          .map(item => ({
            ...item,
            quantity: inventory.items[item.id] || 0,
          }))
        setItems(ownedItems)
      }
    } catch {
      // silent
    } finally {
      setLoadingItems(false)
    }
  }, [inventory.items])

  const filteredPets = pets.filter((pet) => {
    if (showFavoritesOnly) return pet.isFavorite === true
    return true
  })

  // Handlers
  const handlePetPress = useCallback((pet: Pet) => {
    router.push({ pathname: '/pet-details', params: { petId: pet.id } })
  }, [router])

  const handleToggleFavorite = useCallback(async (pet: Pet, e: any) => {
    e.stopPropagation()
    if (togglingFavorite === pet.id) return
    setTogglingFavorite(pet.id)
    try {
      if (pet.isFavorite) {
        const response = await apiClient.removePetFromFavorites(pet.id)
        if (response.success) dispatch(gameActions.loadUserData())
      } else {
        const response = await apiClient.addPetToFavorites(pet.id)
        if (response.success) dispatch(gameActions.loadUserData())
      }
    } catch {
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
      router.push({ pathname: '/item-use', params: { item: JSON.stringify(selectedItem) } })
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
      buttonColors={[colors.primaryContainer, colors.primary]}
    />
  ), [handleGoHunt])

  const renderItemEmptyState = useCallback(() => (
    <View style={s.emptyContainer}>
      <Panel variant="glass" intensity="subtle" style={s.emptyPanel}>
        <Ionicons name="cube-outline" size={64} color={colors.outline} />
        <ThemedText style={s.emptyTitle}>No Items Yet</ThemedText>
        <ThemedText style={s.emptyText}>
          Visit the shop to purchase items for your Pokémon
        </ThemedText>
        <TouchableOpacity style={s.shopBtn} onPress={handleGoShop} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.secondaryContainer, colors.secondaryFixedDim]}
            style={[s.shopGradient, glowAmbient]}
          >
            <Ionicons name="cart" size={18} color={colors.onSecondary} />
            <ThemedText style={s.shopBtnText}>VISIT SHOP</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </Panel>
    </View>
  ), [handleGoShop])

  return (
    <ScreenContainer
      backgroundImage={require('@/assets/images/background/mobile_background.png')}
      backgroundOverlay
    >
      <View style={[s.content, { paddingTop: insets.top + spacing.lg }]}>
        {/* ════════════ TAB SWITCHER ════════════ */}
        <View style={s.tabSection}>
          <View style={s.tabPill}>
            <TouchableOpacity
              style={[s.tabBtn, activeTab === 'pokemon' && s.tabBtnActive]}
              onPress={() => setActiveTab('pokemon')}
            >
              <ThemedText style={[s.tabText, activeTab === 'pokemon' && s.tabTextActive]}>
                POKÉMON
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tabBtn, activeTab === 'items' && s.tabBtnActive]}
              onPress={() => setActiveTab('items')}
            >
              <ThemedText style={[s.tabText, activeTab === 'items' && s.tabTextActive]}>
                INVENTORY
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ════════════ FILTER ROW ════════════ */}
        <View style={s.filterRow}>
          {activeTab === 'pokemon' && (
            <>
              <View style={s.countChip}>
                <ThemedText style={s.countText}>
                  {showFavoritesOnly ? filteredPets.length : pets.length} Pokémon
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[s.filterChip, showFavoritesOnly && s.filterChipActive]}
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Ionicons
                  name={showFavoritesOnly ? 'heart' : 'heart-outline'}
                  size={16}
                  color={showFavoritesOnly ? '#FF4081' : colors.onSurfaceVariant}
                />
                <ThemedText style={[s.filterChipText, showFavoritesOnly && { color: '#FF4081' }]}>
                  Favorites
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'items' && (
            <View style={s.countChip}>
              <ThemedText style={s.countText}>{items.length} Items</ThemedText>
            </View>
          )}
        </View>

        {/* ════════════ POKEMON GRID ════════════ */}
        {activeTab === 'pokemon' && (
          isLoadingPets ? (
            <LoadingContainer message="Loading your Pokemon..." />
          ) : (
            <FlatList
              data={filteredPets}
              renderItem={renderPetCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={s.gridRow}
              contentContainerStyle={s.gridContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderPetEmptyState}
            />
          )
        )}

        {/* ════════════ ITEMS GRID ════════════ */}
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
              columnWrapperStyle={s.gridRow}
              contentContainerStyle={s.gridContent}
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
    </ScreenContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  content: { flex: 1 },

  // ── Tab Switcher ───────────────────────────────────────────
  tabSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.full,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.full,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  tabText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.onPrimary,
  },

  // ── Filter Row ─────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  countChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  countText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 64, 129, 0.15)',
    borderColor: 'rgba(255, 64, 129, 0.4)',
  },
  filterChipText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },

  // ── Grid ───────────────────────────────────────────────────
  gridRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  gridContent: {
    paddingBottom: spacing['5xl'],
  },

  // ── Empty States ───────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyPanel: {
    padding: spacing['4xl'],
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  shopBtn: {
    borderRadius: radii.DEFAULT,
    overflow: 'hidden',
  },
  shopGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.DEFAULT,
  },
  shopBtnText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.extraBold,
    color: colors.onSecondary,
    letterSpacing: 1,
  },
})
