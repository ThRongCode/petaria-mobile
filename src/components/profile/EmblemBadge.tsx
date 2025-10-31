/**
 * EmblemBadge Component
 * 
 * Hexagonal badge with icon for achievements/collectibles
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, metrics } from '@/themes'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import Svg, { Polygon } from 'react-native-svg'

interface EmblemBadgeProps {
  iconName: keyof typeof SvgIcons
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  size?: number
}

const RARITY_COLORS = {
  common: '#A8A878',
  rare: '#48A7F8',
  epic: '#A040A0',
  legendary: '#F8D030',
}

export const EmblemBadge: React.FC<EmblemBadgeProps> = ({
  iconName,
  rarity = 'epic',
  size = 80,
}) => {
  const IconComponent = SvgIcons[iconName]
  const borderColor = RARITY_COLORS[rarity]

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Hexagonal Background */}
      <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.hexagon}>
        <Polygon
          points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25"
          fill={borderColor}
          stroke={borderColor}
          strokeWidth="3"
        />
        <Polygon
          points="50 10, 87 28, 87 72, 50 90, 13 72, 13 28"
          fill={colors.white}
        />
      </Svg>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <IconComponent width={size * 0.5} height={size * 0.5} color={borderColor} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: metrics.medium,
  },
  hexagon: {
    position: 'absolute',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
})
