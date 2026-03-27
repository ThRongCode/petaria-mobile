import React from 'react'
import { KeyboardAvoidingView, StyleSheet, View, type ViewProps } from 'react-native'

import { colors, isIOS } from '@/themes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type ThemedViewProps = ViewProps & {
  /** @deprecated Use style={{ backgroundColor }} directly */
  lightColor?: string
  darkColor?: string
  full?: boolean
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  darkColor,
  children,
  full = false,
  ...otherProps
}) => {
  const insets = useSafeAreaInsets()
  const backgroundColor = darkColor ?? colors.surfaceContainerLowest

  return (
    <View
      style={[
        styles.flex,
        { backgroundColor },
        !full && { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      {...otherProps}>
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={[styles.flex, style]}>
        {children}
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
