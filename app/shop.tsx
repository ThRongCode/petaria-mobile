/**
 * Shop Screen — "Lapis Glassworks" redesign
 *
 * Item shop where users can purchase items.
 * Design ref: desgin/item_shop/code.html
 */

import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { ItemDetailDialog } from '@/components/ui'
import { ThemedText } from '@/components'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile, getUserInventory } from '@/stores/selectors'
import { gameActions } from '@/stores/reducers'
import { Ionicons } from '@expo/vector-icons'
import { itemApi } from '@/services/api'
import { getItemImage } from '@/assets/images'
import type { Item } from '@/stores/types/game'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

const CATEGORIES = [
  { id: 'all' as const, label: 'All', icon: 'apps' },
  { id: 'pokeball' as const, label: 'Pokéballs', icon: 'baseball' },
  { id: 'consumable' as const, label: 'Consumables', icon: 'flask' },
  { id: 'boost' as const, label: 'Stat Boosts', icon: 'trending-up' },
  { id: 'evolution' as const, label: 'Evolution', icon: 'sparkles' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

const RARITY_COLORS: Record<string, string> = {
  Common: '#9E9E9E',
  Uncommon: '#4CAF50',
  Rare: '#2196F3',
  Epic: '#9C27B0',
  Legendary: '#FFD700',
}

const RARITY_GRADIENT: Record<string, readonly [string, string]> = {
  Common: ['#9E9E9E', '#757575'] as const,
  Uncommon: ['#4CAF50', '#388E3C'] as const,
  Rare: ['#2196F3', '#1976D2'] as const,
  Epic: ['#A335EE', '#7B1FA2'] as const,
  Legendary: ['#FFD700', '#FFA500'] as const,
}

export default function ShopScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()
  const profile = useSelector(getUserProfile)
  const inventory = useSelector(getUserInventory)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showItemDialog, setShowItemDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all')

  useEffect(() => { loadShopItems() }, [])

  const loadShopItems = async () => {
    setLoading(true)
    try {
      const response = await itemApi.getCatalog()
      if (response.success && response.data) setItems(response.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load shop items')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyItem = async (item: Item) => {
    if (!item) return
    const cost = item.price.coins || item.price.gems || 0
    const currency = item.price.coins ? 'coins' : 'gems'
    const userBalance = item.price.coins ? profile.currency.coins : profile.currency.gems

    if (userBalance < cost) {
      Alert.alert('Insufficient Funds', `You need ${cost} ${currency}. You have ${userBalance}.`)
      return
    }

    Alert.alert('Purchase Item', `Buy ${item.name} for ${cost} ${currency}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy',
        onPress: async () => {
          try {
            const response = await itemApi.buyItem(item.id, 1)
            if (response.success) {
              Alert.alert('Success', `You purchased ${item.name}!`)
              dispatch(gameActions.loadUserData())
              setShowItemDialog(false)
            }
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to purchase item')
          }
        },
      },
    ])
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'pokeball') return item.type === 'Pokeball'
    if (selectedCategory === 'consumable') return item.type === 'Consumable'
    if (selectedCategory === 'boost') return item.type === 'StatBoost'
    if (selectedCategory === 'evolution') return item.type === 'Evolution'
    return true
  })

  const renderItemCard = ({ item }: { item: Item }) => {
    const quantity = inventory.items[item.id] || 0
    const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common
    const rarityGrad = RARITY_GRADIENT[item.rarity] || RARITY_GRADIENT.Common

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => { setSelectedItem(item); setShowItemDialog(true) }}
        activeOpacity={0.8}
      >
        <View style={styles.cardInner}>
          {/* Rarity bar */}
          <LinearGradient colors={[...rarityGrad]} style={styles.rarityBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

          {/* Image */}
          <View style={styles.itemImageWrap}>
            <View style={[styles.itemImageBorder, { borderColor: rarityColor + '60' }]}>
              <Image source={getItemImage(item.id || item.name)} style={styles.itemImage} resizeMode="contain" />
            </View>
            {quantity > 0 && (
              <View style={styles.ownedBadge}>
                <ThemedText style={styles.ownedText}>Owned: {quantity}</ThemedText>
              </View>
            )}
          </View>

          {/* Info */}
          <ThemedText style={styles.itemName} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={[styles.itemRarity, { color: rarityColor }]}>
            {item.rarity?.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Price button */}
          {item.price.gems ? (
            <LinearGradient
              colors={[...gradientPrimary]}
              style={styles.priceBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ThemedText style={styles.priceBtnText}>{item.price.gems}</ThemedText>
              <Ionicons name="diamond" size={12} color={colors.onPrimary} />
            </LinearGradient>
          ) : (
            <View style={styles.priceBtnCoins}>
              <ThemedText style={styles.priceBtnCoinsText}>{item.price.coins}</ThemedText>
              <Ionicons name="cash" size={12} color={colors.onSurface} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScreenContainer backgroundImage={require('@/assets/images/background/mobile_background.png')}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerTitle}>Item Shop</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Gear up for the next Hunt</ThemedText>
          </View>
          <View style={styles.currencyPill}>
            <ThemedText style={styles.currencyGold}>{profile.currency?.coins || 0} 🪙</ThemedText>
            <ThemedText style={styles.currencyCyan}>{profile.currency?.gems || 0} 💎</ThemedText>
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScroll}
        >
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={active ? colors.onPrimary : colors.onSurfaceVariant}
                />
                <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading shop...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItemCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.2)" />
                <ThemedText style={styles.emptyText}>No items available</ThemedText>
              </View>
            }
          />
        )}
      </ScrollView>

      <ItemDetailDialog
        visible={showItemDialog}
        item={selectedItem}
        onClose={() => { setShowItemDialog(false); setSelectedItem(null) }}
        onBuy={handleBuyItem}
        userInventory={inventory.items}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  currencyPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    gap: 2,
  },
  currencyGold: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.secondaryFixed },
  currencyCyan: { fontSize: fontSizes.small, fontFamily: fonts.bold, color: colors.primary },

  // ── Chips ─────────────────────────────────────────────────
  chipScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: 'rgba(68,216,241,0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  chipText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: { color: colors.onPrimary },

  // ── Grid ──────────────────────────────────────────────────
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  // ── Item Card ─────────────────────────────────────────────
  itemCard: { flex: 1 },
  cardInner: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    overflow: 'hidden',
    padding: spacing.md,
    paddingTop: 0,
    alignItems: 'center',
    gap: 4,
  },
  rarityBar: { width: '100%', height: 6, marginBottom: spacing.md },
  itemImageWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  itemImageBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  itemImage: { width: 56, height: 56 },
  ownedBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: 'rgba(53,57,70,0.80)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(68,216,241,0.20)',
  },
  ownedText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.primary,
  },
  itemName: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textAlign: 'center',
  },
  itemRarity: {
    fontSize: 9,
    fontFamily: fonts.extraBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  itemDesc: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  priceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    shadowColor: 'rgba(0,188,212,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  priceBtnText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.onPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  priceBtnCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  priceBtnCoinsText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── States ────────────────────────────────────────────────
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: spacing.md, fontSize: fontSizes.span, color: colors.onSurfaceVariant, fontFamily: fonts.regular },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: spacing.md, fontSize: fontSizes.body, color: 'rgba(255,255,255,0.4)', fontFamily: fonts.regular },
})