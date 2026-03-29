/**
 * BattleRecordButton Component
 * 
 * Button to view battle statistics
 */

import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { colors, fonts, spacing, radii } from '@/themes'
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
    backgroundColor: colors.glass.subtle,
    borderWidth: 1,
    borderColor: colors.glass.innerGlowSubtle,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.xl,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
})
