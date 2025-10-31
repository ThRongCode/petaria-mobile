/**
 * ProfileAvatar Component
 * 
 * Circular avatar with animated progress ring and level badge
 */

import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'
import Svg, { Circle } from 'react-native-svg'
import Ionicons from '@expo/vector-icons/Ionicons'

interface ProfileAvatarProps {
  avatarSource: any
  level: number
  currentXP: number
  maxXP: number
  size?: number
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarSource,
  level,
  currentXP,
  maxXP,
  size = 120,
}) => {
  // Calculate progress percentage
  const progress = (currentXP / maxXP) * 100
  const circumference = 2 * Math.PI * (size / 2 - 6)
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Progress Ring */}
      <Svg width={size} height={size} style={styles.progressRing}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 6}
          stroke="#00E5B8"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Avatar Image */}
      <View style={[styles.avatarContainer, { width: size - 20, height: size - 20 }]}>
        <Image
          source={avatarSource}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      {/* Verified Badge */}
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark-circle" size={28} color="#00E5B8" />
      </View>

      {/* Level Badge */}
      <View style={styles.levelBadge}>
        <ThemedText style={styles.levelText}>Lv. {level}</ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  avatarContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 2,
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#7B61FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
})
