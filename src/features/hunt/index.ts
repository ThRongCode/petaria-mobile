/**
 * Hunt Feature Index
 * Main export file for the hunt feature module
 * 
 * This module follows SOLID principles:
 * - S: Single Responsibility - Each file has one purpose
 * - O: Open/Closed - Components are extensible without modification
 * - L: Liskov Substitution - Components can be swapped with compatible ones
 * - I: Interface Segregation - Types are specific to their use cases
 * - D: Dependency Inversion - Hooks depend on abstractions (API), not implementations
 */

// Types
export * from './types'

// Utilities
export * from './utils'

// Hooks
export { useHuntSession, useCapture } from './hooks'

// Components
export {
  EncounterModal,
  DirectionControls,
  SessionStats,
  SessionHeader,
  SessionActions,
} from './components'
