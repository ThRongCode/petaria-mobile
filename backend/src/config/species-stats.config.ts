/**
 * Species Stats Configuration — Thin wrapper over ConfigLoaderService
 *
 * All species data now lives in backend/config/species.json (single source of truth).
 * This file provides the same static function API that services expect,
 * delegating to ConfigLoaderService at runtime.
 */

import { ConfigLoaderService } from './config-loader.service';

export interface SpeciesBaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

/**
 * IV (Individual Value) Configuration
 * IVs range from 0 to MAX_IV and are randomly generated when a Pokemon is captured
 */
export const IV_CONFIG = {
  MIN_IV: 0,
  MAX_IV: 15,
};

/**
 * Get base stats for a species from JSON config
 * Returns default stats if species not found
 */
export function getSpeciesBaseStats(species: string): SpeciesBaseStats {
  const loader = ConfigLoaderService.getInstance();
  if (loader) {
    const stats = loader.getSpeciesStats(species);
    if (stats) {
      return { hp: stats.hp, attack: stats.attack, defense: stats.defense, speed: stats.speed };
    }
  }
  // Default stats for unknown species
  return { hp: 50, attack: 50, defense: 50, speed: 50 };
}

/**
 * Get the type(s) for a species
 */
export function getSpeciesType(species: string): string {
  const loader = ConfigLoaderService.getInstance();
  if (loader) {
    return loader.getSpeciesType(species);
  }
  return 'Normal';
}

/**
 * Generate random IVs for a captured Pokemon
 */
export function generateRandomIVs(): { ivHp: number; ivAttack: number; ivDefense: number; ivSpeed: number } {
  const loader = ConfigLoaderService.getInstance();
  if (loader) {
    return loader.generateRandomIVs();
  }
  const randomIV = () => Math.floor(Math.random() * (IV_CONFIG.MAX_IV + 1));
  return { ivHp: randomIV(), ivAttack: randomIV(), ivDefense: randomIV(), ivSpeed: randomIV() };
}

/**
 * Calculate final stat based on base stat, IV, level, and rarity
 * Formula: ((baseStat + IV) * (1 + level * 0.1)) * rarityMultiplier
 */
export function calculateFinalStat(
  baseStat: number,
  iv: number,
  level: number,
  rarityMultiplier: number,
): number {
  const loader = ConfigLoaderService.getInstance();
  if (loader) {
    return loader.calculateFinalStat(baseStat, iv, level, rarityMultiplier);
  }
  // Fallback formula
  const levelMultiplier = 1 + level * 0.1;
  return Math.floor((baseStat + iv) * levelMultiplier * rarityMultiplier);
}

/**
 * Get rarity multiplier from centralized config
 */
export function getRarityMultiplier(rarity: string): number {
  const loader = ConfigLoaderService.getInstance();
  if (loader) {
    return loader.getRarityMultiplier(rarity as any);
  }
  const multipliers: Record<string, number> = {
    common: 1.0, uncommon: 1.1, rare: 1.2, epic: 1.3, legendary: 1.5,
  };
  return multipliers[rarity.toLowerCase()] || 1.0;
}
