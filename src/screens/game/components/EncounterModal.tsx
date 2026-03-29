/**
 * EncounterModal — "Lapis Glassworks" glass encounter
 *
 * Full-screen modal for wild Pokémon encounter with capture animation,
 * pokeball shaking, success sparkles, and glass card layout.
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Animated, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { getPokemonImage } from '@/assets/images'
import { CaptureState } from './useCaptureAnimation'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'
import { gradientPrimary } from '@/themes/styles'

interface BackendEncounter {
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

interface EncounterModalProps {
  visible: boolean
  encounter: BackendEncounter | null
  isCapturing: boolean
  captureState: CaptureState
  pokemonOpacity: Animated.Value
  pokemonScale: Animated.Value
  pokeballAnim: Animated.Value
  shakeRotate: Animated.AnimatedInterpolation<string | number>
  pokeballTranslateY: Animated.AnimatedInterpolation<string | number>
  pokeballScaleInterp: Animated.AnimatedInterpolation<string | number>
  sparkleAnim: Animated.Value
  sparkleScale: Animated.AnimatedInterpolation<string | number>
  onCapture: () => void
  onFlee: () => void
}

function getRarityColor(rarity: string): string {
  return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
}

function getCaptureStatusText(captureState: CaptureState, name: string): string {
  switch (captureState) {
    case 'throwing': return '🔴 Throwing Pokeball...'
    case 'shaking':  return '⏳ Come on...'
    case 'success':  return '✨ Gotcha!'
    case 'failed':   return '💨 Oh no!'
    default:         return `Wild ${name} Appears!`
  }
}

export const EncounterModal: React.FC<EncounterModalProps> = ({
  visible,
  encounter,
  isCapturing,
  captureState,
  pokemonOpacity,
  pokemonScale,
  pokeballAnim,
  shakeRotate,
  pokeballTranslateY,
  pokeballScaleInterp,
  sparkleAnim,
  sparkleScale,
  onCapture,
  onFlee,
}) => {
  if (!encounter) return null

  const rarityColor = getRarityColor(encounter.rarity)

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Status */}
          <ThemedText
            style={[
              styles.statusTitle,
              captureState === 'success' && { color: colors.success },
              captureState === 'failed' && { color: colors.error },
            ]}
          >
            {getCaptureStatusText(captureState, encounter.species)}
          </ThemedText>

          {/* Pokemon + Animations */}
          <View style={styles.pokemonArea}>
            <Animated.View style={{ opacity: pokemonOpacity, transform: [{ scale: pokemonScale }] }}>
              <Image source={getPokemonImage(encounter.species)} style={styles.sprite} resizeMode="contain" />
            </Animated.View>

            {/* Pokeball overlay */}
            {isCapturing && captureState !== 'idle' && (
              <Animated.View
                style={[
                  styles.pokeballOverlay,
                  {
                    opacity: pokeballAnim,
                    transform: [
                      { translateY: pokeballTranslateY },
                      { scale: pokeballScaleInterp },
                      { rotate: captureState === 'shaking' ? shakeRotate : '0deg' },
                    ],
                  },
                ]}
              >
                <View style={styles.pokeball}>
                  <View style={styles.pokeballTop} />
                  <View style={styles.pokeballMiddle}>
                    <View style={styles.pokeballButton} />
                  </View>
                  <View style={styles.pokeballBottom} />
                </View>
              </Animated.View>
            )}

            {/* Sparkles */}
            {captureState === 'success' && (
              <Animated.View
                style={[styles.sparkleContainer, { opacity: sparkleAnim, transform: [{ scale: sparkleScale }] }]}
              >
                <ThemedText style={[styles.sparkle, { top: 5, left: 10 }]}>✨</ThemedText>
                <ThemedText style={[styles.sparkle, { top: 10, right: 20 }]}>⭐</ThemedText>
                <ThemedText style={[styles.sparkle, { bottom: 10, left: 20 }]}>✨</ThemedText>
                <ThemedText style={[styles.sparkle, { bottom: 20, right: 30 }]}>⭐</ThemedText>
              </Animated.View>
            )}
          </View>

          {/* Name / Rarity */}
          <ThemedText style={styles.monsterName}>
            {encounter.species} (Level {encounter.level})
          </ThemedText>
          <ThemedText style={[styles.rarityLabel, { color: rarityColor }]}>
            {encounter.rarity}
          </ThemedText>

          {/* Stats */}
          <View style={styles.statsCard}>
            <ThemedText style={styles.statsLine}>HP: {encounter.hp}/{encounter.maxHp}</ThemedText>
            <ThemedText style={styles.statsSecondary}>
              ATK: {encounter.attack}  |  DEF: {encounter.defense}  |  SPD: {encounter.speed}
            </ThemedText>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, (encounter.caught || isCapturing) && styles.disabledBtn]}
              onPress={onCapture}
              disabled={encounter.caught || isCapturing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={encounter.caught || isCapturing ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.success, '#2E7D32']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isCapturing ? (
                  <View style={styles.capturingRow}>
                    <ActivityIndicator size="small" color={colors.onSurface} />
                    <ThemedText style={styles.actionText}>
                      {captureState === 'throwing' ? 'Throwing...' : captureState === 'shaking' ? 'Catching...' : 'Capturing...'}
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.actionText}>
                    {encounter.caught ? '✓ Caught' : '⚾ Throw Pokéball'}
                  </ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, isCapturing && styles.disabledBtn]}
              onPress={onFlee}
              disabled={isCapturing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isCapturing ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.warning, '#E65100']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.actionText}>🏃 Run Away</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlow,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: fontSizes.title,
    fontFamily: fonts.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // ── Pokemon ────────────────────────────────────
  pokemonArea: {
    position: 'relative',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  sprite: {
    width: 150,
    height: 150,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.subtle,
  },
  pokeballOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeball: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.surfaceContainerHighest,
  },
  pokeballTop: { flex: 1, backgroundColor: colors.error },
  pokeballMiddle: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.onSurface,
    borderWidth: 3,
    borderColor: colors.surfaceContainerHighest,
    position: 'absolute',
  },
  pokeballBottom: { flex: 1, backgroundColor: colors.onSurface },
  sparkleContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: { position: 'absolute', fontSize: 22 },
  capturingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  // ── Info ───────────────────────────────────────
  monsterName: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  rarityLabel: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsCard: {
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  statsLine: {
    fontSize: fontSizes.body,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statsSecondary: {
    fontSize: fontSizes.span,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // ── Actions ────────────────────────────────────
  actions: { gap: spacing.md, width: '100%' },
  actionBtn: { width: '100%' },
  disabledBtn: { opacity: 0.4 },
  actionGradient: {
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
})