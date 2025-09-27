import { IconSymbol } from '@/components'
import { getTabScreenOptions, NO_HEADER } from './ScreenOptions'
import { Stack, Tabs } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native'
import { RouteNames } from './RouteKeys'
import { metrics } from '@/themes'

export const RootNavigation: React.FC = () => (
  <Stack screenOptions={NO_HEADER}>
    <Stack.Screen name={RouteNames.Root} />
    <Stack.Screen name={RouteNames.AuthStack} />
    <Stack.Screen name={RouteNames.AppStack} />
    <Stack.Screen name={RouteNames.NotFound} />
  </Stack>
)

export const AuthNavigation: React.FC = () => (
  <Stack screenOptions={NO_HEADER}>
    <Stack.Screen name={RouteNames.SignIn} />
    <Stack.Screen name={RouteNames.SignUp} />
    <Stack.Screen name={RouteNames.ForgotPassword} />
  </Stack>
)

export const TabNavigation: React.FC = () => {
  const colorScheme = useColorScheme()

  return (
    <Tabs screenOptions={getTabScreenOptions(colorScheme)}>
      <Tabs.Screen
        name="hunt"
        options={{
          title: 'Hunt',
          tabBarIcon: ({ color }) => <IconSymbol size={metrics.xl} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Pets',
          tabBarIcon: ({ color }) => <IconSymbol size={metrics.xl} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color }) => <IconSymbol size={metrics.xl} name="bolt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="auction"
        options={{
          title: 'Auction',
          tabBarIcon: ({ color }) => <IconSymbol size={metrics.xl} name="bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={metrics.xl} name="person" color={color} />,
        }}
      />
    </Tabs>
  )
}
