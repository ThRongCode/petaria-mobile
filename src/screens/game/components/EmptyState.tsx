/**
 * EmptyState Component
 * 
 * Generic empty state component for lists
 * Extracted from PetsScreen for reusability
 */

import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  buttonText?: string
  buttonIcon?: keyof typeof Ionicons.glyphMap
  onButtonPress?: () => void
  buttonColors?: [string, string]
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  buttonText,
  buttonIcon,
  onButtonPress,
  buttonColors = ['#FFD700', '#FFA000'],
}) => {
  return (
    <View style={styles.container}>
      <Panel variant="dark" style={styles.panel}>
        <ThemedText style={styles.icon}>{icon}</ThemedText>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        
        {buttonText && onButtonPress && (
          <TouchableOpacity style={styles.button} onPress={onButtonPress}>
            <LinearGradient
              colors={buttonColors}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {buttonIcon && <Ionicons name={buttonIcon} size={20} color="#fff" />}
              <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Panel>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
})
