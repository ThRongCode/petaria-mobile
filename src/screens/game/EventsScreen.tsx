/**
 * Events Screen — "Lapis Glassworks" redesign
 *
 * Shows active and upcoming time-limited events.
 * Adapted from existing patterns (no dedicated design file).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { ScreenContainer } from '@/components/ScreenContainer'
import { LoadingContainer } from '@/components/ui'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { eventApi, GameEvent, UpcomingEvent } from '@/services/api/eventApi'
import { getPokemonImage } from '@/assets/images'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { backgrounds } from '@/assets/images/backgrounds'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

// Event type icons and colors
const EVENT_TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  hunt_boost: { icon: 'trending-up', color: colors.success, label: 'Hunt Boost' },
  rare_spawn: { icon: 'sparkles', color: colors.secondaryContainer, label: 'Rare Spawn' },
  double_xp: { icon: 'star', color: '#9C27B0', label: 'Double XP' },
  special_hunt: { icon: 'leaf', color: colors.primary, label: 'Special Hunt' },
  shiny_chance: { icon: 'diamond', color: '#E91E63', label: 'Shiny Chance' },
}

export default function EventsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const userProfile = useSelector(getUserProfile)

  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      const [activeResponse, upcomingResponse] = await Promise.all([
        eventApi.getActiveEvents(),
        eventApi.getUpcomingEvents(),
      ])
      if (activeResponse.success) setActiveEvents(activeResponse.data || [])
      if (upcomingResponse.success) setUpcomingEvents(upcomingResponse.data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchEvents()
  }, [fetchEvents])

  const renderActiveEventCard = (event: GameEvent) => {
    const typeConfig = EVENT_TYPE_CONFIG[event.type] || { icon: 'calendar', color: '#888', label: 'Event' }

    return (
      <View key={event.id} style={styles.eventCard}>
        {/* Type + Timer */}
        <View style={styles.eventHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
            <Ionicons name={typeConfig.icon} size={18} color={typeConfig.color} />
            <ThemedText style={[styles.typeLabel, { color: typeConfig.color }]}>
              {typeConfig.label}
            </ThemedText>
          </View>
          <View style={styles.timeChip}>
            <Ionicons name="time" size={14} color="#FF5722" />
            <ThemedText style={styles.timeText}>{event.timeRemaining}</ThemedText>
          </View>
        </View>

        {/* Title + Description */}
        <ThemedText style={styles.eventTitle}>{event.name}</ThemedText>
        <ThemedText style={styles.eventDesc}>{event.description}</ThemedText>

        {/* Bonuses */}
        {event.config && (
          <View style={styles.bonusRow}>
            {event.config.xpMultiplier && event.config.xpMultiplier > 1 && (
              <View style={styles.bonusChip}>
                <Ionicons name="star" size={14} color="#9C27B0" />
                <ThemedText style={styles.bonusText}>{event.config.xpMultiplier}x XP</ThemedText>
              </View>
            )}
            {event.config.spawnBonus && event.config.spawnBonus > 0 && (
              <View style={styles.bonusChip}>
                <Ionicons name="trending-up" size={14} color={colors.success} />
                <ThemedText style={styles.bonusText}>
                  +{Math.round(event.config.spawnBonus * 100)}% Spawn
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Featured Pokémon */}
        {event.spawns && event.spawns.length > 0 && (
          <View style={styles.featuredSection}>
            <ThemedText style={styles.featuredTitle}>FEATURED POKÉMON</ThemedText>
            <View style={styles.featuredList}>
              {event.spawns.slice(0, 4).map((spawn, idx) => (
                <View key={idx} style={styles.featuredPokemon}>
                  <Image
                    source={getPokemonImage(spawn.species) as any}
                    style={styles.pokemonImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.pokemonName}>{spawn.species}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity onPress={() => router.push('/hunt')}>
          <LinearGradient
            colors={[typeConfig.color, shadeColor(typeConfig.color, -20)]}
            style={styles.ctaBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="leaf" size={16} color="#fff" />
            <ThemedText style={styles.ctaBtnText}>Go Hunt!</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  const renderUpcomingEventCard = (event: UpcomingEvent) => {
    const typeConfig = EVENT_TYPE_CONFIG[event.type] || { icon: 'calendar', color: '#888', label: 'Event' }
    return (
      <View key={event.id} style={styles.upcomingCard}>
        <View style={[styles.upcomingIcon, { backgroundColor: typeConfig.color + '20' }]}>
          <Ionicons name={typeConfig.icon} size={18} color={typeConfig.color} />
        </View>
        <View style={styles.upcomingInfo}>
          <ThemedText style={styles.upcomingTitle}>{event.name}</ThemedText>
          <ThemedText style={styles.upcomingTime}>{event.startsIn}</ThemedText>
        </View>
      </View>
    )
  }

  return (
    <ScreenContainer backgroundImage={backgrounds.default}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Events</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <LoadingContainer message="Loading events..." />
        ) : (
          <>
            {activeEvents.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.activeDot} />
                  <ThemedText style={styles.sectionTitle}>ACTIVE NOW</ThemedText>
                </View>
                {activeEvents.map(renderActiveEventCard)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.2)" />
                <ThemedText style={styles.emptyText}>No Active Events</ThemedText>
                <ThemedText style={styles.emptySubtext}>Check back later!</ThemedText>
              </View>
            )}

            {upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={18} color={colors.info} />
                  <ThemedText style={styles.sectionTitle}>COMING SOON</ThemedText>
                </View>
                {upcomingEvents.map(renderUpcomingEventCard)}
              </View>
            )}
          </>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </ScreenContainer>
  )
}

// Helper
function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },

  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  headerTitle: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },

  // ── Sections ──────────────────────────────────────────────
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },

  // ── Event Card ────────────────────────────────────────────
  eventCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: 'rgba(255,219,60,0.25)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
  },
  typeLabel: { fontSize: fontSizes.small, fontFamily: fonts.bold },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  timeText: { fontSize: fontSizes.small, color: '#FF5722', fontFamily: fonts.semiBold },
  eventTitle: { fontSize: fontSizes.title, fontFamily: fonts.bold, color: colors.onSurface },
  eventDesc: { fontSize: fontSizes.span, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  bonusRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  bonusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  bonusText: { fontSize: fontSizes.small, fontFamily: fonts.semiBold, color: colors.onSurface },

  // ── Featured ──────────────────────────────────────────────
  featuredSection: { marginTop: spacing.sm, gap: spacing.sm },
  featuredTitle: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featuredList: { flexDirection: 'row', gap: spacing.md },
  featuredPokemon: { alignItems: 'center', gap: 2 },
  pokemonImage: { width: 40, height: 40 },
  pokemonName: { fontSize: fontSizes.xs, fontFamily: fonts.semiBold, color: colors.onSurfaceVariant },

  // ── CTA ───────────────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    marginTop: spacing.sm,
  },
  ctaBtnText: { fontSize: fontSizes.span, fontFamily: fonts.bold, color: '#fff' },

  // ── Upcoming ──────────────────────────────────────────────
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.glass.subtle,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  upcomingIcon: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  upcomingInfo: { flex: 1 },
  upcomingTitle: { fontSize: fontSizes.body, fontFamily: fonts.bold, color: colors.onSurface },
  upcomingTime: { fontSize: fontSizes.small, fontFamily: fonts.regular, color: colors.onSurfaceVariant },

  // ── Empty ─────────────────────────────────────────────────
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['5xl'] },
  emptyText: { fontSize: fontSizes.large, fontFamily: fonts.bold, color: colors.outline, marginTop: spacing.lg },
  emptySubtext: { fontSize: fontSizes.span, fontFamily: fonts.regular, color: colors.outlineVariant, marginTop: spacing.sm },
})