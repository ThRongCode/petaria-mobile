/**
 * Central Image Asset Management
 * 
 * This file provides typed access to all image assets in the project.
 * - GUI Icons: 142 SVG files that can be tinted/colored
 * - Pet Images: 902 PNG files for Pokemon sprites
 * - General Images: Other UI assets
 * 
 * Usage Examples:
 * 
 * // Import specific collections
 * import { PetImages, GuiIcons, GeneralImages } from '@/assets/images'
 * 
 * // Use pet images
 * <Image source={PetImages.charizard} style={{ width: 100, height: 100 }} />
 * 
 * // Use GUI icons (SVG - can be tinted)
 * import { SvgIcon } from '@/components'
 * <SvgIcon source={GuiIcons.attackGauge} size={24} color="#FF0000" />
 * 
 * // Use helper functions
 * import { getPetImageByName, getRandomPetImage } from '@/assets/images'
 * const image = getPetImageByName('Pikachu')
 * const random = getRandomPetImage()
 */

// Re-export all image modules and utilities
export * from './gui-icons'
export * from './pet-images'
export * from './general-images'
export * from './image-utils'
export * from './pokemon-map'
export * from './item-images'
