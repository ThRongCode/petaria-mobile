/**
 * General UI Image Assets
 * 
 * Common UI elements and general purpose images
 * 
 * Usage:
 * import { GeneralImages } from '@/assets/images'
 * <Image source={GeneralImages.logo} />
 */

export const GeneralImages = {
  close: require('./pet_image/close.png'),
  eye: require('./pet_image/eye.png'),
  eyeHide: require('./pet_image/eye-hide.png'),
  info: require('./pet_image/info.png'),
  sts: require('./pet_image/sts.png'),
} as const

export type GeneralImageKey = keyof typeof GeneralImages
