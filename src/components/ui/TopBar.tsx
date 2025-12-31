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
  pokeballs?: number
  battleTickets?: number
  huntTickets?: number
  avatar?: any
  onSettingsPress?: () => void
}

/**
 * TopBar - Main app header with user info and currencies
 * Displays avatar, username, coins, gems, tickets and settings
 */
export const TopBar: React.FC<TopBarProps> = ({
  username,
  coins,
  gems,
  pokeballs,
  battleTickets,
  huntTickets,
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

        {/* Currencies (Coins + Gems + Pokeballs) */}
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

          {/* Pokeballs */}
          {pokeballs !== undefined && (
            <Panel variant="dark" style={styles.currencyPanel}>
              <ThemedText style={styles.pokeballIcon}>⚾</ThemedText>
              <ThemedText style={styles.currencyText}>{pokeballs}</ThemedText>
            </Panel>
          )}
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

      {/* Middle Row: Tickets */}
      {(battleTickets !== undefined || huntTickets !== undefined) && (
        <View style={styles.ticketsRow}>
          {/* Battle Tickets */}
          {battleTickets !== undefined && (
            <Panel variant="dark" style={styles.ticketPanel}>
              <Ionicons name="shield" size={16} color="#FF6B6B" />
              <ThemedText style={styles.ticketLabel}>Battle</ThemedText>
              <ThemedText style={styles.ticketText}>{battleTickets}/20</ThemedText>
            </Panel>
          )}

          {/* Hunt Tickets */}
          {huntTickets !== undefined && (
            <Panel variant="dark" style={styles.ticketPanel}>
              <Ionicons name="leaf" size={16} color="#4CAF50" />
              <ThemedText style={styles.ticketLabel}>Hunt</ThemedText>
              <ThemedText style={styles.ticketText}>{huntTickets}/5</ThemedText>
            </Panel>
          )}
        </View>
      )}
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
  ticketsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  ticketPanel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  ticketLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  ticketText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  pokeballIcon: {
    fontSize: 14,
  },
})
