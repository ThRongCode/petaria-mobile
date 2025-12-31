/**
 * Pokemon Species to Image Mapping
 * 
 * Maps Pokemon species names to their corresponding image files
 * for consistent usage throughout the app
 */

import { PetImages } from './pet-images'

export const POKEMON_IMAGE_MAP: Record<string, any> = {
  // Starter Pokemon
  pikachu: PetImages.pikachu,
  pichu: PetImages.pichu,
  raichu: PetImages.raichu,
  bulbasaur: PetImages.bulbasaur,
  ivysaur: PetImages.ivysaur,
  venusaur: PetImages.venusaur,
  charmander: PetImages.charmander,
  charmeleon: PetImages.charmeleon,
  charizard: PetImages.charizard,
  squirtle: PetImages.squirtle,
  wartortle: PetImages.wartortle,
  blastoise: PetImages.blastoise,
  
  // Common Pokemon
  rattata: PetImages.rattata,
  pidgey: PetImages.pidgey,
  caterpie: PetImages.caterpie,
  weedle: PetImages.weedle,
  
  // Grass Types
  oddish: PetImages.oddish,
  bellsprout: PetImages.bellsprout,
  treecko: PetImages.treecko,
  
  // Bug Types
  scyther: PetImages.scyther,
  pinsir: PetImages.pinsir,
  
  // Fire Types
  vulpix: PetImages.vulpix,
  growlithe: PetImages.growlithe,
  
  // Water Types
  psyduck: PetImages.psyduck,
  magikarp: PetImages.magikarp,
  
  // Electric Types
  jolteon: PetImages.jolteon,
  electabuzz: PetImages.electabuzz,
  
  // Legendary
  darkrai: PetImages.darkrai,
  celebi: PetImages.celebi,
  articuno: PetImages.articuno,
  zapdos: PetImages.zapdos,
  moltres: PetImages.moltres,
  mewtwo: PetImages.mewtwo,
  lugia: PetImages.lugia,
  hooh: PetImages.hoOh,
}

/**
 * Get Pokemon image by species name (case-insensitive)
 */
export const getPokemonImage = (species: string): any => {
  const normalized = species.toLowerCase().replace(/[^a-z0-9]/g, '')
  return POKEMON_IMAGE_MAP[normalized] || PetImages.bulbasaur
}
