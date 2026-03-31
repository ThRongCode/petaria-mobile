/**
 * InlineEventCard — Inline encounter/event display for hunting session
 *
 * Replaces modal dialogs with an inline card that shows between
 * the stats bar and D-pad controls. States:
 *   - 'scouting'   — default idle state
 *   - 'nothing'    — no encounter found (auto-dismisses)
 *   - 'encounter'  — wild pokemon appears with Throw/Run actions
 *   - 'capturing'  — pokeball throw in progress
 *   - 'caught'     — capture success (auto-dismisses)
 *   - 'escaped'    — pokemon broke free (auto-dismisses)
 *   - 'fled'       — ran away (auto-dismisses)
 *   - 'no_balls'   — out of pokeballs
 */

import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { getPokemonImage } from '@/assets/images'
import { colors } from '@/themes/colors'
import { getRarityColor } from '@/features/hunt/utils'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

export type EventState =
  | 'scouting'
  | 'nothing'
  | 'encounter'
  | 'capturing'
  | 'caught'
  | 'escaped'
  | 'fled'
  | 'no_balls'

interface Encounter {
  id: string
  species: string
  rarity: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  caught: boolean
}

interface InlineEventCardProps {
  eventState: EventState
  encounter: Encounter | null
  onThrow: () => void
  onRun: () => void
  onGoToShop?: () => void
}

