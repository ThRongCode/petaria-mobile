import React from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components'
import { ScreenContainer } from '@/components/ScreenContainer'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/themes/colors'
import { fonts } from '@/themes/fonts'
import { spacing, radii, fontSizes } from '@/themes/metrics'

/**
 * AuctionScreen — Placeholder (feature disabled)
 * The auction tab is hidden via `href: null` in AppNavigation.
 */
export const AuctionScreen: React.FC = () => (
  <ScreenContainer>
    <View style={styles.center}>
      <Ionicons name="business-outline" size={64} color={colors.primary} />
      <ThemedText style={styles.title}>Auction House</ThemedText>
      <ThemedText style={styles.subtitle}>Coming soon...</ThemedText>
    </View>
  </ScreenContainer>
)

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: { fontSize: 56, marginBottom: spacing.lg },
  title: {
    fontSize: fontSizes.heading,
    fontFamily: fonts.bold,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
  },
})
