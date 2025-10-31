import React from 'react'
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { ThemedText } from '@/components'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

/**
 * CustomTabBar - Modern bottom navigation with elevated center home button
 * Features a circular home button in the center with special styling
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()

  // Only show these 5 main tabs in the specified order
  const allowedTabs = ['hunt', 'battle', 'index', 'pets', 'profile']
  
  // Split routes into left (before home), center (home), right (after home)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key]
    return allowedTabs.includes(route.name) && options.tabBarButton !== null
  })

  const homeIndex = visibleRoutes.findIndex(route => route.name === 'index')
  const leftRoutes = visibleRoutes.slice(0, homeIndex)
  const homeRoute = visibleRoutes[homeIndex]
  const rightRoutes = visibleRoutes.slice(homeIndex + 1)

  const getIconForRoute = (routeName: string, focused: boolean) => {
    const color = focused ? '#FFD700' : '#9E9E9E'
    const size = 26

    switch (routeName) {
      case 'index':
        return <Ionicons name="home" size={28} color="#FFFFFF" />
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
      case 'battle': return 'Events'
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
        <View style={styles.tabContent}>
          {getIconForRoute(route.name, isFocused)}
          <ThemedText style={[
            styles.label,
            { color: isFocused ? '#FFD700' : '#9E9E9E' }
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
        <View style={styles.homeButton}>
          <LinearGradient
            colors={['#9C27B0', '#5E35B1', '#3F51B5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeButtonInner}
          >
            {getIconForRoute(homeRoute.name, isFocused)}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {/* Left side tabs - with spacing */}
        {leftRoutes.map((route, index) => (
          <React.Fragment key={route.key}>
            {renderTab(route)}
            {index < leftRoutes.length - 1 && <View style={styles.tabSpacer} />}
          </React.Fragment>
        ))}

        {/* Spacer before home */}
        <View style={styles.flexSpacer} />

        {/* Center home button */}
        {renderHomeTab()}

        {/* Spacer after home */}
        <View style={styles.flexSpacer} />

        {/* Right side tabs - with spacing */}
        {rightRoutes.map((route, index) => (
          <React.Fragment key={route.key}>
            {renderTab(route)}
            {index < rightRoutes.length - 1 && <View style={styles.tabSpacer} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  sideContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  tabSpacer: {
    width: 16,
  },
  flexSpacer: {
    flex: 1,
  },
  homeTabContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  homeButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#9C27B0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  homeButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
})
