/**
 * Game UI Components
 * 
 * Reusable, game-themed components for consistent UI across the app
 */

import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics, fontSizes } from '@/themes'
import { SvgIcons } from '../assets/images/gui-icons-components'
import { GuiIcons } from '@/assets/images'

// Rarity colors
export const RARITY_COLORS = {
  Common: '#9E9E9E',
  Rare: '#2196F3',
  Epic: '#9C27B0',
  Legendary: '#FF9800',
}

// Rarity gradients
export const RARITY_GRADIENTS = {
  Common: ['#BDBDBD', '#9E9E9E'],
  Rare: ['#64B5F6', '#2196F3'],
  Epic: ['#BA68C8', '#9C27B0'],
  Legendary: ['#FFB74D', '#FF9800'],
}

interface CurrencyDisplayProps {
  coins: number
  gems: number
  style?: ViewStyle
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ coins, gems, style }) => (
  <View style={[styles.currencyContainer, style]}>
    <View style={styles.currencyItem}>
      <Image source={GuiIcons.wallet} style={[styles.currencyIcon, { tintColor: '#FFD700' }]} />
      <ThemedText style={styles.currencyText}>{coins.toLocaleString()}</ThemedText>
    </View>
    <View style={styles.currencyItem}>
      <Image source={GuiIcons.starsStack} style={[styles.currencyIcon, { tintColor: '#00BCD4' }]} />
      <ThemedText style={styles.currencyText}>{gems}</ThemedText>
    </View>
  </View>
)

interface RarityBadgeProps {
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  style?: ViewStyle
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity, style }) => (
  <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[rarity] }, style]}>
    <Image source={GuiIcons.starsStack} style={[styles.rarityIcon, { tintColor: '#FFF' }]} />
    <ThemedText style={styles.rarityText}>{rarity}</ThemedText>
  </View>
)

interface StatBarProps {
  label: string
  current: number
  max: number
  color?: string
  style?: ViewStyle
}

export const StatBar: React.FC<StatBarProps> = ({ 
  label, 
  current, 
  max, 
  color = colors.success,
  style 
}) => {
  const percentage = Math.min((current / max) * 100, 100)
  
  return (
    <View style={[styles.statBarContainer, style]}>
      <View style={styles.statBarHeader}>
        <ThemedText style={styles.statBarLabel}>{label}</ThemedText>
        <ThemedText style={styles.statBarValue}>{current}/{max}</ThemedText>
      </View>
      <View style={styles.statBarTrack}>
        <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

interface PokemonSpriteProps {
  image: any
  size?: number
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  style?: ImageStyle
  showRarityBorder?: boolean
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({ 
  image, 
  size = 80, 
  rarity,
  style,
  showRarityBorder = false 
}) => {
  const borderColor = rarity && showRarityBorder ? RARITY_COLORS[rarity] : 'transparent'
  
  return (
    <View style={[
      styles.spriteContainer, 
      { 
        width: size + 16, 
        height: size + 16,
        borderColor,
        borderWidth: showRarityBorder ? 3 : 0,
      }
    ]}>
      <Image 
        source={image} 
        style={[styles.spriteImage, { width: size, height: size }, style]} 
        resizeMode="contain"
      />
    </View>
  )
}

interface GameCardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  disabled?: boolean
}

export const GameCard: React.FC<GameCardProps> = ({ children, style, onPress, disabled }) => {
  const Container = onPress ? TouchableOpacity : View
  
  return (
    <Container 
      style={[styles.gameCard, style]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  )
}

interface IconButtonProps {
  icon: keyof typeof SvgIcons | any
  size?: number
  color?: string
  onPress: () => void
  style?: ViewStyle
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  size = 24, 
  color = colors.primary,
  onPress,
  style 
}) => {
  // Check if it's an SVG icon name
  if (typeof icon === 'string' && icon in SvgIcons) {
    const IconComponent = SvgIcons[icon as keyof typeof SvgIcons];
    return (
      <TouchableOpacity style={[styles.iconButton, style]} onPress={onPress} activeOpacity={0.7}>
        <IconComponent width={size} height={size} color={color} />
      </TouchableOpacity>
    );
  }
  
  // Fallback to Image for old usage
  return (
    <TouchableOpacity style={[styles.iconButton, style]} onPress={onPress} activeOpacity={0.7}>
      <Image source={icon} style={[styles.iconButtonImage, { width: size, height: size, tintColor: color }]} />
    </TouchableOpacity>
  );
}

interface LevelBadgeProps {
  level: number
  style?: ViewStyle
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, style }) => (
  <View style={[styles.levelBadge, style]}>
    <ThemedText style={styles.levelText}>Lv {level}</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currencyIcon: {
    width: 20,
    height: 20,
  },
  currencyText: {
    fontSize: fontSizes.body,
    fontWeight: '700',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityIcon: {
    width: 14,
    height: 14,
  },
  rarityText: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: '#FFF',
  },
  statBarContainer: {
    gap: 4,
  },
  statBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBarLabel: {
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  statBarValue: {
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
  statBarTrack: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  spriteContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  spriteImage: {
    // Image size set dynamically
  },
  gameCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  iconButtonImage: {
    // Size set dynamically
  },
  levelBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: '#FFF',
  },
})
