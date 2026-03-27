import React from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from '@/components'
import { Panel } from './Panel'
import { colors, fonts, spacing, radii } from '@/themes'

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
  iconColor = colors.onSurface,
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
          color={locked ? colors.onSurfaceVariant : iconColor} 
        />
        {locked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color={colors.onSurface} />
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
    gap: spacing.sm,
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
    backgroundColor: 'rgba(10, 14, 26, 0.7)',
    borderRadius: radii.md,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: radii.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  badgeText: {
    color: colors.onError,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  label: {
    fontSize: 12,
    color: colors.onSurface,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
  },
  labelLocked: {
    color: colors.onSurfaceVariant,
  },
})
