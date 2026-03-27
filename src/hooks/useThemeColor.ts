/**
 * Hook: useThemeColor
 *
 * Returns a color from the design token system.
 * Currently dark-mode only. To add themes later:
 *   1. Add a theme context / selector
 *   2. Return color from the active theme's palette
 *
 * The `props` param allows per-instance overrides (backward compat).
 */

import { colors, type ColorToken } from '@/themes/colors'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorToken,
) {
  // Allow explicit per-instance override
  if (props.dark) {
    return props.dark
  }

  // Return from centralized dark palette
  const value = colors[colorName]
  return typeof value === 'string' ? value : colors.onSurface
}
