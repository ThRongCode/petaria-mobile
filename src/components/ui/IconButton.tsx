import React from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from '@/components'
import { Panel } from './Panel'

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  locked?: boolean
  badge?: number
  style?: ViewStyle
  iconColor?: string
  iconSize?: number
}

/**
 * IconButton - Reusable button with icon and label
 * Used for navigation items in sidebars and menus
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onPress,
  locked = false,
  badge,
  style,
  iconColor = '#fff',
  iconSize = 32,
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={locked}
      style={[styles.container, style]}
    >
      <Panel variant="dark" style={styles.panel}>
        <Ionicons 
          name={icon} 
          size={iconSize} 
          color={locked ? '#666' : iconColor} 
        />
        {locked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color="#fff" />
          </View>
        )}
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </ThemedText>
          </View>
        )}
      </Panel>
      <ThemedText style={[styles.label, locked && styles.labelLocked]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  panel: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  labelLocked: {
    color: '#666',
  },
})
