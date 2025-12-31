import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SpeciesStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface SpeciesConfig {
  [species: string]: SpeciesStats;
}

export interface RegionSpawn {
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
  spawns: RegionSpawn[];
}

export interface EvolutionStep {
  species: string;
  from?: string;
  type?: 'level' | 'item' | 'trade';
  level?: number;
  item?: string;
}

export interface EvolutionChain {
  chain: EvolutionStep[];
}

export interface EvolutionItem {
  name: string;
  description: string;
}

// Singleton instance for static access
let configInstance: ConfigLoaderService | null = null;

@Injectable()
export class ConfigLoaderService implements OnModuleInit {
  private readonly logger = new Logger(ConfigLoaderService.name);
  private speciesConfig: SpeciesConfig = {};
  private regionsConfig: RegionConfig[] = [];
  private evolutionChains: EvolutionChain[] = [];
  private evolutionItems: Record<string, EvolutionItem> = {};
  private rarityMultipliers = {
    common: 1.0,
    uncommon: 1.1,
    rare: 1.2,
    epic: 1.3,
    legendary: 1.5,
  };
  private isLoaded = false;

  constructor() {
    // Set singleton instance
    configInstance = this;
  }

  onModuleInit() {
    this.loadAllConfigs();
  }

  // Static getter for accessing instance outside of NestJS DI
  static getInstance(): ConfigLoaderService | null {
    return configInstance;
  }

  private loadAllConfigs() {
    if (this.isLoaded) return;

    // Config files are in /backend/config/, not in dist
    // Use process.cwd() which should be the backend folder
    const configDir = path.join(process.cwd(), 'config');

    this.loadSpeciesConfig(configDir);
    this.loadRegionsConfig(configDir);
    this.loadEvolutionsConfig(configDir);

    this.isLoaded = true;
    this.logger.log('All game configurations loaded successfully');
  }

  private loadSpeciesConfig(configDir: string) {
    try {
      const speciesPath = path.join(configDir, 'species.json');
      const speciesData = JSON.parse(fs.readFileSync(speciesPath, 'utf-8'));

      // Flatten species from categories
      this.speciesConfig = {};
      for (const category of Object.keys(speciesData.species)) {
        Object.assign(this.speciesConfig, speciesData.species[category]);
      }

      // Load rarity multipliers
      if (speciesData.rarityMultipliers) {
        this.rarityMultipliers = speciesData.rarityMultipliers;
      }

      this.logger.log(
        `Loaded ${Object.keys(this.speciesConfig).length} species`,
      );
    } catch (error) {
      this.logger.error('Failed to load species config', error);
      throw error;
    }
  }

  private loadRegionsConfig(configDir: string) {
    try {
      const regionsPath = path.join(configDir, 'regions.json');
      const regionsData = JSON.parse(fs.readFileSync(regionsPath, 'utf-8'));

      this.regionsConfig = regionsData.regions;

      this.logger.log(`Loaded ${this.regionsConfig.length} regions`);
    } catch (error) {
      this.logger.error('Failed to load regions config', error);
      throw error;
    }
  }

  private loadEvolutionsConfig(configDir: string) {
    try {
      const evolutionsPath = path.join(configDir, 'evolutions.json');
      const evolutionsData = JSON.parse(
        fs.readFileSync(evolutionsPath, 'utf-8'),
      );

      this.evolutionChains = evolutionsData.evolutionChains;
      this.evolutionItems = evolutionsData.evolutionItems || {};

      this.logger.log(
        `Loaded ${this.evolutionChains.length} evolution chains`,
      );
    } catch (error) {
      this.logger.error('Failed to load evolutions config', error);
      throw error;
    }
  }

  // Species methods
  getSpeciesStats(species: string): SpeciesStats | null {
    return this.speciesConfig[species] || null;
  }

  getAllSpecies(): string[] {
    return Object.keys(this.speciesConfig);
  }

  getAllSpeciesStats(): SpeciesConfig {
    return { ...this.speciesConfig };
  }

  getRarityMultiplier(
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
  ): number {
    return this.rarityMultipliers[rarity] || 1.0;
  }

  // Regions methods
  getAllRegions(): RegionConfig[] {
    return [...this.regionsConfig];
  }

  getRegionById(id: string): RegionConfig | null {
    return this.regionsConfig.find((r) => r.id === id) || null;
  }

  getRegionSpawns(regionId: string): RegionSpawn[] {
    const region = this.getRegionById(regionId);
    return region?.spawns || [];
  }

  getFeaturedSpawns(regionId: string, limit = 4): RegionSpawn[] {
    const spawns = this.getRegionSpawns(regionId);
    return spawns.sort((a, b) => b.spawnRate - a.spawnRate).slice(0, limit);
  }

  getRareSpawns(regionId: string): RegionSpawn[] {
    const spawns = this.getRegionSpawns(regionId);
    return spawns.filter((s) =>
      ['rare', 'epic', 'legendary'].includes(s.rarity),
    );
  }

  // Evolution methods
  getAllEvolutionChains(): EvolutionChain[] {
    return [...this.evolutionChains];
  }

  getEvolutionChainForSpecies(species: string): EvolutionChain | null {
    return (
      this.evolutionChains.find((chain) =>
        chain.chain.some((step) => step.species === species),
      ) || null
    );
  }

  getEvolutionsForSpecies(
    species: string,
  ): { species: string; type: string; level?: number; item?: string }[] {
    const evolutions: {
      species: string;
      type: string;
      level?: number;
      item?: string;
    }[] = [];

    for (const chain of this.evolutionChains) {
      for (const step of chain.chain) {
        if (step.from === species && step.type) {
          evolutions.push({
            species: step.species,
            type: step.type,
            level: step.level,
            item: step.item,
          });
        }
      }
    }

    return evolutions;
  }

  canEvolve(
    species: string,
    level: number,
    availableItems: string[],
  ): { canEvolve: boolean; evolveTo?: string; method?: string } {
    const evolutions = this.getEvolutionsForSpecies(species);

    for (const evo of evolutions) {
      if (evo.type === 'level' && evo.level && level >= evo.level) {
        return { canEvolve: true, evolveTo: evo.species, method: 'level' };
      }
      if (evo.type === 'item' && evo.item && availableItems.includes(evo.item)) {
        return {
          canEvolve: true,
          evolveTo: evo.species,
          method: `item:${evo.item}`,
        };
      }
    }

    return { canEvolve: false };
  }

  getEvolutionItem(itemId: string): EvolutionItem | null {
    return this.evolutionItems[itemId] || null;
  }

  getAllEvolutionItems(): Record<string, EvolutionItem> {
    return { ...this.evolutionItems };
  }

  // Reload configs (useful for hot-reloading in development)
  reloadConfigs() {
    this.loadAllConfigs();
    this.logger.log('Configurations reloaded');
  }
}
