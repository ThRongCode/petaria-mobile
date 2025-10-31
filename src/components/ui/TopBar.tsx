import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ThemedText } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from './Panel'

interface TopBarProps {
  username: string
  coins: number
  gems: number
  energy: number
  maxEnergy: number
  avatar?: any
  onSettingsPress?: () => void
}

/**
 * TopBar - Main app header with user info and currencies
 * Displays avatar, username, coins, gems, energy and settings
 */
export const TopBar: React.FC<TopBarProps> = ({
  username,
  coins,
  gems,
  energy,
  maxEnergy,
  avatar,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Top Row: User Info + Currencies + Settings */}
      <View style={styles.topRow}>
        {/* User Info Section - No Panel */}
        <View style={styles.userInfo}>
          {avatar ? (
            <Image source={avatar} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.userText}>
            <ThemedText style={styles.username}>{username}</ThemedText>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Currencies */}
        <View style={styles.currencies}>
          {/* Coins */}
          <Panel variant="dark" style={styles.currencyPanel}>
            <Ionicons name="logo-bitcoin" size={16} color="#FFD700" />
            <ThemedText style={styles.currencyText}>{coins}</ThemedText>
          </Panel>

          {/* Gems (Premium Currency) */}
          <Panel variant="dark" style={styles.currencyPanel}>
            <Ionicons name="diamond" size={16} color="#00BFFF" />
            <ThemedText style={styles.currencyText}>{gems}</ThemedText>
          </Panel>
        </View>

        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={onSettingsPress}
        >
          <Panel variant="dark" style={styles.settingsPanel}>
            <Ionicons name="settings" size={20} color="#fff" />
          </Panel>
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Energy Bar - Full Width */}
      <View style={styles.energyRow}>
        <View style={styles.energyContainer}>
          <Ionicons name="flash" size={16} color="#FF6B6B" />
          <View style={styles.energyBar}>
            <View 
              style={[
                styles.energyFill, 
                { width: `${(energy / maxEnergy) * 100}%` }
              ]} 
            />
          </View>
          <ThemedText style={styles.energyText}>
            {energy}/{maxEnergy}
          </ThemedText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  userText: {
    gap: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  spacer: {
    flex: 1,
  },
  currencies: {
    flexDirection: 'row',
    gap: 6,
  },
  currencyPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    marginLeft: 0,
  },
  settingsPanel: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyRow: {
    marginTop: 8,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  energyBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  energyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 45,
  },
})
