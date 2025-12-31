/**
 * Species Base Stats Configuration
 * 
 * Each species has unique base stats that define their strengths.
 * When a Pokemon is captured, these base stats are used along with
 * random IVs (0-15) to calculate final stats.
 * 
 * Formula: finalStat = (baseStat + IV) * levelMultiplier * rarityMultiplier
 * 
 * Base stat ranges: 30-100 (roughly)
 * - Low: 30-45
 * - Medium: 50-65
 * - High: 70-85
 * - Very High: 90-100
 */

export interface SpeciesBaseStats {
  hp: number
  attack: number
  defense: number
  speed: number
}

// Default stats for unknown species
const DEFAULT_STATS: SpeciesBaseStats = {
  hp: 50,
  attack: 50,
  defense: 50,
  speed: 50,
}

/**
 * Base stats for all species
 * Balanced around different archetypes:
 * - Tank: High HP/Defense, Low Speed
 * - Attacker: High Attack, Low Defense
 * - Speedster: High Speed, Lower other stats
 * - Balanced: Medium all around
 */
export const SPECIES_BASE_STATS: Record<string, SpeciesBaseStats> = {
  // ============ Meadow Valley (Starter Area) ============
  'Fluffbit': {
    hp: 45,
    attack: 35,
    defense: 40,
    speed: 50,
  },
  'Hoplet': {
    hp: 40,
    attack: 40,
    defense: 35,
    speed: 55,
  },
  'Chirpie': {
    hp: 35,
    attack: 45,
    defense: 30,
    speed: 60,
  },
  'Sparkpup': {
    hp: 45,
    attack: 55,
    defense: 40,
    speed: 65,
  },
  'Leafling': {
    hp: 55,
    attack: 45,
    defense: 55,
    speed: 40,
  },
  'Shinybit': {
    hp: 50,
    attack: 60,
    defense: 50,
    speed: 70,
  },

  // ============ Forest Grove ============
  'Vinelet': {
    hp: 55,
    attack: 50,
    defense: 60,
    speed: 35,
  },
  'Mossbug': {
    hp: 60,
    attack: 45,
    defense: 70,
    speed: 30,
  },
  'Thornback': {
    hp: 65,
    attack: 70,
    defense: 65,
    speed: 35,
  },
  'Bloomtail': {
    hp: 70,
    attack: 55,
    defense: 60,
    speed: 55,
  },
  'Ancient Oak': {
    hp: 95,
    attack: 60,
    defense: 90,
    speed: 25,
  },

  // ============ Volcanic Peak ============
  'Emberpup': {
    hp: 50,
    attack: 60,
    defense: 45,
    speed: 55,
  },
  'Flameling': {
    hp: 55,
    attack: 70,
    defense: 40,
    speed: 60,
  },
  'Lavabeast': {
    hp: 75,
    attack: 80,
    defense: 60,
    speed: 35,
  },
  'Scorchclaw': {
    hp: 65,
    attack: 85,
    defense: 55,
    speed: 65,
  },
  'Infernowolf': {
    hp: 70,
    attack: 90,
    defense: 50,
    speed: 80,
  },
  'Phoenix': {
    hp: 85,
    attack: 95,
    defense: 70,
    speed: 90,
  },

  // ============ Crystal Lake ============
  'Splashfin': {
    hp: 55,
    attack: 45,
    defense: 50,
    speed: 60,
  },
  'Bubbler': {
    hp: 60,
    attack: 50,
    defense: 55,
    speed: 50,
  },
  'Tidecrab': {
    hp: 70,
    attack: 65,
    defense: 80,
    speed: 30,
  },
  'Aquashell': {
    hp: 80,
    attack: 55,
    defense: 85,
    speed: 35,
  },
  'Waveserpent': {
    hp: 75,
    attack: 75,
    defense: 65,
    speed: 70,
  },
  'Leviathan': {
    hp: 100,
    attack: 85,
    defense: 80,
    speed: 60,
  },

  // ============ Thunder Plains ============
  'Voltmouse': {
    hp: 40,
    attack: 50,
    defense: 35,
    speed: 80,
  },
  'Zapperbolt': {
    hp: 50,
    attack: 70,
    defense: 45,
    speed: 85,
  },
  'Thunderwing': {
    hp: 60,
    attack: 75,
    defense: 50,
    speed: 90,
  },
  'Stormdrake': {
    hp: 75,
    attack: 85,
    defense: 70,
    speed: 85,
  },
  'Zeus Beast': {
    hp: 90,
    attack: 100,
    defense: 75,
    speed: 95,
  },

  // ============ Starter Pokemon (for test user) ============
  'Pikachu': {
    hp: 45,
    attack: 55,
    defense: 40,
    speed: 90,
  },
  'Raichu': {
    hp: 60,
    attack: 90,
    defense: 55,
    speed: 110,
  },
  'Charmander': {
    hp: 50,
    attack: 65,
    defense: 45,
    speed: 65,
  },
  'Charmeleon': {
    hp: 58,
    attack: 80,
    defense: 58,
    speed: 80,
  },
  'Charizard': {
    hp: 78,
    attack: 109,
    defense: 78,
    speed: 100,
  },

  // ============ Eevee Evolution Line ============
  'Eevee': {
    hp: 55,
    attack: 55,
    defense: 50,
    speed: 55,
  },
  'Vaporeon': {
    hp: 130,
    attack: 65,
    defense: 60,
    speed: 65,
  },
  'Jolteon': {
    hp: 65,
    attack: 65,
    defense: 60,
    speed: 130,
  },
  'Flareon': {
    hp: 65,
    attack: 130,
    defense: 60,
    speed: 65,
  },
  'Leafeon': {
    hp: 65,
    attack: 110,
    defense: 130,
    speed: 95,
  },
  'Glaceon': {
    hp: 65,
    attack: 60,
    defense: 110,
    speed: 65,
  },
  'Umbreon': {
    hp: 95,
    attack: 65,
    defense: 110,
    speed: 65,
  },
  'Espeon': {
    hp: 65,
    attack: 65,
    defense: 60,
    speed: 110,
  },

  // ============ Meadow Valley Evolutions ============
  'Fluffcloud': {
    hp: 70,
    attack: 50,
    defense: 65,
    speed: 70,
  },
  'Hopspring': {
    hp: 60,
    attack: 65,
    defense: 55,
    speed: 80,
  },
  'Songbird': {
    hp: 50,
    attack: 65,
    defense: 45,
    speed: 80,
  },
  'Skymelody': {
    hp: 70,
    attack: 85,
    defense: 60,
    speed: 100,
  },
  'Sparkwolf': {
    hp: 65,
    attack: 80,
    defense: 60,
    speed: 90,
  },
  'Stormhowl': {
    hp: 85,
    attack: 110,
    defense: 75,
    speed: 115,
  },
  'Leafguard': {
    hp: 80,
    attack: 65,
    defense: 85,
    speed: 55,
  },
  'Crystaline': {
    hp: 70,
    attack: 90,
    defense: 70,
    speed: 100,
  },

  // ============ Forest Grove Evolutions ============
  'Vinemask': {
    hp: 80,
    attack: 75,
    defense: 90,
    speed: 50,
  },
  'Mossguardian': {
    hp: 90,
    attack: 65,
    defense: 105,
    speed: 40,
  },
  'Thornlord': {
    hp: 90,
    attack: 100,
    defense: 90,
    speed: 50,
  },
  'Bloomqueen': {
    hp: 100,
    attack: 80,
    defense: 85,
    speed: 75,
  },

  // ============ Volcanic Peak Evolutions ============
  'Emberwolf': {
    hp: 70,
    attack: 85,
    defense: 60,
    speed: 75,
  },
  'Infernobeast': {
    hp: 95,
    attack: 115,
    defense: 80,
    speed: 95,
  },
  'Flamedrake': {
    hp: 80,
    attack: 100,
    defense: 60,
    speed: 80,
  },
  'Magmalord': {
    hp: 105,
    attack: 110,
    defense: 85,
    speed: 50,
  },
  'Blazeclaw': {
    hp: 85,
    attack: 115,
    defense: 70,
    speed: 85,
  },

  // ============ Crystal Lake Evolutions ============
  'Wavefin': {
    hp: 80,
    attack: 65,
    defense: 75,
    speed: 85,
  },
  'Bubbleking': {
    hp: 90,
    attack: 75,
    defense: 80,
    speed: 70,
  },
  'Tsunamicrab': {
    hp: 100,
    attack: 90,
    defense: 115,
    speed: 45,
  },
  'Aquafortress': {
    hp: 115,
    attack: 75,
    defense: 120,
    speed: 45,
  },
  'Oceanserpent': {
    hp: 105,
    attack: 105,
    defense: 90,
    speed: 95,
  },

  // ============ Thunder Plains Evolutions ============
  'Voltrat': {
    hp: 55,
    attack: 75,
    defense: 50,
    speed: 100,
  },
  'Thunderbolt': {
    hp: 70,
    attack: 95,
    defense: 60,
    speed: 110,
  },
  'Stormwing': {
    hp: 80,
    attack: 100,
    defense: 65,
    speed: 115,
  },
  'Tempestdragon': {
    hp: 100,
    attack: 115,
    defense: 95,
    speed: 110,
  },
}

