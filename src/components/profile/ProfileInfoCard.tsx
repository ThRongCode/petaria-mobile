/**
 * ProfileInfoCard Component
 * 
 * Bio and Friend ID display card
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'
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
    Alert.alert('Friend ID', friendId, [{ text: 'OK' }])
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
    backgroundColor: '#F8F9FA', // Very light gray
    paddingHorizontal: metrics.large,
    paddingVertical: metrics.medium,
    borderRadius: metrics.borderRadiusHuge,
    marginBottom: metrics.medium,
  },
  bioText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  friendIdContainer: {
    backgroundColor: '#F8F9FA', // Very light gray
    paddingHorizontal: metrics.large,
    paddingVertical: metrics.medium,
    borderRadius: metrics.borderRadiusHuge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendIdContent: {
    flex: 1,
  },
  friendIdLabel: {
    fontSize: 12,
    color: colors.placeholder,
    marginBottom: metrics.tiny,
  },
  friendIdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: metrics.borderRadiusLarge,
  },
})
