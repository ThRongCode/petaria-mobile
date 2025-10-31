/**
 * GUI Icon SVG Components
 * 
 * SVG icons imported as React components that can be rendered with react-native-svg
 * These support proper coloring and sizing
 * 
 * Usage:
 * import { SvgIcons } from '@/assets/images/gui-icons-components'
 * <SvgIcons.CheckMark width={24} height={24} color="#FF0000" />
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SvgProps } from 'react-native-svg'

import PositionMarkerSvg from './gui_icon/position-marker.svg'
import StarsStackSvg from './gui_icon/stars-stack.svg'
import AttackGaugeSvg from './gui_icon/attack-gauge.svg'
import ShoppingCartSvg from './gui_icon/shopping-cart.svg'
import IdCardSvg from './gui_icon/id-card.svg'
import WalletSvg from './gui_icon/wallet.svg'
import ChartSvg from './gui_icon/chart.svg'
import CheckMarkSvg from './gui_icon/check-mark.svg'
import ChecklistSvg from './gui_icon/checklist.svg'
import PencilSvg from './gui_icon/pencil.svg'
import StackSvg from './gui_icon/stack.svg'
import InterdictionSvg from './gui_icon/interdiction.svg'

// Wrapper component to handle color prop and hide grey background
const createIconComponent = (SvgComponent: React.FC<SvgProps>) => {
  return ({ width = 24, height = 24, color, fill, ...props }: SvgProps & { color?: string }) => {
    const finalColor = fill || color || '#000'
    
    return (
      <View 
        style={{
          ...styles.iconContainer,
          width: Number(width), 
          height: Number(height)
        }}
      >
        <SvgComponent 
          width={width}
          height={height}
          fill={finalColor}
          {...props}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export const SvgIcons = {
  PositionMarker: createIconComponent(PositionMarkerSvg),
  StarsStack: createIconComponent(StarsStackSvg),
  AttackGauge: createIconComponent(AttackGaugeSvg),
  ShoppingCart: createIconComponent(ShoppingCartSvg),
  IdCard: createIconComponent(IdCardSvg),
  Wallet: createIconComponent(WalletSvg),
  Chart: createIconComponent(ChartSvg),
  CheckMark: createIconComponent(CheckMarkSvg),
  Checklist: createIconComponent(ChecklistSvg),
  Pencil: createIconComponent(PencilSvg),
  Stack: createIconComponent(StackSvg),
  Interdiction: createIconComponent(InterdictionSvg),
}
