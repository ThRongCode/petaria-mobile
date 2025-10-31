/**
 * PetDetailsTabs Component
 * 
 * Tab navigation for pet details (About, Stats, Moves, Evolutions)
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'

export type PetDetailTab = 'about' | 'stats' | 'moves' | 'evolutions'

interface PetDetailsTabsProps {
  activeTab: PetDetailTab
  onTabChange: (tab: PetDetailTab) => void
  tabColor?: string
}

const TABS: { key: PetDetailTab; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'stats', label: 'Stats' },
  { key: 'moves', label: 'Moves' },
  { key: 'evolutions', label: 'Evolutions' },
]

export const PetDetailsTabs: React.FC<PetDetailsTabsProps> = ({ 
  activeTab, 
  onTabChange,
  tabColor = colors.black
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <ThemedText 
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
              activeTab === tab.key && { color: tabColor }
            ]}
          >
            {tab.label}
          </ThemedText>
          {activeTab === tab.key && (
            <View style={[styles.activeIndicator, { backgroundColor: tabColor }]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: metrics.medium,
    backgroundColor: colors.white,
  },
  tab: {
    paddingVertical: metrics.medium,
    paddingHorizontal: metrics.small,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.placeholder,
  },
  activeTabText: {
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
})
