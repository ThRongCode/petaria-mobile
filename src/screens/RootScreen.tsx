import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ThemedText, ThemedView } from '@/components'
import { RouteKeys } from '@/routes/RouteKeys'
import { metrics } from '@/themes'
import { getString } from '@/locale/I18nConfig'
import { STORAGE_KEYS } from '@/services/api/config'
import { getUserInfo } from '@/stores/selectors'

export const RootScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const userInfo = useSelector(getUserInfo)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      // Check if we have a stored auth token
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      
      // Check if user is logged in (token exists and userInfo in Redux)
      if (token && userInfo?.id) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{getString('auth.authenticate')}</ThemedText>
        <ActivityIndicator size="large" style={styles.spacingTop} />
      </ThemedView>
    )
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(app)/hunt" />
  } else {
    return <Redirect href="/(auth)/sign-in" />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: metrics.medium,
  },
  spacingTop: {
    marginTop: metrics.small,
  },
})
