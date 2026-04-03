/**
 * Utility to load JSON config files for seeding.
 * Reads from backend/config/*.json — the single source of truth for all game data.
 */

import * as fs from 'fs';
import * as path from 'path';

const configDir = path.join(__dirname, '..', 'config');

function loadJson(filename: string): any {
  return JSON.parse(fs.readFileSync(path.join(configDir, filename), 'utf-8'));
}

// ── Regions ─────────────────────────────────────────────────────────────────

export interface RegionSpawnConfig {
  species: string;
  spawnRate: number;
  rarity: string;
  minLevel: number;
  maxLevel: number;
}

export interface RegionConfig {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  energyCost: number;
  coinsCost: number;
  unlockLevel: number;
  imageUrl: string;
  spawns: RegionSpawnConfig[];
}

export function loadRegionsConfig(): RegionConfig[] {
  return loadJson('regions.json').regions;
}

// ── Moves ───────────────────────────────────────────────────────────────────

export interface MoveConfig {
  id: string;
  name: string;
  type: string;
  element: string;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
}

export function loadMovesConfig(): MoveConfig[] {
  return loadJson('moves.json').moves;
}

// ── Items ───────────────────────────────────────────────────────────────────

export interface ItemConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  effectHp?: number;
  effectAttack?: number;
  effectDefense?: number;
  effectSpeed?: number;
  effectXpBoost?: number;
  teachesMove?: string;
  priceCoins?: number;
  priceGems?: number;
  imageUrl?: string;
}

export function loadItemsConfig(): ItemConfig[] {
  return loadJson('items.json').items;
}

// ── Opponents ───────────────────────────────────────────────────────────────

export interface OpponentConfig {
  id: string;
  name: string;
  species: string;
  level: number;
  rarity: string;
  difficulty: string;
  moves: string[];
  rewardXp: number;
  rewardCoins: number;
  unlockLevel: number;
  imageUrl: string;
}

export function loadOpponentsConfig(): OpponentConfig[] {
  return loadJson('opponents.json').opponents;
}

// ── Quests ───────────────────────────────────────────────────────────────────

export interface QuestConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  targetType: string;
  targetCount: number;
  targetRarity?: string;
  rewardCoins?: number;
  rewardGems?: number;
  rewardXp?: number;
  difficulty: string;
  sortOrder: number;
}

export function loadQuestsConfig(): QuestConfig[] {
  return loadJson('quests.json').quests;
}

// ── Game Constants ──────────────────────────────────────────────────────────

export function loadGameConstants(): any {
  return loadJson('game-constants.json');
}
