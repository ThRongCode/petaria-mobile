import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Animated, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { getPokemonImage } from '@/assets/images'
import { CaptureState } from './useCaptureAnimation'
import { colors, rarityColors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii } from '@/themes/metrics'

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

function getCaptureStatusText(captureState: CaptureState, speciesName: string): string {
  switch (captureState) {
    case 'throwing':
      return '🔴 Throwing Pokeball...'
    case 'shaking':
      return '⏳ Come on...'
    case 'success':
      return '✨ Gotcha!'
    case 'failed':
      return '💨 Oh no!'
    default:
      return `Wild ${speciesName} Appears!`
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

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Panel variant="dark" style={styles.modalContent}>
          <View style={styles.encounterContent}>
            <ThemedText style={[
              styles.encounterTitle,
              captureState === 'success' && { color: colors.success },
              captureState === 'failed' && { color: colors.error }
            ]}>
              {getCaptureStatusText(captureState, encounter.species)}
            </ThemedText>
            
            {/* Pokemon with animations */}
            <View style={styles.pokemonContainer}>
              <Animated.View style={[
                styles.pokemonWrapper,
                {
                  opacity: pokemonOpacity,
                  transform: [{ scale: pokemonScale }]
                }
              ]}>
                <Image source={getPokemonImage(encounter.species)} style={styles.monsterImage} resizeMode="contain" />
              </Animated.View>
              
              {/* Pokeball animation overlay */}
              {isCapturing && captureState !== 'idle' && (
                <Animated.View style={[
                  styles.pokeballOverlay,
                  {
                    opacity: pokeballAnim,
                    transform: [
                      { translateY: pokeballTranslateY },
                      { scale: pokeballScaleInterp },
                      { rotate: captureState === 'shaking' ? shakeRotate : '0deg' }
                    ]
                  }
                ]}>
                  <View style={styles.pokeballIcon}>
                    <View style={styles.pokeballTop} />
                    <View style={styles.pokeballMiddle}>
                      <View style={styles.pokeballButton} />
                    </View>
                    <View style={styles.pokeballBottom} />
                  </View>
                </Animated.View>
              )}
              
              {/* Success sparkles */}
              {captureState === 'success' && (
                <Animated.View style={[
                  styles.sparkleContainer,
                  {
                    opacity: sparkleAnim,
                    transform: [{ scale: sparkleScale }]
                  }
                ]}>
                  <ThemedText style={styles.sparkle}>✨</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle2]}>⭐</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle3]}>✨</ThemedText>
                  <ThemedText style={[styles.sparkle, styles.sparkle4]}>⭐</ThemedText>
                </Animated.View>
              )}
            </View>
            
            <ThemedText style={styles.monsterName}>
              {encounter.species} (Level {encounter.level})
            </ThemedText>
            <ThemedText style={[styles.monsterRarity, { color: getRarityColor(encounter.rarity) }]}>
              {encounter.rarity}
            </ThemedText>
            
            <View style={styles.captureInfo}>
              <ThemedText style={styles.captureText}>
                HP: {encounter.hp}/{encounter.maxHp}
              </ThemedText>
              <ThemedText style={styles.captureRate}>
                Attack: {encounter.attack} | Defense: {encounter.defense}
              </ThemedText>
            </View>

            <View style={styles.encounterActions}>
              <TouchableOpacity 
                style={[styles.actionButton, (encounter.caught || isCapturing) && styles.disabledButton]}
                onPress={onCapture}
                disabled={encounter.caught || isCapturing}
              >
                <LinearGradient
                  colors={encounter.caught || isCapturing ? [colors.surfaceContainerHighest, colors.surfaceContainerHigh] : [colors.success, '#2E7D32']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isCapturing ? (
                    <View style={styles.capturingContainer}>
                      <ActivityIndicator size="small" color={colors.onSurface} style={{ marginRight: 8 }} />
                      <ThemedText style={styles.buttonText}>
                        {captureState === 'throwing' ? 'Throwing...' : 
                         captureState === 'shaking' ? 'Catching...' : 'Capturing...'}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.buttonText}>
                      {encounter.caught ? '✓ Caught' : '⚾ Throw Pokéball'}
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
  capturingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.4,
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
})
