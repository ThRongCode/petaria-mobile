/**
 * Pokemon Image Management - SINGLE SOURCE OF TRUTH
 * 
 * ============================================================
 * HOW TO UPDATE A POKEMON IMAGE
 * ============================================================
 * 
 * 1. Find the PNG file in: src/assets/images/pet_image/
 *    Example: charizard.png
 * 
 * 2. Replace the PNG file with your new image
 *    - Keep the same filename!
 *    - Recommended size: 256x256 or 512x512 pixels
 *    - Format: PNG with transparency
 * 
 * 3. Done! The app will use the new image automatically.
 * 
 * ============================================================
 * HOW TO ADD A NEW POKEMON
 * ============================================================
 * 
 * 1. Add the PNG to: src/assets/images/pet_image/newpokemon.png
 * 
 * 2. Add entry in pet-images.ts:
 *    newpokemon: require('./pet_image/newpokemon.png'),
 * 
 * 3. Add to backend species list (prisma seed or admin)
 * 
 * ============================================================
 * NAMING CONVENTION
 * ============================================================
 * 
 * - All lowercase: charizard.png (not Charizard.png)
 * - No spaces: mr-mime.png or mrmime.png
 * - Forms: charizard-mega.png, pikachu-cosplay.png
 * 
 * The getPokemonImage() function handles case-insensitivity
 * and special characters automatically.
 * 
 */

import { PetImages, PetImageKey } from './pet-images'

/**
 * Get Pokemon image by species name
 * 
 * @param species - Pokemon name (case-insensitive, handles special chars)
 * @returns Image require() object
 * 
 * @example
 * getPokemonImage('Charizard')     // ✓ works
 * getPokemonImage('charizard')     // ✓ works  
 * getPokemonImage('CHARIZARD')     // ✓ works
 * getPokemonImage('Mr. Mime')      // ✓ works -> mrmime
 * getPokemonImage('Aegislash-Shield') // ✓ works -> aegislashShield
 */
export const getPokemonImage = (species: string): any => {
  if (!species) return PetImages.bulbasaur
  
  // Normalize: lowercase, remove special chars
  const normalized = species
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '')
  
  // Try direct match (e.g., 'charizard')
  if (normalized in PetImages) {
    return PetImages[normalized as PetImageKey]
  }
  
  // Try camelCase for hyphenated names (e.g., 'aegislash-shield' -> 'aegislashShield')
  const camelCased = species
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  
  if (camelCased in PetImages) {
    return PetImages[camelCased as PetImageKey]
  }
  
  // Fallback to Bulbasaur
  console.warn(`[getPokemonImage] No image found for: ${species}, using fallback`)
  return PetImages.bulbasaur
}
