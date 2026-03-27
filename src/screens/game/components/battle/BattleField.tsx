import React from 'react'
import { StyleSheet, View, Image, Animated } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { getHpColor } from './battleUtils'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing } from '@/themes/metrics'

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

function PokemonDisplay({ pet, hpAnim, hpPercentage, showHpNumbers = false }: PokemonDisplayProps): React.ReactElement {
  return (
    <View style={styles.pokemonColumn}>
      <Image
        source={getPokemonImage(pet.species) as any}
        style={styles.pokemonSprite}
        resizeMode="contain"
      />
      <Panel variant="dark" style={styles.infoBadge}>
        <View style={styles.infoBadgeHeader}>
          <ThemedText style={styles.badgeName}>{pet.name}</ThemedText>
          <ThemedText style={styles.badgeLevel}>Lv.{pet.level}</ThemedText>
        </View>
        <View style={styles.hpBarContainer}>
          <ThemedText style={styles.hpLabel}>HP</ThemedText>
          <View style={styles.hpBarOuter}>
            <Animated.View
              style={[
                styles.hpBarInner,
                {
                  width: hpAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getHpColor(hpPercentage)
                }
              ]}
            />
          </View>
        </View>
        {showHpNumbers && (
          <ThemedText style={styles.hpNumbers}>
            {pet.currentHp} / {pet.temporaryStats.maxHp}
          </ThemedText>
        )}
      </Panel>
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
}) => {
  return (
    <View style={styles.battleFieldArea}>
      <View style={styles.pokemonRow}>
        <PokemonDisplay
          pet={playerPet}
          hpAnim={playerHpAnim}
          hpPercentage={playerHpPercentage}
          showHpNumbers
        />
        <PokemonDisplay
          pet={opponentPet}
          hpAnim={opponentHpAnim}
          hpPercentage={opponentHpPercentage}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  battleFieldArea: {
    paddingTop: 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pokemonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pokemonSprite: {
    width: 130,
    height: 130,
    marginBottom: spacing.lg,
  },
  infoBadge: {
    width: '100%',
    maxWidth: 180,
    padding: spacing.md,
  },
  infoBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeName: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  badgeLevel: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.onSurfaceVariant,
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginRight: spacing.sm,
  },
  hpBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
  },
  hpNumbers: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
})
