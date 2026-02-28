import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'

/**
 * AuctionScreen — Placeholder (feature disabled)
 * The auction tab is hidden via `href: null` in AppNavigation.
 */
export const AuctionScreen: React.FC = () => (
  <View style={styles.container}>
    <ThemedText style={styles.text}>Auction coming soon</ThemedText>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  text: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
})