/**
 * Get base stats for a species
 * Returns default stats if species not found
 */
export function getSpeciesBaseStats(species: string): SpeciesBaseStats {
  return SPECIES_BASE_STATS[species] || DEFAULT_STATS
}

/**
 * IV (Individual Value) Configuration
 * IVs range from 0 to MAX_IV and are randomly generated when a Pokemon is captured
 */
export const IV_CONFIG = {
  MIN_IV: 0,
  MAX_IV: 15,  // Simplified from Pokemon's 0-31 range
}

/**
 * Generate random IVs for a captured Pokemon
 */
export function generateRandomIVs(): { ivHp: number; ivAttack: number; ivDefense: number; ivSpeed: number } {
  const randomIV = () => Math.floor(Math.random() * (IV_CONFIG.MAX_IV + 1))
  
  return {
    ivHp: randomIV(),
    ivAttack: randomIV(),
    ivDefense: randomIV(),
    ivSpeed: randomIV(),
  }
}

/**
 * Calculate final stat based on base stat, IV, level, and rarity
 * 
 * Formula: ((baseStat + IV) * (1 + level * 0.1)) * rarityMultiplier
 */
export function calculateFinalStat(
  baseStat: number,
  iv: number,
  level: number,
  rarityMultiplier: number
): number {
  const levelMultiplier = 1 + level * 0.1  // Level 1 = 1.1x, Level 10 = 2x, Level 20 = 3x
  return Math.floor((baseStat + iv) * levelMultiplier * rarityMultiplier)
}

/**
 * Get rarity multiplier
 */
export function getRarityMultiplier(rarity: string): number {
  const multipliers: Record<string, number> = {
    common: 1.0,
    uncommon: 1.1,
    rare: 1.2,
    epic: 1.3,
    legendary: 1.5,
  }
  return multipliers[rarity.toLowerCase()] || 1.0
}
