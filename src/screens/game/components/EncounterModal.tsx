import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Modal, Animated, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { getPetImageByName } from '@/assets/images'
import { CaptureState } from './useCaptureAnimation'

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

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common': return '#9E9E9E'
    case 'Rare': return '#2196F3'
    case 'Epic': return '#9C27B0'
    case 'Legendary': return '#FF9800'
    default: return '#9E9E9E'
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

  const getCaptureStatusText = () => {
    switch (captureState) {
      case 'throwing': return '🔴 Throwing Pokéball...'
      case 'shaking': return '⏳ Come on...'
      case 'success': return '✨ Gotcha!'
      case 'failed': return '💨 Oh no!'
      default: return `Wild ${encounter.species} Appears!`
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Panel variant="dark" style={styles.modalContent}>
          <View style={styles.encounterContent}>
            <ThemedText style={[
              styles.encounterTitle,
              captureState === 'success' && { color: '#4CAF50' },
              captureState === 'failed' && { color: '#FF5722' }
            ]}>
              {getCaptureStatusText()}
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
                <Image source={getPetImageByName(encounter.species)} style={styles.monsterImage} />
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
                  colors={encounter.caught || isCapturing ? ['#666', '#444'] : ['#4CAF50', '#45a049']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isCapturing ? (
                    <View style={styles.capturingContainer}>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
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
                  colors={isCapturing ? ['#666', '#444'] : ['#FF9800', '#F57C00']}
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD700',
  },
  pokemonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  pokemonWrapper: {
    width: '100%',
    height: '100%',
  },
  monsterImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    borderColor: '#333',
  },
  pokeballTop: {
    flex: 1,
    backgroundColor: '#EF5350',
  },
  pokeballMiddle: {
    height: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#333',
    position: 'absolute',
  },
  pokeballBottom: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  monsterRarity: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  captureInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  captureText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  captureRate: {
    textAlign: 'center',
    fontSize: 14,
    color: '#B0B0B0',
  },
  encounterActions: {
    gap: 12,
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.4,
  },
  gradientButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})
