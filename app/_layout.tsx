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
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { injectStore } from '@/services/networking/axios'
import { BaseProvider } from 'rn-base-component'
import { theme } from '@/themes'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { configureLocalization } from '@/locale/I18nConfig'
import { useSelector } from 'react-redux'
import { getLoadingIndicator } from '@/stores/selectors'
import { IndicatorDialog } from '@/components'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

injectStore(store)
configureLocalization('en')

function RootLayoutContent() {
  const colorScheme = useColorScheme()
  const showGlobalIndicator = useSelector(getLoadingIndicator)
  const [loaded] = useFonts({
    RobotoRegular: require('../src/assets/fonts/Roboto-Regular.ttf'),
    RobotoMedium: require('../src/assets/fonts/Roboto-Medium.ttf'),
    RobotoBold: require('../src/assets/fonts/Roboto-Bold.ttf'),
  })

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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
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
