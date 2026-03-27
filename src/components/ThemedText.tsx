import React from 'react'
import { Text, type TextProps, StyleSheet } from 'react-native'

import { colors, fonts, fontSizes, spacing } from '@/themes'

export type ThemedTextProps = TextProps & {
  /** @deprecated Use style={{ color }} directly */
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'label' | 'heading'
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  darkColor,
  type = 'default',
  ...rest
}) => {
  const color = darkColor ?? colors.onSurface

  return (
    <Text
      style={[
        { color, fontFamily: fonts.regular },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'label' ? styles.label : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  default: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
  },
  defaultSemiBold: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.title,
    lineHeight: fontSizes.title * 1.4,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.large,
    lineHeight: fontSizes.large * 1.4,
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.body,
    lineHeight: fontSizes.body * 1.5,
    color: colors.primary,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.small,
    lineHeight: fontSizes.small * 1.4,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.heading,
    lineHeight: fontSizes.heading * 1.3,
  },
})
