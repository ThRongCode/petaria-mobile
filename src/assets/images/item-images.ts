/**
 * Item Image Management
 * 
 * Uses Pokemon images as placeholders for items.
 * Replace with actual item images when available.
 */

import { PetImages } from './pet-images'

/**
 * Item Images Registry - maps item IDs to Pokemon placeholder images
 */
export const ItemImages: Record<string, any> = {
  // Healing items
  'potion': PetImages.chansey,
  'super-potion': PetImages.blissey,
  'hyper-potion': PetImages.audino,
  'max-potion': PetImages.comfey,
  'revive': PetImages.mew,
  'max-revive': PetImages.mew,
  
  // Evolution stones
  'fire-stone': PetImages.flareon,
  'water-stone': PetImages.vaporeon,
  'thunder-stone': PetImages.jolteon,
  'leaf-stone': PetImages.leafeon,
  'moon-stone': PetImages.umbreon,
  'sun-stone': PetImages.espeon,
  'ice-stone': PetImages.glaceon,
  'shiny-stone': PetImages.sylveon,
  'dusk-stone': PetImages.darkrai,
  'dawn-stone': PetImages.eevee,
  
  // Battle items
  'x-attack': PetImages.machamp,
  'x-defense': PetImages.shieldon,
  
  // Capture items
  'pokeball': PetImages.voltorb,
  'great-ball': PetImages.voltorb,
  'ultra-ball': PetImages.voltorb,
  'master-ball': PetImages.voltorb,
}

/**
 * Get item image by item ID or name
 */
export function getItemImage(itemId: string): any {
  if (!itemId) {
    return PetImages.voltorb
  }
  
  const normalizedId = itemId.toLowerCase().replace(/\s+/g, '-')
  
  if (ItemImages[normalizedId]) {
    return ItemImages[normalizedId]
  }
  
  // Try without dashes
  const withoutDashes = normalizedId.replace(/-/g, '')
  for (const key of Object.keys(ItemImages)) {
    if (key.replace(/-/g, '') === withoutDashes) {
      return ItemImages[key]
    }
  }
  
  // Fallback
  return PetImages.voltorb
}

/**
 * Check if an item has a registered image
 */
export function hasItemImage(itemId: string): boolean {
  if (!itemId) return false
  const normalizedId = itemId.toLowerCase().replace(/\s+/g, '-')
  return normalizedId in ItemImages
}
