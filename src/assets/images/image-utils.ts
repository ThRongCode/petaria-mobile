/**
 * Image Asset Utilities
 * 
 * Helper functions for working with images in the app
 */

import { PetImages, PetImageKey } from './pet-images'
import { GuiIcons, GuiIconKey } from './gui-icons'
import { GeneralImages, GeneralImageKey } from './general-images'
import { getPokemonImage } from './pokemon-map'

/**
 * @deprecated Use `getPokemonImage` from './pokemon-map' instead.
 * This function is kept for backwards compatibility.
 * 
 * Get a pet image by name (case-insensitive, handles special characters)
 * @param name - The pet name (e.g., "Charizard", "pikachu", "Mr. Mime")
 * @returns Image require() object or fallback
 */
export const getPetImageByName = (name: string): any => {
  // Delegate to the canonical function
  return getPokemonImage(name)
}

/**
 * Get a GUI icon by key
 * @param key - The icon key
 * @returns SVG image require() object
 */
export const getGuiIcon = (key: GuiIconKey): any => {
  return GuiIcons[key]
}

/**
 * Check if a pet image exists
 * @param name - The pet name to check
 * @returns boolean
 */
export const hasPetImage = (name: string): boolean => {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '')
  
  return normalized in PetImages
}

/**
 * Get all available pet names
 * @returns Array of pet image keys
 */
export const getAllPetNames = (): PetImageKey[] => {
  return Object.keys(PetImages) as PetImageKey[]
}

/**
 * Get random pet image
 * @returns Random pet image require() object
 */
export const getRandomPetImage = (): any => {
  const keys = getAllPetNames()
  const randomKey = keys[Math.floor(Math.random() * keys.length)]
  return PetImages[randomKey]
}

// Re-export everything
export * from './pet-images'
export * from './gui-icons'
export * from './general-images'
