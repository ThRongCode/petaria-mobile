import { configureLocalization } from '@/locale/I18nConfig'
import { store } from '@/stores/store'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import 'react-native-reanimated'
import { injectStore } from '@/services/networking/axios'
import { BaseProvider } from 'rn-base-component'
import { theme, colors, fontAssets } from '@/themes'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { RootNavigation } from '@/routes/AppNavigation'
import { useSelector } from 'react-redux'
import { getLoadingIndicator } from '@/stores/selectors'
import { IndicatorDialog } from '@/components'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

injectStore(store)
configureLocalization('en')

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

export default function MainLayout() {
  const showGlobalIndicator = useSelector(getLoadingIndicator)
  const [loaded] = useFonts(fontAssets)

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
            <RootNavigation />
            <StatusBar style="light" />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </BaseProvider>
      {showGlobalIndicator && <IndicatorDialog />}
    </>
  )
}
