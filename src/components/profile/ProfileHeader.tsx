/**
 * ProfileHeader Component
 * 
 * Top section with banner, avatar, level, and XP progress
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from '@/components/ThemedText'
import { ProfileAvatar } from './ProfileAvatar'
import { colors, metrics } from '@/themes'

interface ProfileHeaderProps {
  avatarSource: any
  username: string
  level: number
  currentXP: number
  maxXP: number
  onEditPress?: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarSource,
  username,
  level,
  currentXP,
  maxXP,
  onEditPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Banner Background */}
      <LinearGradient
        colors={['#FF6B9D', '#C44569']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        {/* Decorative pattern overlay */}
        <View style={styles.patternOverlay} />
      </LinearGradient>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Avatar with Progress Ring */}
        <View style={styles.avatarSection}>
          <ProfileAvatar
            avatarSource={avatarSource}
            level={level}
            currentXP={currentXP}
            maxXP={maxXP}
            size={110}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Level Display */}
          <View style={styles.levelContainer}>
            <ThemedText style={styles.levelLabel}>Lv. {level}</ThemedText>
            <ThemedText style={styles.xpText}>
              {currentXP}/{maxXP} xp
            </ThemedText>
          </View>

          {/* Username */}
          <View style={styles.usernameContainer}>
            <ThemedText style={styles.username} numberOfLines={1}>
              {username}
            </ThemedText>
            {/* Edit icon placeholder - can add later */}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: metrics.large,
  },
  banner: {
    width: '100%',
    height: 180,
    borderBottomLeftRadius: metrics.borderRadiusHuge,
    borderBottomRightRadius: metrics.borderRadiusHuge,
    position: 'relative',
    overflow: 'hidden',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    paddingHorizontal: metrics.large,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarSection: {
    marginRight: metrics.medium,
  },
  infoSection: {
    flex: 1,
    paddingBottom: metrics.small,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.xxs,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginRight: metrics.xxs,
  },
  xpText: {
    fontSize: 14,
    color: colors.gray,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
})
