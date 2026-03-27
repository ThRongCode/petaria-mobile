/**
 * EncounterModal Component
 * Single Responsibility: Display Pokemon encounter UI with capture controls
 * 
 * This component handles:
 * - Pokemon display with animations
 * - Capture button with loading state
 * - Flee button
 * - Stats display
 */

import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { getPokemonImage } from '@/assets/images'
import { Encounter, CaptureState } from '../types'
import { getRarityColor, getCaptureStatusText, getCaptureButtonText } from '../utils'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

interface EncounterModalProps {
  visible: boolean
  encounter: Encounter | null
  isCapturing: boolean
  captureState: CaptureState
  
  // Animation values
  pokeballAnim: Animated.Value
  pokemonOpacity: Animated.Value
  pokemonScale: Animated.Value
  shakeAnim: Animated.Value
  sparkleAnim: Animated.Value
  
  // Actions
  onCapture: () => void
  onFlee: () => void
}

export const EncounterModal: React.FC<EncounterModalProps> = ({
  visible,
  encounter,
  isCapturing,
  captureState,
  pokeballAnim,
  pokemonOpacity,
  pokemonScale,
  shakeAnim,
  sparkleAnim,
  onCapture,
  onFlee,
}) => {
  if (!encounter) return null

  // Animation interpolations
  const pokeballTranslateY = pokeballAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  })

  const pokeballScale = pokeballAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.2, 1],
  })

  const shakeRotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  })

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.5, 1],
  })

  const isCaught = encounter.caught
  const isDisabled = isCaught || isCapturing

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Panel variant="dark" style={styles.modalContent}>
          <View style={styles.encounterContent}>
            {/* Title */}
            <ThemedText
              style={[
                styles.encounterTitle,
                captureState === 'success' && { color: colors.success },
                captureState === 'failed' && { color: colors.error },
              ]}
            >
              {getCaptureStatusText(captureState, encounter.species)}
            </ThemedText>

            {/* Pokemon with animations */}
            <View style={styles.pokemonContainer}>
              <Animated.View
                style={[
                  styles.pokemonWrapper,
                  {
                    opacity: pokemonOpacity,
                    transform: [{ scale: pokemonScale }],
                  },
                ]}
              >
                <Image
                  source={getPokemonImage(encounter.species)}
                  style={styles.monsterImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Pokeball animation overlay */}
              {isCapturing && captureState !== 'idle' && (
                <Animated.View
                  style={[
                    styles.pokeballOverlay,
                    {
                      opacity: pokeballAnim,
                      transform: [
                        { translateY: pokeballTranslateY },
                        { scale: pokeballScale },
                        { rotate: captureState === 'shaking' ? shakeRotate : '0deg' },
                      ],
                    },
                  ]}
                >
                  <PokeballIcon />
                </Animated.View>
              )}

              {/* Success sparkles */}
              {captureState === 'success' && (
                <Animated.View
                  style={[
                    styles.sparkleContainer,
                    {
                      opacity: sparkleAnim,
                      transform: [{ scale: sparkleScale }],
                    },
                  ]}
                >
                  <ThemedText style={styles.sparkle}>✨</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle2]}>⭐</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle3]}>✨</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle4]}>⭐</ThemedText>
                </Animated.View>
              )}
            </View>

            {/* Pokemon Info */}
            <ThemedText style={styles.monsterName}>
              {encounter.species} (Level {encounter.level})
            </ThemedText>
            <ThemedText style={[styles.monsterRarity, { color: getRarityColor(encounter.rarity) }]}>
              {encounter.rarity}
            </ThemedText>

            {/* Stats */}
            <View style={styles.captureInfo}>
              <ThemedText style={styles.captureText}>
                HP: {encounter.hp}/{encounter.maxHp}
              </ThemedText>
              <ThemedText style={styles.captureRate}>
                Attack: {encounter.attack} | Defense: {encounter.defense}
              </ThemedText>
            </View>

            {/* Actions */}
            <View style={styles.encounterActions}>
              <TouchableOpacity
                style={[styles.actionButton, isDisabled && styles.disabledButton]}
                onPress={onCapture}
                disabled={isDisabled}
              >
                <LinearGradient
                  colors={isDisabled ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.success, '#2E7D32']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isCapturing ? (
                    <View style={styles.capturingContainer}>
                      <ActivityIndicator size="small" color={colors.onSurface} style={{ marginRight: 8 }} />
                      <ThemedText style={styles.buttonText}>
                        {getCaptureButtonText(isCaught, isCapturing, captureState)}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.buttonText}>
                      {getCaptureButtonText(isCaught, isCapturing, captureState)}
                    </ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, isCapturing && styles.disabledButton]}
                onPress={onFlee}
                disabled={isCapturing}
              >
                <LinearGradient
                  colors={isCapturing ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.warning, '#E65100']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.buttonText}>🏃 Run Away</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Panel>
      </View>
    </Modal>
  )
}

// Pokeball Icon Component
const PokeballIcon: React.FC = () => (
  <View style={styles.pokeballIcon}>
    <View style={styles.pokeballTop} />
    <View style={styles.pokeballMiddle}>
      <View style={styles.pokeballButton} />
    </View>
    <View style={styles.pokeballBottom} />
  </View>
)

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  encounterContent: {
    alignItems: 'center',
  },
  encounterTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.secondaryContainer,
  },
  pokemonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    marginBottom: spacing.lg,
  },
  pokemonWrapper: {
    width: '100%',
    height: '100%',
  },
  monsterImage: {
    width: 150,
    height: 150,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
  },
  pokeballOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.surfaceContainerHighest,
  },
  pokeballTop: {
    flex: 1,
    backgroundColor: colors.error,
  },
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
  pokeballBottom: {
    flex: 1,
    backgroundColor: colors.onSurface,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  sparkle2: {
    top: 10,
    right: 20,
  },
  sparkle3: {
    bottom: 10,
    left: 20,
  },
  sparkle4: {
    bottom: 20,
    right: 30,
  },
  monsterName: {
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.onSurface,
  },
  monsterRarity: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  captureInfo: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  captureText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: fonts.medium,
    marginBottom: spacing.sm,
    color: colors.onSurface,
  },
  captureRate: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  encounterActions: {
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  capturingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
