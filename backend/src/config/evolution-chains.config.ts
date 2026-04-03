/**
 * Evolution Chains Configuration — Thin wrapper over ConfigLoaderService
 *
 * All evolution data now lives in backend/config/evolutions.json (single source of truth).
 * This file provides the same static function API that services expect,
 * delegating to ConfigLoaderService at runtime.
 */

import { ConfigLoaderService } from './config-loader.service';

// Evolution stone item IDs — read from JSON, with fallback
export const EVOLUTION_STONES = {
  FIRE_STONE: 'fire-stone',
  WATER_STONE: 'water-stone',
  THUNDER_STONE: 'thunder-stone',
  LEAF_STONE: 'leaf-stone',
  MOON_STONE: 'moon-stone',
  SUN_STONE: 'sun-stone',
  ICE_STONE: 'ice-stone',
  DUSK_STONE: 'dusk-stone',
} as const;

export type EvolutionStoneId = typeof EVOLUTION_STONES[keyof typeof EVOLUTION_STONES];

/**
 * Single evolution path definition (matches what pet.service.ts expects)
 */
export interface EvolutionPath {
  evolvesTo: string;
  levelRequired: number;
  itemRequired: EvolutionStoneId | null;
  description?: string;
}

/**
 * Evolution data for a species
 */
export interface SpeciesEvolution {
  canEvolve: boolean;
  evolutions: EvolutionPath[];
  stage: number;
  maxStage: number;
  evolvesFrom: string | null;
}

// Default for unknown species
const DEFAULT_EVOLUTION: SpeciesEvolution = {
  canEvolve: false,
  evolutions: [],
  stage: 1,
  maxStage: 1,
  evolvesFrom: null,
};

/**
 * Build SpeciesEvolution from the JSON chain format.
 * JSON format: { chain: [{ species, from?, type?, level?, item? }] }
 * We convert to the EvolutionPath format that pet.service.ts expects.
 */
function buildEvolutionData(species: string): SpeciesEvolution {
  const loader = ConfigLoaderService.getInstance();
  if (!loader) return DEFAULT_EVOLUTION;

  const chain = loader.getEvolutionChainForSpecies(species);
  if (!chain) return DEFAULT_EVOLUTION;

  const steps = chain.chain;
  const speciesStep = steps.find(s => s.species === species);
  if (!speciesStep) return DEFAULT_EVOLUTION;

  // Determine stage: position in chain
  const baseSpecies = steps.find(s => !s.from);
  let stage = 1;
  let current = species;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const step = steps.find(s => s.species === current);
    if (step?.from) {
      stage++;
      current = step.from;
    } else {
      break;
    }
  }

  // Calculate max stage in chain
  let maxStage = 1;
  for (const step of steps) {
    let depth = 1;
    let cur = step.species;
    const vis = new Set<string>();
    while (cur && !vis.has(cur)) {
      vis.add(cur);
      const s = steps.find(st => st.species === cur);
      if (s?.from) {
        depth++;
        cur = s.from;
      } else {
        break;
      }
    }
    if (depth > maxStage) maxStage = depth;
  }

  // Find what this species evolves FROM
  const evolvesFrom = speciesStep.from || null;

  // Find what this species can evolve INTO
  const evolutions: EvolutionPath[] = steps
    .filter(s => s.from === species && s.type)
    .map(s => ({
      evolvesTo: s.species,
      levelRequired: s.level || 1,
      itemRequired: (s.item as EvolutionStoneId) || null,
      description: s.item
        ? `Use ${s.item.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}${s.level ? ` at level ${s.level}+` : ''}`
        : s.level
          ? `Reach level ${s.level}`
          : undefined,
    }));

  return {
    canEvolve: evolutions.length > 0,
    evolutions,
    stage,
    maxStage,
    evolvesFrom,
  };
}

/**
 * Get evolution data for a species
 */
export function getSpeciesEvolution(species: string): SpeciesEvolution {
  return buildEvolutionData(species);
}

/**
 * Check if a Pokemon can evolve at its current level
 * Returns available evolution paths
 */
export function getAvailableEvolutions(species: string, currentLevel: number): EvolutionPath[] {
  const evolution = getSpeciesEvolution(species);
  if (!evolution.canEvolve) return [];
  return evolution.evolutions.filter(evo => currentLevel >= evo.levelRequired);
}

/**
 * Check if a specific evolution is possible with given item
 */
export function canEvolveWith(species: string, currentLevel: number, itemId: string): EvolutionPath | null {
  const availableEvolutions = getAvailableEvolutions(species, currentLevel);
  return availableEvolutions.find(evo => evo.itemRequired === itemId) || null;
}

/**
 * Get all items that can evolve a specific Pokemon at its current level
 */
export function getRequiredItemsForEvolution(species: string, currentLevel: number): string[] {
  const availableEvolutions = getAvailableEvolutions(species, currentLevel);
  return availableEvolutions
    .filter(evo => evo.itemRequired !== null)
    .map(evo => evo.itemRequired as string);
}
