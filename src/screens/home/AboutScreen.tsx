import React from 'react'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

import { ThemedText, ThemedView } from '@/components'
import { spacing } from '@/themes/metrics'
import { RouteKeys } from '@/routes/RouteKeys'

export const AboutScreen: React.FC = () => (
  <>
    <ThemedView style={styles.container}>
      <ThemedText type="title">About</ThemedText>
      <Link href={RouteKeys.SignIn} style={styles.link}>
        <ThemedText type="link">Sign out</ThemedText>
      </Link>
    </ThemedView>
  </>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
})
