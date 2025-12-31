import React from 'react'
import { StyleSheet, View, Image, Animated } from 'react-native'
import { ThemedText } from '@/components'
import { Panel } from '@/components/ui'
import { getPokemonImage } from '@/assets/images'
import { getHpColor } from './battleUtils'

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
        {/* Player Pokemon - Left Half */}
        <View style={styles.pokemonColumn}>
          <Image 
            source={getPokemonImage(playerPet.species) as any}
            style={styles.pokemonSprite}
            resizeMode="contain"
          />
          {/* Player Info Badge */}
          <Panel variant="dark" style={styles.infoBadge}>
            <View style={styles.infoBadgeHeader}>
              <ThemedText style={styles.badgeName}>{playerPet.name}</ThemedText>
              <ThemedText style={styles.badgeLevel}>Lv.{playerPet.level}</ThemedText>
            </View>
            <View style={styles.hpBarContainer}>
              <ThemedText style={styles.hpLabel}>HP</ThemedText>
              <View style={styles.hpBarOuter}>
                <Animated.View 
                  style={[
                    styles.hpBarInner,
                    {
                      width: playerHpAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: getHpColor(playerHpPercentage)
                    }
                  ]} 
                />
              </View>
            </View>
            <ThemedText style={styles.hpNumbers}>
              {playerPet.currentHp} / {playerPet.temporaryStats.maxHp}
            </ThemedText>
          </Panel>
        </View>

        {/* Opponent Pokemon - Right Half */}
        <View style={styles.pokemonColumn}>
          <Image 
            source={getPokemonImage(opponentPet.species) as any}
            style={styles.pokemonSprite}
            resizeMode="contain"
          />
          {/* Opponent Info Badge */}
          <Panel variant="dark" style={styles.infoBadge}>
            <View style={styles.infoBadgeHeader}>
              <ThemedText style={styles.badgeName}>{opponentPet.name}</ThemedText>
              <ThemedText style={styles.badgeLevel}>Lv.{opponentPet.level}</ThemedText>
            </View>
            <View style={styles.hpBarContainer}>
              <ThemedText style={styles.hpLabel}>HP</ThemedText>
              <View style={styles.hpBarOuter}>
                <Animated.View 
                  style={[
                    styles.hpBarInner,
                    {
                      width: opponentHpAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: getHpColor(opponentHpPercentage)
                    }
                  ]} 
                />
              </View>
            </View>
          </Panel>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  battleFieldArea: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pokemonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  pokemonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pokemonSprite: {
    width: 130,
    height: 130,
    marginBottom: 16,
  },
  infoBadge: {
    width: '100%',
    maxWidth: 180,
    padding: 12,
  },
  infoBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgeLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  hpBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hpLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
  },
  hpBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarInner: {
    height: '100%',
  },
  hpNumbers: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
    marginTop: 4,
  },
})
