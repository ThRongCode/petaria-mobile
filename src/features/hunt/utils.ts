/**
 * Hunt Feature Utilities
 * Single Responsibility: Helper functions for hunt feature
 */

import { CaptureState } from './types'
import { colors, rarityColors } from '@/themes/colors'

/**
 * Get color for rarity display
 */
export const getRarityColor = (rarity: string): string => {
  return rarityColors[rarity.toLowerCase() as keyof typeof rarityColors] ?? rarityColors.common
}

/**
 * Get color for difficulty display
 */
export const getDifficultyColor = (difficulty: string): string => {
  const difficultyColors: Record<string, string> = {
    'Easy': colors.success,
    'Medium': colors.warning,
    'Hard': colors.error,
    'Expert': colors.tertiary,
  }
  return difficultyColors[difficulty] || colors.onSurfaceVariant
}

/**
 * Get icon for difficulty
 */
export const getDifficultyIcon = (difficulty: string): string => {
  const icons: Record<string, string> = {
    'Easy': '🌱',
    'Medium': '⚡',
    'Hard': '🔥',
    'Expert': '💎',
  }
  return icons[difficulty] || '🗺️'
}

/**
 * Get status text for capture animation state
 */
export const getCaptureStatusText = (state: CaptureState, speciesName: string): string => {
  switch (state) {
    case 'throwing':
      return '🔴 Throwing Pokéball...'
    case 'shaking':
      return '⏳ Come on...'
    case 'success':
      return '✨ Gotcha!'
    case 'failed':
      return '💨 Oh no!'
    default:
      return `Wild ${speciesName} Appears!`
  }
}

/**
 * Get button text for capture state
 */
export const getCaptureButtonText = (
  isCaught: boolean,
  isCapturing: boolean,
  captureState: CaptureState
): string => {
  if (isCaught) return '✓ Caught'
  if (!isCapturing) return '⚾ Throw Pokéball'
  
  switch (captureState) {
    case 'throwing':
      return 'Throwing...'
    case 'shaking':
      return 'Catching...'
    default:
      return 'Capturing...'
  }
}

/**
 * Check if error is "no pokeballs" error
 */
export const isNoPokeBallsError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('pokeball')
  }
  return false
}

/**
 * Format session summary message
 */
export const formatSessionSummary = (
  regionName: string,
  encounterCount: number,
  caughtCount: number
): string => {
  return `Session Summary:\n• Region: ${regionName}\n• Encounters: ${encounterCount}\n• Pets Captured: ${caughtCount}`
}
