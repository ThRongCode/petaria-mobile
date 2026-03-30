/**
 * ProfileInfoCard Component
 * 
 * Bio and Friend ID display card
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { globalAlert } from '@/components/ui/AlertProvider'
import { ThemedText } from '@/components/ThemedText'
import { colors, fonts, spacing, radii } from '@/themes'
import Ionicons from '@expo/vector-icons/Ionicons'

interface ProfileInfoCardProps {
  bio?: string
  friendId: string
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  bio = 'I like Psychic types',
  friendId,
}) => {
  const handleCopyFriendId = () => {
    // Simple alert for now - can add clipboard later
    globalAlert.show('Friend ID', friendId, [{ text: 'OK' }])
  }

  return (
    <View style={styles.container}>
      {/* Bio Section */}
      <View style={styles.bioContainer}>
        <ThemedText style={styles.bioText}>{bio}</ThemedText>
      </View>

      {/* Friend ID Section */}
      <View style={styles.friendIdContainer}>
        <View style={styles.friendIdContent}>
          <ThemedText style={styles.friendIdLabel}>Friend ID</ThemedText>
          <ThemedText style={styles.friendIdValue}>{friendId}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleCopyFriendId}
          style={styles.copyButton}
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Removed marginBottom since it's now in a card
  },
  bioContainer: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii['2xl'],
    marginBottom: spacing.lg,
  },
  bioText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  friendIdContainer: {
    backgroundColor: colors.glass.darkFill,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radii['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendIdContent: {
    flex: 1,
  },
  friendIdLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xxs,
  },
  friendIdValue: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.subtle,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
  },
})
