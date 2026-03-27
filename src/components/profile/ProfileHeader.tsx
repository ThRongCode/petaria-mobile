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
import { colors, fonts, spacing, radii } from '@/themes'

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
        colors={['#00BCD4', '#004E59']}
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
    marginBottom: spacing['2xl'],
  },
  banner: {
    width: '100%',
    height: 180,
    borderBottomLeftRadius: radii['2xl'],
    borderBottomRightRadius: radii['2xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatarSection: {
    marginRight: spacing.lg,
  },
  infoSection: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  levelLabel: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginRight: spacing.xs,
  },
  xpText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
  },
})
