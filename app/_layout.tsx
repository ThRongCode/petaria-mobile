import { store, persistor } from '@/stores/store'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import 'react-native-reanimated'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { injectStore } from '@/services/networking/axios'
import { BaseProvider } from 'rn-base-component'
import { theme, colors, fontAssets } from '@/themes'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { configureLocalization } from '@/locale/I18nConfig'
import { useSelector } from 'react-redux'
import { getLoadingIndicator } from '@/stores/selectors'
import { IndicatorDialog } from '@/components'
import { useSessionExpiration } from '@/hooks'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

injectStore(store)
configureLocalization('en')

/**
 * Navigation theme — force dark mode with our surface colors.
 * Extend @react-navigation DarkTheme with our design tokens.
 */
const AppNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.surfaceContainerLowest,
    card: colors.surfaceContainer,
    text: colors.onSurface,
    border: colors.outlineVariant,
    notification: colors.error,
  },
}

function RootLayoutContent() {
  const showGlobalIndicator = useSelector(getLoadingIndicator)
  const [loaded] = useFonts(fontAssets)

  // Handle session expiration globally
  useSessionExpiration()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <>
      <BaseProvider theme={theme}>
        <ThemeProvider value={AppNavigationTheme}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </BaseProvider>
      {showGlobalIndicator && <IndicatorDialog />}
    </>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <Provider store={store}>
        {persistor ? (
          // Redux Persist is enabled
          <PersistGate loading={null} persistor={persistor}>
            <RootLayoutContent />
          </PersistGate>
        ) : (
          // Redux Persist is disabled - API-first mode
          <RootLayoutContent />
        )}
      </Provider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
