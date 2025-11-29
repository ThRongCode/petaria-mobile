import { IconSymbol } from '@/components'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import { getTabScreenOptions, NO_HEADER } from './ScreenOptions'
import { Stack, Tabs } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native'
import { RouteNames } from './RouteKeys'
import { metrics } from '@/themes'
import { CustomTabBar } from '@/components/navigation'

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
    <Tabs 
      screenOptions={getTabScreenOptions(colorScheme)}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Left side tabs */}
      <Tabs.Screen
        name="hunt"
        options={{
          title: 'Hunt',
          tabBarIcon: ({ color }) => <SvgIcons.PositionMarker width={metrics.xl} height={metrics.xl} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color }) => <SvgIcons.AttackGauge width={metrics.xl} height={metrics.xl} fill={color} />,
        }}
      />
      
      {/* Center home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house" color={color} size={metrics.xl} />,
        }}
      />
      
      {/* Right side tabs */}
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Pets',
          tabBarIcon: ({ color }) => <SvgIcons.StarsStack width={metrics.xl} height={metrics.xl} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <SvgIcons.IdCard width={metrics.xl} height={metrics.xl} fill={color} />,
        }}
      />
      {/* Hide auction tab */}
      <Tabs.Screen
        name="auction"
        options={{
          href: null, // This hides the tab
        }}
      />
    </Tabs>
  )
}
