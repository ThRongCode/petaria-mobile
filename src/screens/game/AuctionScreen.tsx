import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'

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
    backgroundColor: colors.surfaceContainerLowest,
  },
  text: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
})
