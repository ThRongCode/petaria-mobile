import React from 'react'
import { StyleSheet, View, TouchableOpacity, Animated, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface HuntingControlsProps {
  actionsLeft: number
  isMoving: boolean
  moveAnimation: Animated.Value
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void
  onExit: () => void
}

export const HuntingControls: React.FC<HuntingControlsProps> = ({
  actionsLeft,
  isMoving,
  moveAnimation,
  onMove,
  onExit,
}) => {
  const isDisabled = actionsLeft <= 0 || isMoving

  return (
    <View style={styles.container}>
      {/* Exploration area */}
      <View style={styles.explorationArea}>
        <Animated.View 
          style={[
            styles.explorerIcon,
            {
              transform: [{
                scale: moveAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })
              }]
            }
          ]}
        >
          <ThemedText style={styles.explorerEmoji}>🧙‍♂️</ThemedText>
        </Animated.View>
        
        <ThemedText style={styles.explorationHint}>
          Choose a direction to explore
        </ThemedText>
      </View>

      {/* Movement controls - D-Pad Layout */}
      <View style={styles.movementControls}>
        {/* Up Button */}
        <View style={styles.movementRow}>
          <TouchableOpacity 
            style={[styles.movementButton, isDisabled && styles.disabledButton]}
            onPress={() => onMove('up')}
            disabled={isDisabled}
          >
            <Panel variant="dark" style={styles.buttonPanel}>
              {isMoving ? (
                <ActivityIndicator size="small" color="#FFD700" />
              ) : (
                <Ionicons name="arrow-up" size={28} color="#FFD700" />
              )}
              <ThemedText style={styles.movementLabel}>Up</ThemedText>
            </Panel>
          </TouchableOpacity>
        </View>
        
        {/* Left and Right Buttons */}
        <View style={styles.movementRow}>
          <TouchableOpacity 
            style={[styles.movementButton, isDisabled && styles.disabledButton]}
            onPress={() => onMove('left')}
            disabled={isDisabled}
          >
            <Panel variant="dark" style={styles.buttonPanel}>
              {isMoving ? (
                <ActivityIndicator size="small" color="#FFD700" />
              ) : (
                <Ionicons name="arrow-back" size={28} color="#FFD700" />
              )}
              <ThemedText style={styles.movementLabel}>Left</ThemedText>
            </Panel>
          </TouchableOpacity>
          
          <View style={styles.dpadSpacer} />
          
          <TouchableOpacity 
            style={[styles.movementButton, isDisabled && styles.disabledButton]}
            onPress={() => onMove('right')}
            disabled={isDisabled}
          >
            <Panel variant="dark" style={styles.buttonPanel}>
              {isMoving ? (
                <ActivityIndicator size="small" color="#FFD700" />
              ) : (
                <Ionicons name="arrow-forward" size={28} color="#FFD700" />
              )}
              <ThemedText style={styles.movementLabel}>Right</ThemedText>
            </Panel>
          </TouchableOpacity>
        </View>
        
        {/* Down Button */}
        <View style={styles.movementRow}>
          <TouchableOpacity 
            style={[styles.movementButton, isDisabled && styles.disabledButton]}
            onPress={() => onMove('down')}
            disabled={isDisabled}
          >
            <Panel variant="dark" style={styles.buttonPanel}>
              {isMoving ? (
                <ActivityIndicator size="small" color="#FFD700" />
              ) : (
                <Ionicons name="arrow-down" size={28} color="#FFD700" />
              )}
              <ThemedText style={styles.movementLabel}>Down</ThemedText>
            </Panel>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exit button */}
      <View style={styles.exitContainer}>
        <TouchableOpacity
          onPress={onExit}
          style={styles.exitButtonContainer}
        >
          <LinearGradient
            colors={['#757575', '#616161']}
            style={styles.exitButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <ThemedText style={styles.exitButtonText}>Save & Exit</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  explorationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  explorerIcon: {
    marginBottom: 16,
  },
  explorerEmoji: {
    fontSize: 60,
  },
  explorationHint: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  movementControls: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  movementButton: {
    width: 100,
    height: 90,
  },
  dpadSpacer: {
    width: 40,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  movementLabel: {
    fontSize: 13,
    color: '#FFD700',
    marginTop: 6,
    fontWeight: '600',
  },
  exitContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  exitButtonContainer: {
    width: '100%',
  },
  exitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})
