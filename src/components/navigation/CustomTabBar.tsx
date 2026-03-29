import React from 'react'
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, radii } from '@/themes'

/**
 * CustomTabBar — Bottom navigation matching Stitch design.
 * Deep navy bg, teal glow on active Home button, muted inactive icons.
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()

  const allowedTabs = ['hunt', 'battle', 'index', 'pets', 'profile']

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key]
    return allowedTabs.includes(route.name) && options.tabBarButton !== null
  })

  const homeIndex = visibleRoutes.findIndex(route => route.name === 'index')
  const leftRoutes = visibleRoutes.slice(0, homeIndex)
  const homeRoute = visibleRoutes[homeIndex]
  const rightRoutes = visibleRoutes.slice(homeIndex + 1)

  const getIconForRoute = (routeName: string, focused: boolean) => {
    const color = focused ? colors.primary : colors.onSurfaceVariant
    const size = 22

    switch (routeName) {
      case 'index':
        return <Ionicons name="home" size={22} color={focused ? colors.primary : colors.onSurfaceVariant} />
      case 'hunt':
        return <Ionicons name="map" size={size} color={color} />
      case 'battle':
        return <Ionicons name="trophy" size={size} color={color} />
      case 'pets':
        return <Ionicons name="paw" size={size} color={color} />
      case 'profile':
        return <Ionicons name="person" size={size} color={color} />
      default:
        return <Ionicons name="ellipse" size={size} color={color} />
    }
  }

  const getLabelForRoute = (routeName: string) => {
    switch (routeName) {
      case 'index': return 'Home'
      case 'hunt': return 'Hunt'
      case 'battle': return 'Battle'
      case 'pets': return 'Pets'
      case 'profile': return 'Profile'
      default: return routeName
    }
  }

  const renderTab = (route: any) => {
    const { options } = descriptors[route.key]
    const isFocused = state.index === state.routes.findIndex(r => r.key === route.key)

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      }
    }

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      })
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tab}
      >
        <View style={[styles.tabContent, isFocused && styles.tabContentFocused]}>
          {getIconForRoute(route.name, isFocused)}
          <ThemedText style={[
            styles.label,
            { color: isFocused ? colors.primary : colors.onSurfaceVariant },
            isFocused && styles.labelFocused,
          ]}>
            {getLabelForRoute(route.name)}
          </ThemedText>
        </View>
      </TouchableOpacity>
    )
  }

  const renderHomeTab = () => {
    if (!homeRoute) return null

    const { options } = descriptors[homeRoute.key]
    const isFocused = state.index === state.routes.findIndex(r => r.key === homeRoute.key)

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: homeRoute.key,
        canPreventDefault: true,
      })

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(homeRoute.name)
      }
    }

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: homeRoute.key,
      })
    }

    return (
      <TouchableOpacity
        key={homeRoute.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.homeTabContainer}
      >
        <View style={[styles.tabContent, isFocused && styles.homeButton]}>
          {getIconForRoute(homeRoute.name, isFocused)}
          <ThemedText style={[
            styles.label,
            { color: isFocused ? colors.primary : colors.onSurfaceVariant },
          ]}>
            Home
          </ThemedText>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {leftRoutes.map(route => renderTab(route))}
        {renderHomeTab()}
        {rightRoutes.map(route => renderTab(route))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.surfaceContainerLowest}E6`, // 90% opacity
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryContainer,
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.DEFAULT,
  },
  tabContentFocused: {
    // No extra bg — just color change
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelFocused: {
    color: colors.primary,
  },
  homeTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}1A`, // 10% opacity
    borderRadius: radii.DEFAULT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  homeLabel: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.primary,
  },
})
