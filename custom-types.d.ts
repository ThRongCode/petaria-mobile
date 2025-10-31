export type ValueOf<T extends Record<string, string | number | object>> = T[keyof T]

declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
