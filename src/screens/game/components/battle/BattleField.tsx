/**
 * BattleField — "Lapis Glassworks" glass battle display
 *
 * Two-column Pokémon display with glass info badges and animated HP bars.
 */

import React from 'react'
import { StyleSheet, View, Image, Animated } from 'react-native'
import { ThemedText } from '@/components'
import { LinearGradient } from 'expo-linear-gradient'
import { getPokemonImage } from '@/assets/images'
import { getHpColor } from './battleUtils'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

interface BattlePetInfo {
  name: string
  species: string
  level: number
  currentHp: number
  temporaryStats: {
    maxHp: number
    hp: number
    attack: number
    defense: number
    speed: number
  }
}

interface PokemonDisplayProps {
  pet: BattlePetInfo
  hpAnim: Animated.Value
  hpPercentage: number
  showHpNumbers?: boolean
}

function PokemonDisplay({ pet, hpAnim, hpPercentage, showHpNumbers = false }: PokemonDisplayProps) {
  const hpColor = getHpColor(hpPercentage)
  return (
    <View style={styles.column}>
      <Image
        source={getPokemonImage(pet.species) as any}
        style={styles.sprite}
        resizeMode="contain"
      />
      <View style={styles.badge}>
        {/* Name + Level */}
        <View style={styles.badgeHeader}>
          <ThemedText style={styles.badgeName} numberOfLines={1}>{pet.name}</ThemedText>
          <ThemedText style={styles.badgeLevel}>Lv.{pet.level}</ThemedText>
        </View>
        {/* HP bar */}
        <View style={styles.hpRow}>
          <ThemedText style={styles.hpLabel}>HP</ThemedText>
          <View style={styles.hpTrack}>
            <Animated.View
              style={[
                styles.hpFill,
                {
                  width: hpAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: hpColor,
                },
              ]}
            />
          </View>
        </View>
        {showHpNumbers && (
          <ThemedText style={styles.hpNumbers}>
            {pet.currentHp} / {pet.temporaryStats.maxHp}
          </ThemedText>
        )}
      </View>
    </View>
  )
}

interface BattleFieldProps {
  playerPet: BattlePetInfo
  opponentPet: BattlePetInfo
  playerHpAnim: Animated.Value
  opponentHpAnim: Animated.Value
  playerHpPercentage: number
  opponentHpPercentage: number
}

export const BattleField: React.FC<BattleFieldProps> = ({
  playerPet,
  opponentPet,
  playerHpAnim,
  opponentHpAnim,
  playerHpPercentage,
  opponentHpPercentage,
}) => (
  <View style={styles.arena}>
    {/* VS divider */}
    <View style={styles.vsContainer}>
      <Ionicons name="flash" size={28} color={colors.secondaryContainer} />
    </View>
    <View style={styles.row}>
      <PokemonDisplay pet={playerPet} hpAnim={playerHpAnim} hpPercentage={playerHpPercentage} showHpNumbers />
      <PokemonDisplay pet={opponentPet} hpAnim={opponentHpAnim} hpPercentage={opponentHpPercentage} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  arena: {
    paddingTop: 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    position: 'relative',
  },
  vsContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 10,
    left: '50%',
    marginLeft: -16,
  },
  vsText: { fontSize: 28 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: spacing.md,
  },
  column: { flex: 1, alignItems: 'center' },
  sprite: { width: 120, height: 120, marginBottom: spacing.md },

  // ── Badge ──────────────────────────────────────
  badge: {
    width: '100%',
    maxWidth: 170,
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeName: {
    fontSize: fontSizes.span,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    flex: 1,
  },
  badgeLevel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
  hpRow: { flexDirection: 'row', alignItems: 'center' },
  hpLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    marginRight: spacing.sm,
  },
  hpTrack: {
    flex: 1,
    height: 7,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpFill: { height: '100%', borderRadius: 4 },
  hpNumbers: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
})