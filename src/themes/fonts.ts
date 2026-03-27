/**
 * Design Token: Typography
 *
 * Plus Jakarta Sans — all weights loaded via expo-font.
 * Matches the Stitch "Lapis Glassworks" design system.
 *
 * Weight map:
 *   400 → regular
 *   500 → medium
 *   600 → semiBold
 *   700 → bold
 *   800 → extraBold
 */

const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
} as const

/**
 * Font asset map for expo-font useFonts().
 * Import this in your root _layout.tsx.
 */
const fontAssets = {
  [fonts.regular]: require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
  [fonts.medium]: require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
  [fonts.semiBold]: require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
  [fonts.bold]: require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
  [fonts.extraBold]: require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
} as const

export { fonts, fontAssets }
export type FontFamily = (typeof fonts)[keyof typeof fonts]
