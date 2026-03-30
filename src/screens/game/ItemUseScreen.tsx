/**
 * Item Use Screen — "Lapis Glassworks" redesign
 *
 * Select a Pokemon to use an item on.
 * Design ref: desgin/item_use/code.html
 */

import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { CustomAlert } from '@/components/ui'
import { ThemedText } from '@/components'
import { ScreenContainer } from '@/components/ScreenContainer'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { getUserProfile, getAllPets } from '@/stores/selectors'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage, getItemImage } from '@/assets/images'
import { apiClient } from '@/services/api'
import { useAppDispatch } from '@/stores/store'
import { gameActions } from '@/stores/reducers'
import type { Pet, Item } from '@/stores/types/game'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { backgrounds } from '@/assets/images/backgrounds'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

export const ItemUseScreen: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const profile = useSelector(getUserProfile)
  const pets = useSelector(getAllPets) as Pet[]
  const [using, setUsing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    title: string
    message: string
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>
  }>({ title: '', message: '', buttons: [] })

  const item: Item | null = params.item ? JSON.parse(params.item as string) : null

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }>
  ) => {
    setAlertConfig({ title, message, buttons })
    setShowAlert(true)
  }

  const handleUsePet = async (pet: Pet) => {
    if (!item) return
    showCustomAlert('Confirm Use', `Use ${item.name} on ${pet.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Use Item',
        style: 'default',
        onPress: async () => {
          setUsing(true)
          try {
            const response = await apiClient.useItemOnPet(item.id, pet.id)
            if (response.success && response.data) {
              dispatch(gameActions.loadUserData())
              showCustomAlert('Success!', response.data.message, [
                { text: 'OK', onPress: () => router.back() },
              ])
            }
          } catch (error: any) {
            showCustomAlert('Error', error.message || 'Failed to use item', [{ text: 'OK' }])
          } finally {
            setUsing(false)
          }
        },
      },
    ])
  }

  const renderPetCard = ({ item: pet }: { item: Pet }) => {
    const hpPercent = pet.stats.maxHp ? (pet.stats.hp / pet.stats.maxHp) * 100 : 50
    const hpColor = hpPercent > 50 ? colors.primary : hpPercent > 25 ? colors.secondaryFixed : colors.error

    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => handleUsePet(pet)}
        disabled={using}
        activeOpacity={0.8}
      >
        <View style={styles.petCardInner}>
          {/* Pet image + level */}
          <View style={styles.petImageWrap}>
            <Image
              source={getPokemonImage(pet.species) as any}
              style={styles.petImage}
              resizeMode="contain"
            />
            <View style={styles.petLevelBadge}>
              <ThemedText style={styles.petLevelText}>LV. {pet.level}</ThemedText>
            </View>
          </View>

          {/* Info */}
          <View style={styles.petInfo}>
            <ThemedText style={styles.petName} numberOfLines={1}>{pet.name}</ThemedText>
            <ThemedText style={styles.petSpecies}>{pet.species}</ThemedText>

            {/* HP Bar */}
            <View style={styles.hpSection}>
              <View style={styles.hpLabelRow}>
                <ThemedText style={styles.hpLabel}>HP STATUS</ThemedText>
                <ThemedText style={styles.hpValue}>
                  <ThemedText style={[styles.hpCurrent, { color: hpColor }]}>{pet.stats.hp}</ThemedText>
                  {' / '}{pet.stats.maxHp || 100}
                </ThemedText>
              </View>
              <View style={styles.hpTrack}>
                <View style={[styles.hpFill, { width: `${Math.min(hpPercent, 100)}%`, backgroundColor: hpColor }]} />
              </View>
            </View>
          </View>

          {/* Use button */}
          <TouchableOpacity onPress={() => handleUsePet(pet)} disabled={using}>
            <LinearGradient
              colors={[...gradientPrimary]}
              style={styles.useBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <ThemedText style={styles.useBtnText}>Use</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  if (!item) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>No item selected</ThemedText>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer backgroundImage={backgrounds.itemUse}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <ThemedText style={styles.headerTitle}>Use Item</ThemedText>
        </View>
      </View>

      {/* Item info card */}
      <View style={styles.itemCard}>
        <View style={styles.itemCardGlow} />
        <View style={styles.itemImageWrap}>
          <Image
            source={getItemImage(item.id || item.name)}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemTypeBadge}>
            <ThemedText style={styles.itemTypeText}>{item.type || 'Item'}</ThemedText>
          </View>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <ThemedText style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
      </View>

      {/* Pet label */}
      <View style={styles.selectLabel}>
        <Ionicons name="paw" size={18} color={colors.primary} />
        <ThemedText style={styles.selectLabelText}>Select Target Pokémon</ThemedText>
      </View>

      {/* Pokemon List */}
      {using ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Using item...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderPetCard}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="bag-handle-outline" size={56} color={colors.outline} />
              <ThemedText style={styles.emptyTitle}>No Pokemon</ThemedText>
              <ThemedText style={styles.emptyText}>You need Pokemon to use items on!</ThemedText>
            </View>
          }
        />
      )}

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setShowAlert(false)}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
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
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: -0.3,
  },

  // ── Item Card ─────────────────────────────────────────────
  itemCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  itemCardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(68,216,241,0.10)',
  },
  itemImageWrap: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(68,216,241,0.10)',
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: { width: 56, height: 56 },
  itemInfo: { flex: 1, gap: spacing.xs },
  itemTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,219,60,0.10)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  itemTypeText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.secondaryFixed,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  itemDesc: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },

  // ── Select Label ──────────────────────────────────────────
  selectLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  selectLabelText: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },

  // ── Pet Card ──────────────────────────────────────────────
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  petCard: { marginBottom: spacing.md },
  petCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  petImageWrap: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  petImage: { width: 64, height: 64 },
  petLevelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  petLevelText: { fontSize: fontSizes.xs, fontFamily: fonts.extraBold, color: colors.primary },
  petInfo: { flex: 1, gap: 2 },
  petName: { fontSize: fontSizes.large, fontFamily: fonts.bold, color: colors.onSurface, letterSpacing: -0.3 },
  petSpecies: { fontSize: fontSizes.xs, fontFamily: fonts.bold, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  hpSection: { marginTop: spacing.xs, gap: 4 },
  hpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hpLabel: { fontSize: fontSizes.xs, fontFamily: fonts.extraBold, color: colors.onSurfaceVariant, letterSpacing: 1, textTransform: 'uppercase' },
  hpValue: { fontSize: fontSizes.xs, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  hpCurrent: { fontFamily: fonts.bold },
  hpTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hpFill: { height: '100%', borderRadius: radii.full },

  useBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    shadowColor: 'rgba(68,216,241,0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  useBtnText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.extraBold,
    color: colors.onPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── States ────────────────────────────────────────────────
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSizes.body, fontFamily: fonts.regular, color: colors.onSurface, textAlign: 'center', marginTop: spacing['4xl'] },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, fontSize: fontSizes.span, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  emptyWrap: { padding: spacing['3xl'], alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: { fontSize: fontSizes.title, fontFamily: fonts.bold, color: colors.onSurface, marginBottom: spacing.sm },
  emptyText: { fontSize: fontSizes.span, fontFamily: fonts.regular, color: colors.onSurfaceVariant, textAlign: 'center' },
})