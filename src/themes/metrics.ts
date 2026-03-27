/**
 * Design Token: Metrics
 *
 * Responsive sizing utilities and design token scales.
 * Border radii match Stitch Tailwind config: DEFAULT=1rem, lg=2rem, xl=3rem.
 */

import { Dimensions, Platform } from 'react-native'

const DESIGN_WIDTH = 375
const DESIGN_HEIGHT = 812
const { width, height } = Dimensions.get('window')

function responsiveWidth<T extends number>(value: T) {
  return ((width * value) / DESIGN_WIDTH) as T
}

function responsiveHeight<T extends number>(value: T) {
  return ((height * value) / DESIGN_HEIGHT) as T
}

function responsiveFont<T extends number>(value: T) {
  return ((width * value) / DESIGN_WIDTH) as T
}

function deviceWidth(): number {
  return width
}

function deviceHeight(): number {
  return height
}

const isIOS = Platform.OS === 'ios'

// ─── Shadows (dark-theme aware) ─────────────────────────────────────────────
const shadow = {
  shadowColor: '#000',
  shadowRadius: 5,
  elevation: 5,
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 3 },
} as const

const hitSlop = {
  top: 10,
  bottom: 10,
  right: 10,
  left: 10,
} as const

// ─── Spacing Scale ──────────────────────────────────────────────────────────
const spacing = {
  none: 0,
  xxs: responsiveHeight(2),
  xs: responsiveHeight(4),
  sm: responsiveHeight(8),
  md: responsiveHeight(12),
  lg: responsiveHeight(16),
  xl: responsiveHeight(20),
  '2xl': responsiveHeight(24),
  '3xl': responsiveHeight(32),
  '4xl': responsiveHeight(48),
  '5xl': responsiveHeight(64),
} as const

// ─── Border Radii (matches Stitch Tailwind: 1rem/2rem/3rem/full) ───────────
const radii = {
  none: 0,
  sm: responsiveHeight(8),
  md: responsiveHeight(12),
  DEFAULT: responsiveHeight(16), // Tailwind DEFAULT = 1rem
  lg: responsiveHeight(24),      // Tailwind lg ≈ 1.5rem
  xl: responsiveHeight(32),      // Tailwind xl = 2rem (used heavily in glass panels)
  '2xl': responsiveHeight(48),   // Tailwind 2xl = 3rem
  full: 9999,
} as const

// ─── Legacy metrics (backward compat) ───────────────────────────────────────
const metrics = {
  // Text Size (legacy)
  title: responsiveFont(20),
  span: responsiveFont(14),

  // spacing (legacy aliases → use `spacing` directly for new code)
  zero: spacing.none,
  tiny: spacing.xs,
  xxs: spacing.sm,
  xs: spacing.md,
  small: spacing.lg,
  sMedium: responsiveHeight(18),
  medium: spacing.xl,
  large: spacing['2xl'],
  xl: responsiveHeight(28),
  xxl: spacing['3xl'],
  huge: spacing['4xl'],
  massive: spacing['5xl'],

  borderWidth: responsiveHeight(1),
  borderRadius: radii.DEFAULT,
  borderRadiusLarge: radii.xl,
  borderRadiusHuge: radii['2xl'],
  // margin
  marginTop: spacing.md,
  marginHorizontal: responsiveWidth(24),
  marginVertical: responsiveWidth(16),
  paddingHorizontal: responsiveWidth(20),

  voucherBorderRadius: responsiveHeight(15),
  logoWidth: responsiveWidth(300),
  logoHeight: responsiveHeight(70),
  icon: responsiveHeight(30),
  toast: responsiveHeight(44),
  textInputHeight: responsiveHeight(44),
} as const

// ─── Font Sizes ─────────────────────────────────────────────────────────────
const fontSizes = {
  xs: responsiveFont(10),
  small: responsiveFont(12),
  span: responsiveFont(14),
  body: responsiveFont(16),
  large: responsiveFont(18),
  title: responsiveFont(20),
  heading: responsiveFont(24),
  display: responsiveFont(32),
} as const

const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const

export {
  metrics,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  isIOS,
  shadow,
  hitSlop,
  responsiveFont,
  responsiveHeight,
  responsiveWidth,
  deviceWidth,
  deviceHeight,
}
