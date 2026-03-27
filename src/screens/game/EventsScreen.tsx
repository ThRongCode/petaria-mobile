/**
 * Events Screen
 * 
 * Shows active and upcoming time-limited events
 */

import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, RefreshControl, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { Panel, TopBar, LoadingContainer } from '@/components/ui'
import { useSelector } from 'react-redux'
import { getUserProfile } from '@/stores/selectors'
import { eventApi, GameEvent, UpcomingEvent } from '@/services/api/eventApi'
import { getPokemonImage } from '@/assets/images'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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
  const userProfile = useSelector(getUserProfile)
  
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const [activeResponse, upcomingResponse] = await Promise.all([
        eventApi.getActiveEvents(),
        eventApi.getUpcomingEvents(),
      ])
      
      if (activeResponse.success) {
        setActiveEvents(activeResponse.data || [])
      }
      if (upcomingResponse.success) {
        setUpcomingEvents(upcomingResponse.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])
  
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchEvents()
  }, [fetchEvents])
  
  // Render active event card
  const renderActiveEventCard = (event: GameEvent) => {
    const typeConfig = EVENT_TYPE_CONFIG[event.type] || { icon: 'calendar', color: '#888', label: 'Event' }
    
    return (
      <Panel key={event.id} variant="dark" style={styles.eventCard}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '30' }]}>
            <Ionicons name={typeConfig.icon} size={20} color={typeConfig.color} />
            <ThemedText style={[styles.typeLabel, { color: typeConfig.color }]}>
              {typeConfig.label}
            </ThemedText>
          </View>
          
          <View style={styles.timeRemaining}>
            <Ionicons name="time" size={16} color="#FF5722" />
            <ThemedText style={styles.timeText}>{event.timeRemaining}</ThemedText>
          </View>
        </View>
        
        {/* Event Title */}
        <ThemedText style={styles.eventTitle}>{event.name}</ThemedText>
        <ThemedText style={styles.eventDescription}>{event.description}</ThemedText>
        
        {/* Event Bonuses */}
        {event.config && (
          <View style={styles.bonusRow}>
            {event.config.xpMultiplier && event.config.xpMultiplier > 1 && (
              <View style={styles.bonusItem}>
                <Ionicons name="star" size={16} color="#9C27B0" />
                <ThemedText style={styles.bonusText}>
                  {event.config.xpMultiplier}x XP
                </ThemedText>
              </View>
            )}
            {event.config.spawnBonus && event.config.spawnBonus > 0 && (
              <View style={styles.bonusItem}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <ThemedText style={styles.bonusText}>
                  +{Math.round(event.config.spawnBonus * 100)}% Spawn Rate
                </ThemedText>
              </View>
            )}
          </View>
        )}
        
        {/* Featured Pokemon */}
        {event.spawns && event.spawns.length > 0 && (
          <View style={styles.featuredSection}>
            <ThemedText style={styles.featuredTitle}>Featured Pokémon</ThemedText>
            <View style={styles.featuredList}>
              {event.spawns.slice(0, 4).map((spawn, idx) => (
                <View key={idx} style={styles.featuredPokemon}>
                  <Image
                    source={getPokemonImage(spawn.species) as any}
                    style={styles.pokemonImage}
                    resizeMode="contain"
                  />
                  <ThemedText style={styles.pokemonName}>{spawn.species}</ThemedText>
                  <View style={[styles.rarityDot, { backgroundColor: getRarityColor(spawn.rarity) }]} />
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Go Hunt Button */}
        <TouchableOpacity
          style={styles.huntButtonContainer}
          onPress={() => router.push('/hunt')}
        >
          <LinearGradient
            colors={[typeConfig.color, shadeColor(typeConfig.color, -20)]}
            style={styles.huntButton}
          >
            <Ionicons name="leaf" size={18} color="#fff" />
            <ThemedText style={styles.huntButtonText}>Go Hunt!</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </Panel>
    )
  }
  
  // Render upcoming event card
  const renderUpcomingEventCard = (event: UpcomingEvent) => {
    const typeConfig = EVENT_TYPE_CONFIG[event.type] || { icon: 'calendar', color: '#888', label: 'Event' }
    
    return (
      <Panel key={event.id} variant="dark" style={styles.upcomingCard}>
        <View style={styles.upcomingHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '30' }]}>
            <Ionicons name={typeConfig.icon} size={16} color={typeConfig.color} />
          </View>
          <View style={styles.upcomingInfo}>
            <ThemedText style={styles.upcomingTitle}>{event.name}</ThemedText>
            <ThemedText style={styles.upcomingTime}>{event.startsIn}</ThemedText>
          </View>
        </View>
      </Panel>
    )
  }
  
  return (
    <ImageBackground 
      source={require('@/assets/images/background/mobile_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        username={userProfile?.username || 'Trainer'}
        coins={userProfile?.currency?.coins || 0}
        gems={userProfile?.currency?.gems || 0}
        pokeballs={userProfile?.currency?.pokeballs || 0}
        
        
        battleTickets={userProfile?.battleTickets}
        huntTickets={userProfile?.huntTickets}
        onSettingsPress={() => router.push('/profile')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondaryContainer}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>🎉 Events</ThemedText>
          <View style={styles.placeholder} />
        </View>
        
        {loading ? (
          <LoadingContainer message="Loading events..." />
        ) : (
          <>
            {/* Active Events */}
            {activeEvents.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.activeDot} />
                  <ThemedText style={styles.sectionTitle}>Active Now</ThemedText>
                </View>
                {activeEvents.map(renderActiveEventCard)}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.3)" />
                <ThemedText style={styles.emptyText}>No Active Events</ThemedText>
                <ThemedText style={styles.emptySubtext}>Check back later for special events!</ThemedText>
              </View>
            )}
            
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#2196F3" />
                  <ThemedText style={styles.sectionTitle}>Coming Soon</ThemedText>
                </View>
                {upcomingEvents.map(renderUpcomingEventCard)}
              </View>
            )}
          </>
        )}
        
        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  )
}

// Helper functions
function getRarityColor(rarity: string): string {
  return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['5xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['5xl'],
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.outline,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.outlineVariant,
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  eventCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radii.DEFAULT,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 60, 0.25)',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    gap: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: 13,
    color: '#FF5722',
    fontFamily: fonts.semiBold,
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  bonusRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  bonusText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  featuredSection: {
    marginBottom: spacing.lg,
  },
  featuredTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.outline,
    marginBottom: 10,
  },
  featuredList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featuredPokemon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
    borderRadius: radii.md,
    minWidth: 70,
  },
  pokemonImage: {
    width: 50,
    height: 50,
  },
  pokemonName: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  huntButtonContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  huntButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.sm,
  },
  huntButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  upcomingCard: {
    padding: spacing.md,
    marginBottom: 10,
    borderRadius: radii.md,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
  upcomingTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.info,
    marginTop: 2,
  },
})
