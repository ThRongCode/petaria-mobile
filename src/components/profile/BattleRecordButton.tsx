/**
 * BattleRecordButton Component
 * 
 * Button to view battle statistics
 */

import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, metrics } from '@/themes'
import { SvgIcons } from '@/assets/images/gui-icons-components'

interface BattleRecordButtonProps {
  onPress: () => void
}

export const BattleRecordButton: React.FC<BattleRecordButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <SvgIcons.AttackGauge width={32} height={32} color={colors.primary} />
      </View>
      <ThemedText style={styles.text}>View Battle Record</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent since it's in a card
    paddingVertical: metrics.medium,
    paddingHorizontal: metrics.large,
    borderRadius: metrics.borderRadiusLarge,
  },
  iconContainer: {
    marginRight: metrics.small,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
})
