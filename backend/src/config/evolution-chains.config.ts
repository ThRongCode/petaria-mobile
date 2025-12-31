/**
 * Evolution Chains Configuration
 * 
 * Defines all evolution paths for Pokemon species.
 * 
 * Features:
 * - Level-based evolution requirements
 * - Item-based evolution (stones)
 * - Multiple evolution paths (like Eevee)
 * - Evolution stat bonuses
 * 
 * Flow:
 * 1. Pokemon reaches required level → "Evolve" button appears in FE
 * 2. User clicks evolve → Checks if user has required item
 * 3. Item consumed → Pokemon evolves to new species
 * 4. Stats recalculated using new species base stats
 */

// Evolution stone item IDs
export const EVOLUTION_STONES = {
  FIRE_STONE: 'fire-stone',
  WATER_STONE: 'water-stone',
  THUNDER_STONE: 'thunder-stone',
  LEAF_STONE: 'leaf-stone',
  MOON_STONE: 'moon-stone',
  SUN_STONE: 'sun-stone',
  ICE_STONE: 'ice-stone',
  DUSK_STONE: 'dusk-stone',
} as const

export type EvolutionStoneId = typeof EVOLUTION_STONES[keyof typeof EVOLUTION_STONES]

/**
 * Single evolution path definition
 */
export interface EvolutionPath {
  /** Species this Pokemon evolves into */
  evolvesTo: string
  /** Minimum level required to evolve */
  levelRequired: number
  /** Item required to trigger evolution (null = no item needed, just level) */
  itemRequired: EvolutionStoneId | null
  /** Description shown in UI */
  description?: string
}

/**
 * Evolution data for a species
 */
export interface SpeciesEvolution {
  /** Can this Pokemon evolve? */
  canEvolve: boolean
  /** Evolution paths (multiple for Pokemon like Eevee) */
  evolutions: EvolutionPath[]
  /** What stage is this Pokemon in its evolution line? (1 = base, 2 = mid, 3 = final) */
  stage: number
  /** Maximum evolution stage in this line */
  maxStage: number
  /** What this Pokemon evolved from (null if base form) */
  evolvesFrom: string | null
}

/**
 * Evolution chains for all species
 * 
 * Structure supports:
 * - Single evolution: Charmander → Charmeleon → Charizard
 * - Branching evolution: Eevee → Vaporeon/Jolteon/Flareon/etc.
 * - No evolution: Legendary Pokemon
 */
