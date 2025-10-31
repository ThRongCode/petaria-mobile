/**
 * Pet Component Types & Constants
 * 
 * Centralized type definitions and constants for pet-related components
 */

export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export interface PetStat {
  name: string
  value: number
  maxValue?: number
}

export interface Pet {
  id: number
  name: string
  types: PokemonType[]
  sprite: string | number | any // Can be URI string or require() object
  stats: PetStat[]
  description?: string
  level?: number
  moves?: string[]
  evolutions?: {
    from?: string
    to?: string[]
  }
}

/**
 * Color mappings for Pokemon types
 */
export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
}

/**
 * Get primary type color for a pet (uses first type)
 */
export const getPrimaryTypeColor = (types: PokemonType[]): string => {
  return types.length > 0 ? TYPE_COLORS[types[0]] : TYPE_COLORS.normal
}

/**
 * Get gradient colors for type (for backgrounds)
 */
export const getTypeGradient = (types: PokemonType[]): [string, string] => {
  const primary = getPrimaryTypeColor(types)
  const secondary = types.length > 1 ? TYPE_COLORS[types[1]] : primary
  return [primary, secondary]
}

/**
 * Format Pokemon ID with leading zeros
 */
export const formatPetId = (id: number | undefined | null): string => {
  if (!id) return '#000'
  return `#${id.toString().padStart(3, '0')}`
}
