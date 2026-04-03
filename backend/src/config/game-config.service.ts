import { Injectable } from '@nestjs/common';
import { ConfigLoaderService } from './config-loader.service';

@Injectable()
export class GameConfigService {
  constructor(private readonly configLoader: ConfigLoaderService) {}

  /**
   * Returns global game configuration constants from game-constants.json
   */
  getGameConfig() {
    const gc = this.configLoader.getGameConstants();
    return {
      // Levels & XP
      maxPetLevel: gc.levels.maxPetLevel,
      maxUserLevel: gc.levels.maxUserLevel,
      petXpPerLevel: gc.levels.petXpPerLevel,
      userXpPerLevel: gc.levels.userXpPerLevel,

      // Tickets
      maxBattleTickets: gc.tickets.maxBattleTickets,
      maxHuntTickets: gc.tickets.maxHuntTickets,
      ticketResetIntervalHours: gc.tickets.resetIntervalHours,

      // Limits
      maxPetSlots: gc.limits.maxPetSlots,
      maxItemSlots: gc.limits.maxItemSlots,

      // Hunting
      huntMovesPerSession: gc.hunting.movesPerSession,
      encounterChance: gc.hunting.encounterChance,
      huntSessionExpiryHours: gc.hunting.sessionExpiryHours,

      // Catching
      catchRates: gc.catching.ballRates,
      rarityCatchModifiers: gc.catching.rarityModifiers,

      // Battle
      battleLossRewardPercent: gc.battle.lossRewardPercent,

      // Healing
      healAllCost: gc.healing.healAllCost,

      // Rarity
      rarityMultipliers: gc.rarityMultipliers,

      // Currencies
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
