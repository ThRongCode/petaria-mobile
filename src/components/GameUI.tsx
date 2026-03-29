/**
 * Game UI Components
 * 
 * Reusable, game-themed components for consistent UI across the app
 */

import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics, fonts, fontSizes, spacing, radii } from '@/themes'
import { SvgIcons } from '../assets/images/gui-icons-components'
import { GuiIcons } from '@/assets/images'

// Rarity colors
export const RARITY_COLORS = {
  Common: colors.rarityColors.common,
  Rare: colors.rarityColors.rare,
  Epic: colors.rarityColors.epic,
  Legendary: colors.rarityColors.legendary,
}

// Rarity gradients
export const RARITY_GRADIENTS = {
  Common: [colors.rarityColors.common, '#7A7A5C'],
  Rare: [colors.rarityColors.rare, '#4A78C8'],
  Epic: [colors.rarityColors.epic, '#7A2E7A'],
  Legendary: [colors.rarityColors.legendary, '#D4A800'],
}

interface CurrencyDisplayProps {
  coins: number
  gems: number
  style?: ViewStyle
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ coins, gems, style }) => (
  <View style={[styles.currencyContainer, style]}>
    <View style={styles.currencyItem}>
      <Image source={GuiIcons.wallet} style={[styles.currencyIcon, { tintColor: colors.secondaryContainer }]} />
      <ThemedText style={styles.currencyText}>{coins.toLocaleString()}</ThemedText>
    </View>
    <View style={styles.currencyItem}>
      <Image source={GuiIcons.starsStack} style={[styles.currencyIcon, { tintColor: colors.primary }]} />
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
    gap: spacing.lg,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  currencyIcon: {
    width: 20,
    height: 20,
  },
  currencyText: {
    fontSize: fontSizes.body,
    fontFamily: fonts.bold,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  rarityIcon: {
    width: 14,
    height: 14,
  },
  rarityText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  statBarContainer: {
    gap: spacing.xs,
  },
  statBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBarLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
  },
  statBarValue: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
  },
  statBarTrack: {
    height: 10,
    backgroundColor: colors.glass.subtle,
    borderRadius: 5,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  spriteContainer: {
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  spriteImage: {
    // Image size set dynamically
  },
  gameCard: {
    backgroundColor: colors.glass.darkFill,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: 'rgba(0, 188, 212, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.glass.subtle,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
  iconButtonImage: {
    // Size set dynamically
  },
  levelBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  levelText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.onPrimaryContainer,
  },
})
