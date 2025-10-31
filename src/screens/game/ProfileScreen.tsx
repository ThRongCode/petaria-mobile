/**
 * Profile Screen (New)
 * 
 * User profile with beautiful UI inspired by Pokemon Unite
 */

import React from 'react'
import { ScrollView, StyleSheet, View, Alert } from 'react-native'
import { ScreenContainer } from '@/components'
import {
  ProfileHeader,
  ProfileInfoCard,
  BattleRecordButton,
  EmblemsSection,
} from '@/components/profile'
import { useSelector } from 'react-redux'
import {
  getUserProfile,
  getPlayerXP,
  getGameStats,
} from '@/stores/selectors'
import { colors, metrics } from '@/themes'
import { getPokemonImage } from '@/assets/images'

export const ProfileScreen: React.FC = () => {
  const profile = useSelector(getUserProfile)
  const playerXP = useSelector(getPlayerXP)
  const gameStats = useSelector(getGameStats)

  // Calculate level from XP (simple formula)
  const level = Math.floor(playerXP.current / 100) + 1
  const currentLevelXP = playerXP.current % 100
  const xpToNextLevel = playerXP.toNext

  // Generate Friend ID from username
  const generateFriendId = (username: string) => {
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const part1 = String(hash).padStart(4, '0').slice(0, 4)
    const part2 = String(hash * 2).padStart(4, '0').slice(0, 4)
    const part3 = String(hash * 3).padStart(4, '0').slice(0, 4)
    const part4 = String(hash * 4).padStart(4, '0').slice(0, 4)
    return `${part1}-${part2}-${part3}-${part4}`
  }

  const friendId = generateFriendId(profile.username)

  // Sample emblems data
  const emblems = [
    { id: '1', iconName: 'StarsStack' as const, rarity: 'legendary' as const },
    { id: '2', iconName: 'AttackGauge' as const, rarity: 'epic' as const },
    { id: '3', iconName: 'CheckMark' as const, rarity: 'rare' as const },
  ]

  const handleBattleRecordPress = () => {
    Alert.alert(
      'Battle Record',
      `Wins: ${gameStats.battlesWon}\nTotal Battles: ${gameStats.battlesWon}`,
      [{ text: 'OK' }]
    )
  }

  const handleAddEmblem = () => {
    Alert.alert('Add Emblem', 'Feature coming soon!', [{ text: 'OK' }])
  }

  return (
    <ScreenContainer style={styles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Banner and Avatar */}
        <ProfileHeader
          avatarSource={getPokemonImage('pikachu')}
          username={profile.username}
          level={level}
          currentXP={currentLevelXP}
          maxXP={xpToNextLevel}
        />

        {/* Spacer for avatar overlap */}
        <View style={styles.spacer} />

        {/* Info Cards - with card wrapper */}
        <View style={styles.section}>
          <View style={styles.card}>
            <ProfileInfoCard bio="I like Psychic types" friendId={friendId} />
          </View>
        </View>

        {/* Battle Record Button - with card wrapper */}
        <View style={styles.section}>
          <View style={styles.card}>
            <BattleRecordButton onPress={handleBattleRecordPress} />
          </View>
        </View>

        {/* Emblems Section - with card wrapper */}
        <View style={styles.card}>
          <EmblemsSection emblems={emblems} onAddPress={handleAddEmblem} />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    backgroundColor: '#F8F9FA', // Light gray/white background
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: metrics.huge,
  },
  spacer: {
    height: 50, // Space for avatar overlap
  },
  section: {
    paddingHorizontal: metrics.large,
    marginBottom: metrics.medium,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
    padding: metrics.medium,
    marginHorizontal: metrics.large,
    marginBottom: metrics.medium,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },
})