export const InlineEventCard: React.FC<InlineEventCardProps> = React.memo(({
  eventState,
  encounter,
  onThrow,
  onRun,
  onGoToShop,
}) => {

  // ── Scouting (default idle) ─────────────────────────
  if (eventState === 'scouting') {
    return (
      <View style={styles.container}>
        <View style={styles.scoutingCard}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>SCOUTING...</ThemedText>
          </View>
          <ThemedText style={styles.scoutingHint}>
            Explore the tall grass to find rare creatures.
          </ThemedText>
        </View>
      </View>
    )
  }

  // ── Nothing found ───────────────────────────────────
  if (eventState === 'nothing') {
    return (
      <View style={styles.container}>
        <View style={styles.transientCard}>
          <Ionicons name="search-outline" size={28} color={colors.onSurfaceVariant} />
          <ThemedText style={styles.transientTitle}>Nothing Here</ThemedText>
          <ThemedText style={styles.transientSub}>
            The area is empty. Keep exploring!
          </ThemedText>
        </View>
      </View>
    )
  }

  // ── Caught! ─────────────────────────────────────────
  if (eventState === 'caught') {
    return (
      <View style={styles.container}>
        <View style={[styles.transientCard, styles.successCard]}>
          {encounter && (
            <Image
              source={getPokemonImage(encounter.species)}
              style={styles.caughtSprite}
              resizeMode="contain"
            />
          )}
          <View style={styles.caughtInfo}>
            <View style={styles.caughtTitleRow}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <ThemedText style={[styles.transientTitle, { color: colors.success }]}>
                Caught {encounter?.species}!
              </ThemedText>
            </View>
            <ThemedText style={styles.transientSub}>
              Added to your collection.
            </ThemedText>
          </View>
        </View>
      </View>
    )
  }

  // ── Escaped ─────────────────────────────────────────
  if (eventState === 'escaped') {
    return (
      <View style={styles.container}>
        <View style={[styles.transientCard, styles.errorCard]}>
          <Ionicons name="close-circle" size={32} color={colors.error} />
          <ThemedText style={[styles.transientTitle, { color: colors.error }]}>
            It Escaped!
          </ThemedText>
          <ThemedText style={styles.transientSub}>
            {encounter?.species} broke free and ran away.
          </ThemedText>
        </View>
      </View>
    )
  }

  // ── Fled (player ran) ───────────────────────────────
  if (eventState === 'fled') {
    return (
      <View style={styles.container}>
        <View style={styles.transientCard}>
          <Ionicons name="exit-outline" size={28} color={colors.warning} />
          <ThemedText style={[styles.transientTitle, { color: colors.warning }]}>
            Got Away Safely
          </ThemedText>
          <ThemedText style={styles.transientSub}>
            You ran from {encounter?.species}.
          </ThemedText>
        </View>
      </View>
    )
  }

  // ── Out of Pokéballs ────────────────────────────────
  if (eventState === 'no_balls') {
    return (
      <View style={styles.container}>
        <View style={[styles.transientCard, styles.errorCard]}>
          <Ionicons name="alert-circle" size={32} color={colors.warning} />
          <ThemedText style={[styles.transientTitle, { color: colors.warning }]}>
            Out of Pokéballs!
          </ThemedText>
          <ThemedText style={styles.transientSub}>
            Visit the Shop to purchase more.
          </ThemedText>
          {onGoToShop && (
            <TouchableOpacity style={styles.shopBtn} onPress={onGoToShop} activeOpacity={0.8}>
              <ThemedText style={styles.shopBtnText}>Go to Shop</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  // ── Encounter / Capturing ───────────────────────────
  if (!encounter) return null

  const rarityColor = getRarityColor(encounter.rarity)
  const isCapturing = eventState === 'capturing'

  return (
    <View style={styles.container}>
      <View style={styles.encounterCard}>
        {/* Title */}
        <ThemedText style={styles.encounterTitle}>
          Wild {encounter.species} Appears!
        </ThemedText>

        {/* Pokemon row: sprite + stats */}
        <View style={styles.encounterBody}>
          <Image
            source={getPokemonImage(encounter.species)}
            style={styles.sprite}
            resizeMode="contain"
          />
          <View style={styles.encounterInfo}>
            <ThemedText style={styles.encounterName}>
              {encounter.species}
            </ThemedText>
            <View style={styles.levelRarityRow}>
              <ThemedText style={styles.levelText}>Lv.{encounter.level}</ThemedText>
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '25' }]}>
                <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
                  {encounter.rarity}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.statLine}>
              HP {encounter.hp}/{encounter.maxHp}
            </ThemedText>
            <ThemedText style={styles.statLineSecondary}>
              ATK {encounter.attack}  DEF {encounter.defense}
            </ThemedText>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.throwBtn, isCapturing && styles.disabledBtn]}
            onPress={onThrow}
            disabled={isCapturing || encounter.caught}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isCapturing ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.success, '#2E7D32']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isCapturing ? (
                <View style={styles.actionRow}>
                  <ActivityIndicator size="small" color={colors.onSurface} />
                  <ThemedText style={styles.actionText}>Catching...</ThemedText>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <Ionicons name="tennisball" size={16} color="#FFF" />
                  <ThemedText style={styles.actionText}>Throw</ThemedText>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.runBtn, isCapturing && styles.disabledBtn]}
            onPress={onRun}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <View style={styles.runGradient}>
              <Ionicons name="exit-outline" size={16} color={colors.onSurfaceVariant} />
              <ThemedText style={styles.runText}>Run</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  // ── Scouting ────────────────────────────────────
  scoutingCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(53, 57, 70, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scoutingHint: {
    fontSize: fontSizes.span,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // ── Transient (nothing/caught/escaped/fled) ─────
  transientCard: {
    alignItems: 'center',
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  successCard: {
    flexDirection: 'row',
    borderColor: 'rgba(35, 193, 107, 0.3)',
  },
  errorCard: {
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  caughtSprite: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.subtle,
  },
  caughtInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  caughtTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transientTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  transientSub: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  shopBtn: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255, 219, 60, 0.15)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 219, 60, 0.3)',
  },
  shopBtnText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.secondaryContainer,
  },

  // ── Encounter ───────────────────────────────────
  encounterCard: {
    backgroundColor: colors.glass.default,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  encounterTitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  encounterBody: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  sprite: {
    width: 100,
    height: 100,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.subtle,
  },
  encounterInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  encounterName: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  levelRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  rarityText: {
    fontSize: fontSizes.micro + 1,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statLine: {
    fontSize: fontSizes.span,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    marginTop: spacing.xxs,
  },
  statLineSecondary: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },

  // ── Actions ─────────────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {},
  throwBtn: {
    flex: 2,
  },
  runBtn: {
    flex: 1,
  },
  disabledBtn: { opacity: 0.4 },
  actionGradient: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: '#FFF',
  },
  runGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.glass.prominent,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  runText: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
  },
})
