/**
 * Utility to load JSON config files for seeding
 * This is used by seed.ts to read from the centralized JSON configs
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RegionSpawnConfig {
  species: string;
  spawnRate: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  minLevel: number;
  maxLevel: number;
}

export interface RegionConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  energyCost: number;
  coinsCost: number;
  unlockLevel: number;
  imageUrl: string;
  spawns: RegionSpawnConfig[];
}

export interface SpeciesStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface SpeciesConfig {
  [species: string]: SpeciesStats;
}

/**
 * Load regions configuration from JSON file
 */
export function loadRegionsConfig(): RegionConfig[] {
  const configPath = path.join(__dirname, '..', 'config', 'regions.json');
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return data.regions;
}

/**
 * Load species configuration from JSON file
 */
export function loadSpeciesConfig(): SpeciesConfig {
  const configPath = path.join(__dirname, '..', 'config', 'species.json');
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  // Flatten species from categories
  const species: SpeciesConfig = {};
  for (const category of Object.keys(data.species)) {
    Object.assign(species, data.species[category]);
  }
  return species;
}

/**
 * Load evolution chains configuration from JSON file
 */
export function loadEvolutionsConfig(): any {
  const configPath = path.join(__dirname, '..', 'config', 'evolutions.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * Get rarity multipliers from species config
 */
export function loadRarityMultipliers(): Record<string, number> {
  const configPath = path.join(__dirname, '..', 'config', 'species.json');
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return data.rarityMultipliers || {
    common: 1.0,
    uncommon: 1.1,
    rare: 1.2,
    epic: 1.3,
    legendary: 1.5,
  };
}
