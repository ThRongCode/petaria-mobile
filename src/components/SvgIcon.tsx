/**
 * SvgIcon Component
 * 
 * Renders SVG icons from GuiIcons with tint color support
 * 
 * Usage:
 * import { SvgIcon } from '@/components'
 * import { GuiIcons } from '@/assets/images'
 * 
 * <SvgIcon source={GuiIcons.checkMark} color="#FF0000" size={24} />
 */

import React from 'react'
import { Image, ImageStyle, StyleProp } from 'react-native'
import { SvgXml } from 'react-native-svg'

interface SvgIconProps {
  source: any
  size?: number
  color?: string
  style?: StyleProp<ImageStyle>
  width?: number
  height?: number
}

export const SvgIcon: React.FC<SvgIconProps> = ({ 
  source, 
  size = 24, 
  color,
  width,
  height,
  style 
}) => {
  // For now, render as Image since react-native-svg might need more setup
  // If you want true SVG with tinting, you'll need to read the SVG content
  // and use SvgXml from react-native-svg
  
  const finalWidth = width || size
  const finalHeight = height || size
  
  return (
    <Image
      source={source}
      style={[
        { 
          width: finalWidth, 
          height: finalHeight,
          tintColor: color 
        },
        style
      ]}
      resizeMode="contain"
    />
  )
}
