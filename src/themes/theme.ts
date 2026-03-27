/**
 * Theme Configuration
 *
 * Integrates our design tokens with rn-base-component's extendTheme().
 * Dark mode only for now, but structured so adding themes is trivial:
 *   1. Add a new color set in colors.ts (or a separate file)
 *   2. Create a new theme object here following the same shape
 *   3. Switch via a ThemeContext or redux selector
 */

import { colors } from './colors'
import { metrics, radii } from './metrics'
import { fonts } from './fonts'
import { extendTheme } from 'rn-base-component'

export const theme = extendTheme({
  fonts: fonts,
  colors: {
    // Core
    primary: colors.primary,
    secondary: colors.secondaryContainer,

    // Backgrounds (map to surface hierarchy)
    backgroundPrimary: colors.surfaceContainerLowest,
    backgroundSecondary: colors.surface,
    lightBackground: colors.surfaceContainerHigh,
    mainBackground: colors.surfaceContainerLowest,
    backgroundColor: colors.surface,
    cardPrimaryBackground: colors.surfaceContainerHigh,

    // Border
    primaryBorder: colors.outlineVariant,

    // Text
    textColor: colors.onSurface,
    lightTextColor: colors.onSurfaceVariant,
    darkTextColor: colors.onSurface,
    placeHolderText: colors.onSurfaceVariant,
    errorText: colors.error,
  },
  darkColors: {
    // Same as light — we're dark-only, but rn-base-component requires both
    primary: colors.primary,
    secondary: colors.secondaryContainer,

    backgroundPrimary: colors.surfaceContainerLowest,
    backgroundSecondary: colors.surface,
    lightBackground: colors.surfaceContainerHigh,
    mainBackground: colors.surfaceContainerLowest,
    backgroundColor: colors.surface,
    cardPrimaryBackground: colors.surfaceContainerHigh,

    primaryBorder: colors.outlineVariant,

    textColor: colors.onSurface,
    lightTextColor: colors.onSurfaceVariant,
    darkTextColor: colors.onSurface,
    placeHolderText: colors.onSurfaceVariant,
    errorText: colors.error,
  },
  components: {
    Button: {
      height: metrics.huge,
      borderRadius: radii.DEFAULT,
    },
    ButtonPrimary: {
      backgroundColor: colors.primary,
      disabledColor: colors.surfaceContainerHighest,
      borderRadius: radii.DEFAULT,
      textColor: colors.onPrimary,
    },
    ButtonSecondary: {
      backgroundColor: colors.surfaceContainerHigh,
      disabledColor: colors.surfaceContainerHighest,
      borderRadius: radii.DEFAULT,
      textColor: colors.onSurface,
    },
    ButtonOutline: {
      borderRadius: radii.DEFAULT,
    },
    Checkbox: {
      fillColor: colors.primary,
      size: metrics.medium,
    },
  },
})