export const EVOLUTION_CHAINS: Record<string, SpeciesEvolution> = {
  // ============ STARTER POKEMON ============
  
  // Fire Starter Line
  'Charmander': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Charmeleon', levelRequired: 16, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 16+' }
    ],
    stage: 1,
    maxStage: 3,
    evolvesFrom: null,
  },
  'Charmeleon': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Charizard', levelRequired: 36, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 36+' }
    ],
    stage: 2,
    maxStage: 3,
    evolvesFrom: 'Charmander',
  },
  'Charizard': {
    canEvolve: false,
    evolutions: [],
    stage: 3,
    maxStage: 3,
    evolvesFrom: 'Charmeleon',
  },

  // Electric Starter Line
  'Pikachu': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Raichu', levelRequired: 20, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 20+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Raichu': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Pikachu',
  },

  // ============ EEVEE EVOLUTIONS (Branching) ============
  'Eevee': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Vaporeon', levelRequired: 15, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone' },
      { evolvesTo: 'Jolteon', levelRequired: 15, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone' },
      { evolvesTo: 'Flareon', levelRequired: 15, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone' },
      { evolvesTo: 'Leafeon', levelRequired: 15, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone' },
      { evolvesTo: 'Glaceon', levelRequired: 15, itemRequired: EVOLUTION_STONES.ICE_STONE, description: 'Use Ice Stone' },
      { evolvesTo: 'Umbreon', levelRequired: 15, itemRequired: EVOLUTION_STONES.MOON_STONE, description: 'Use Moon Stone' },
      { evolvesTo: 'Espeon', levelRequired: 15, itemRequired: EVOLUTION_STONES.SUN_STONE, description: 'Use Sun Stone' },
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Vaporeon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Jolteon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Flareon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Leafeon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Glaceon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Umbreon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },
  'Espeon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Eevee',
  },

  // ============ MEADOW VALLEY POKEMON ============
  'Fluffbit': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Fluffcloud', levelRequired: 18, itemRequired: EVOLUTION_STONES.MOON_STONE, description: 'Use Moon Stone at level 18+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Fluffcloud': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Fluffbit',
  },

  'Hoplet': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Hopspring', levelRequired: 16, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone at level 16+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Hopspring': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Hoplet',
  },

  'Chirpie': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Songbird', levelRequired: 14, itemRequired: EVOLUTION_STONES.SUN_STONE, description: 'Use Sun Stone at level 14+' }
    ],
    stage: 1,
    maxStage: 3,
    evolvesFrom: null,
  },
  'Songbird': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Skymelody', levelRequired: 30, itemRequired: EVOLUTION_STONES.SUN_STONE, description: 'Use Sun Stone at level 30+' }
    ],
    stage: 2,
    maxStage: 3,
    evolvesFrom: 'Chirpie',
  },
  'Skymelody': {
    canEvolve: false,
    evolutions: [],
    stage: 3,
    maxStage: 3,
    evolvesFrom: 'Songbird',
  },

  'Sparkpup': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Sparkwolf', levelRequired: 20, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 20+' }
    ],
    stage: 1,
    maxStage: 3,
    evolvesFrom: null,
  },
  'Sparkwolf': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Stormhowl', levelRequired: 40, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 40+' }
    ],
    stage: 2,
    maxStage: 3,
    evolvesFrom: 'Sparkpup',
  },
  'Stormhowl': {
    canEvolve: false,
    evolutions: [],
    stage: 3,
    maxStage: 3,
    evolvesFrom: 'Sparkwolf',
  },

  'Leafling': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Leafguard', levelRequired: 22, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone at level 22+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Leafguard': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Leafling',
  },

  'Shinybit': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Crystaline', levelRequired: 25, itemRequired: EVOLUTION_STONES.MOON_STONE, description: 'Use Moon Stone at level 25+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Crystaline': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Shinybit',
  },

  // ============ FOREST GROVE POKEMON ============
  'Vinelet': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Vinemask', levelRequired: 24, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone at level 24+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Vinemask': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Vinelet',
  },

  'Mossbug': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Mossguardian', levelRequired: 28, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone at level 28+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Mossguardian': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Mossbug',
  },

  'Thornback': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Thornlord', levelRequired: 32, itemRequired: EVOLUTION_STONES.LEAF_STONE, description: 'Use Leaf Stone at level 32+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Thornlord': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Thornback',
  },

  'Bloomtail': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Bloomqueen', levelRequired: 35, itemRequired: EVOLUTION_STONES.SUN_STONE, description: 'Use Sun Stone at level 35+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Bloomqueen': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Bloomtail',
  },

  'Ancient Oak': {
    canEvolve: false, // Epic, no evolution
    evolutions: [],
    stage: 1,
    maxStage: 1,
    evolvesFrom: null,
  },

  // ============ VOLCANIC PEAK POKEMON ============
  'Emberpup': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Emberwolf', levelRequired: 22, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 22+' }
    ],
    stage: 1,
    maxStage: 3,
    evolvesFrom: null,
  },
  'Emberwolf': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Infernobeast', levelRequired: 40, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 40+' }
    ],
    stage: 2,
    maxStage: 3,
    evolvesFrom: 'Emberpup',
  },
  'Infernobeast': {
    canEvolve: false,
    evolutions: [],
    stage: 3,
    maxStage: 3,
    evolvesFrom: 'Emberwolf',
  },

  'Flameling': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Flamedrake', levelRequired: 28, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 28+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Flamedrake': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Flameling',
  },

  'Lavabeast': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Magmalord', levelRequired: 35, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 35+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Magmalord': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Lavabeast',
  },

  'Scorchclaw': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Blazeclaw', levelRequired: 38, itemRequired: EVOLUTION_STONES.FIRE_STONE, description: 'Use Fire Stone at level 38+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Blazeclaw': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Scorchclaw',
  },

  'Infernowolf': {
    canEvolve: false, // Already powerful
    evolutions: [],
    stage: 1,
    maxStage: 1,
    evolvesFrom: null,
  },

  'Phoenix': {
    canEvolve: false, // Legendary, no evolution
    evolutions: [],
    stage: 1,
    maxStage: 1,
    evolvesFrom: null,
  },

  // ============ CRYSTAL LAKE POKEMON ============
  'Splashfin': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Wavefin', levelRequired: 20, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone at level 20+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Wavefin': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Splashfin',
  },

  'Bubbler': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Bubbleking', levelRequired: 24, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone at level 24+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Bubbleking': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Bubbler',
  },

  'Tidecrab': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Tsunamicrab', levelRequired: 30, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone at level 30+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Tsunamicrab': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Tidecrab',
  },

  'Aquashell': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Aquafortress', levelRequired: 35, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone at level 35+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Aquafortress': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Aquashell',
  },

  'Waveserpent': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Oceanserpent', levelRequired: 40, itemRequired: EVOLUTION_STONES.WATER_STONE, description: 'Use Water Stone at level 40+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Oceanserpent': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Waveserpent',
  },

  'Leviathan': {
    canEvolve: false, // Legendary, no evolution
    evolutions: [],
    stage: 1,
    maxStage: 1,
    evolvesFrom: null,
  },

  // ============ THUNDER PLAINS POKEMON ============
  'Voltmouse': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Voltrat', levelRequired: 18, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 18+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Voltrat': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Voltmouse',
  },

  'Zapperbolt': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Thunderbolt', levelRequired: 28, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 28+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Thunderbolt': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Zapperbolt',
  },

  'Thunderwing': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Stormwing', levelRequired: 35, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 35+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Stormwing': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Thunderwing',
  },

  'Stormdrake': {
    canEvolve: true,
    evolutions: [
      { evolvesTo: 'Tempestdragon', levelRequired: 45, itemRequired: EVOLUTION_STONES.THUNDER_STONE, description: 'Use Thunder Stone at level 45+' }
    ],
    stage: 1,
    maxStage: 2,
    evolvesFrom: null,
  },
  'Tempestdragon': {
    canEvolve: false,
    evolutions: [],
    stage: 2,
    maxStage: 2,
    evolvesFrom: 'Stormdrake',
  },

  'Zeus Beast': {
    canEvolve: false, // Legendary, no evolution
    evolutions: [],
    stage: 1,
    maxStage: 1,
    evolvesFrom: null,
  },
}

