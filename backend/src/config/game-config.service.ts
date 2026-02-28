import { Injectable } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';

@Injectable()
export class GameConfigService {
  constructor(private readonly configLoader: ConfigLoaderService) {}

  /**
   * Returns global game configuration constants
   */
  getGameConfig() {
    return {
      healCost: 200,
      maxBattleTickets: 20,
      maxHuntTickets: 5,
      maxPetSlots: 20,
      maxItemSlots: 100,
      ticketResetIntervalHours: 24,
      xpFormula: 'level * 200',
      maxEvolutionStage: 3,
      currencies: ['coins', 'gems', 'pokeballs'],
    };
  }

  /**
   * Returns all known Pokemon/species types
   */
  getSpeciesTypes() {
    const speciesConfig = this.configLoader.getAllSpeciesStats();
    const typesSet = new Set<string>();

    if (speciesConfig) {
      Object.values(speciesConfig).forEach((species) => {
        if (species.type) {
          typesSet.add(species.type);
        }
      });
    }

    // Fallback with known types if config is empty
    if (typesSet.size === 0) {
      return [
        'Normal', 'Fire', 'Water', 'Grass', 'Electric',
        'Ice', 'Fighting', 'Poison', 'Ground', 'Flying',
        'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon',
        'Dark', 'Steel', 'Fairy',
      ];
    }

    return Array.from(typesSet).sort();
  }
}
