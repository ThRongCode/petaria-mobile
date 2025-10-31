/**
 * EmblemsSection Component
 * 
 * Horizontal scrollable section displaying achievement emblems
 */

import React from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { EmblemBadge } from './EmblemBadge'
import { colors, metrics } from '@/themes'
import { SvgIcons } from '@/assets/images/gui-icons-components'
import Ionicons from '@expo/vector-icons/Ionicons'

interface Emblem {
  id: string
  iconName: keyof typeof SvgIcons
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface EmblemsSectionProps {
  emblems: Emblem[]
  onAddPress?: () => void
}

export const EmblemsSection: React.FC<EmblemsSectionProps> = ({
  emblems,
  onAddPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <ThemedText style={styles.title}>Emblems</ThemedText>

      {/* Emblems Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {emblems.map((emblem) => (
          <EmblemBadge
            key={emblem.id}
            iconName={emblem.iconName}
            rarity={emblem.rarity}
            size={90}
          />
        ))}

        {/* Add Button */}
        {onAddPress && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={36} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // Removed marginBottom since it's now in a card
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: metrics.medium,
    paddingHorizontal: metrics.medium,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: metrics.medium,
    paddingVertical: metrics.small,
  },
  addButton: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.disabled,
    borderStyle: 'dashed',
  },
})