// Default for unknown species
const DEFAULT_EVOLUTION: SpeciesEvolution = {
  canEvolve: false,
  evolutions: [],
  stage: 1,
  maxStage: 1,
  evolvesFrom: null,
}

/**
 * Get evolution data for a species
 */
export function getSpeciesEvolution(species: string): SpeciesEvolution {
  return EVOLUTION_CHAINS[species] || DEFAULT_EVOLUTION
}

/**
 * Check if a Pokemon can evolve at its current level
 * Returns available evolution paths
 */
export function getAvailableEvolutions(species: string, currentLevel: number): EvolutionPath[] {
  const evolution = getSpeciesEvolution(species)
  
  if (!evolution.canEvolve) {
    return []
  }

  return evolution.evolutions.filter(evo => currentLevel >= evo.levelRequired)
}

/**
 * Check if a specific evolution is possible with given item
 */
export function canEvolveWith(species: string, currentLevel: number, itemId: string): EvolutionPath | null {
  const availableEvolutions = getAvailableEvolutions(species, currentLevel)
  
  return availableEvolutions.find(evo => evo.itemRequired === itemId) || null
}

/**
 * Get all items that can evolve a specific Pokemon at its current level
 */
export function getRequiredItemsForEvolution(species: string, currentLevel: number): string[] {
  const availableEvolutions = getAvailableEvolutions(species, currentLevel)
  
  return availableEvolutions
    .filter(evo => evo.itemRequired !== null)
    .map(evo => evo.itemRequired as string)
}
