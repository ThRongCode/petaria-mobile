# Game Data Centralization Guide

> Where to find, add, and modify all game content in Petaria.

---

## Architecture Overview

```
backend/config/           ← JSON config files (single source of truth)
  ├── species.json        ← All Pokémon: base stats, types, descriptions
  ├── evolutions.json     ← Evolution chains, stones, level requirements
  ├── regions.json        ← Hunt regions, spawn tables, level ranges
  └── game-constants.json ← All game tuning numbers (XP, tickets, costs, rates)

backend/prisma/seed.ts    ← Items, moves, opponents (seeded into database)

backend/src/config/
  ├── config-loader.service.ts  ← Loads JSON configs at startup (NestJS singleton)
  ├── species-stats.config.ts   ← Thin wrapper: species stats API
  ├── evolution-chains.config.ts← Thin wrapper: evolution chain API
  └── game-config.service.ts    ← Serves game-constants.json via REST API
```

**Flow:** JSON files → `ConfigLoaderService` → wrapper modules → services → REST API → frontend

---

## 1. Pokémon / Species List

**File:** `backend/config/species.json`

Each entry defines a species with base stats, type, and rarity tier:

```json
{
  "Pikachu": {
    "type": "Electric",
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "speed": 90,
    "description": "An Electric-type Pokémon known for its lightning bolt-shaped tail."
  }
}
```

**To add a new Pokémon:** Add an entry to `species.json`. That's it — the backend picks it up automatically on restart.

**Currently:** 67 species (all real Pokémon).

**Used by:** `ConfigLoaderService` → `species-stats.config.ts` → hunt service (spawning), pet service (stat calculation), battle service (damage calc).

---

## 2. Evolution Chains

**File:** `backend/config/evolutions.json`

Defines evolution stones and chain paths:

```json
{
  "evolutionStones": [
    { "id": "fire-stone", "name": "Fire Stone", "description": "..." },
    ...
  ],
  "evolutionChains": [
    {
      "chain": ["Charmander", "Charmeleon", "Charizard"],
      "method": "level",
      "levelRequired": [16, 36]
    },
    {
      "chain": ["Eevee", "Flareon"],
      "method": "stone",
      "stone": "fire-stone"
    }
  ]
}
```

**To add an evolution:** Add a chain entry. If it needs a new stone, add it to `evolutionStones` too.

**Currently:** 8 evolution stones, 18+ evolution chains (including 7 Eeveelutions).

**Used by:** `evolution-chains.config.ts` → pet service (evolve endpoint), pet details screen (evo tab).

---

## 3. Hunt Regions & Spawn Tables

**File:** `backend/config/regions.json`

Defines which Pokémon appear in each region and at what rates:

```json
{
  "regions": [
    {
      "id": "meadow-valley",
      "name": "Meadow Valley",
      "description": "...",
      "spawns": [
        { "species": "Pikachu", "spawnRate": 0.15, "rarity": "uncommon", "minLevel": 3, "maxLevel": 8 }
      ]
    }
  ]
}
```

**To add a region or change spawns:** Edit `regions.json`.

**Currently:** 5 regions (meadow-valley, forest-grove, volcanic-peak, crystal-lake, thunder-plains).

**Used by:** `ConfigLoaderService` → hunt service (session creation, encounter rolls).

---

## 4. Game Constants (XP, Tickets, Costs, Rates)

**File:** `backend/config/game-constants.json`

Single source of truth for **all tuning numbers**:

| Section | Constants | Example |
|---------|-----------|---------|
| `levels` | Max pet/user level, XP per level | `maxPetLevel: 100`, `petXpPerLevel: 100` |
| `stats` | IV range, level multiplier formula | `ivMax: 15`, `levelMultiplierPerLevel: 0.1` |
| `rarityMultipliers` | Stat multiplier by rarity | `legendary: 1.5` |
| `tickets` | Daily hunt/battle ticket limits | `maxHuntTickets: 5`, `maxBattleTickets: 20` |
| `limits` | Max pets and items per user | `maxPetSlots: 100`, `maxItemSlots: 500` |
| `hunting` | Moves per session, encounter chance, expiry | `encounterChance: 0.5` |
| `catching` | Ball catch rates, rarity modifiers | `pokeball: 0.4`, `legendary: 0.3` |
| `battle` | Loss reward percentage | `lossRewardPercent: 0.3` |
| `healing` | Heal-all cost, feed mood, max mood | `healAllCost: 200`, `feedMoodIncrease: 20` |
| `newUser` | Starting resources for new accounts | `startingCoins: 1000` |

**To change a game number:** Edit `game-constants.json`. No code changes needed.

**Used by:** Every backend service reads from this via `ConfigLoaderService.getInstance().getGameConstants()`. The frontend receives these values via `GET /config/game` and profile responses.

---

## 5. Stat Calculation on Level Up

**Formula** (defined by `game-constants.json` values):

```
finalStat = floor((baseStat + IV) × (1 + level × 0.1) × rarityMultiplier)
```

- **Base stats** → from `species.json`
- **IVs** → random 0–15 generated on capture (from `stats.ivMin`/`stats.ivMax`)
- **Level multiplier** → `stats.levelMultiplierBase` + level × `stats.levelMultiplierPerLevel`
- **Rarity multiplier** → from `rarityMultipliers` (Common 1.0 → Legendary 1.5)

**XP required for next level:**
- Pet: `level × petXpPerLevel` (default: level × 100)
- User: `level × userXpPerLevel` (default: level × 200)

**Code:** `config-loader.service.ts` → `calculateFinalStat()`, `generateRandomIVs()`

---

## 6. Items (Potions, Stones, Boosts, Pokéballs)

**File:** `backend/prisma/seed.ts` (seeded into database)

Items live in the database, not JSON configs. They are created during `prisma db seed`.

**Categories:**
- Healing: Potion, Super Potion, Hyper Potion, Max Potion
- Stat Boosts: Attack Boost, Defense Boost, Speed Boost (permanent)
- Evolution: Fire/Water/Thunder/Leaf/Moon/Sun/Ice/Dusk Stone, Rare Candy
- Pokéballs: Pokéball, Great Ball, Ultra Ball

**To add a new item:** Add it to the `items` array in `seed.ts` and re-run `npx prisma db seed`.

**Served via:** `GET /items/catalog` (shop), `GET /users/inventory` (user's items).

---

## 7. Moves

**File:** `backend/prisma/seed.ts` (seeded into database)

Moves are also in the database. Current types with moves: Normal, Fire, Water, Grass, Electric.

**To add a move:** Add it to the moves section in `seed.ts` and re-seed.

**Served via:** Included with pet data and opponent data from their respective API endpoints.

---

## 8. Battle Opponents

**File:** `backend/prisma/seed.ts` (seeded into database)

NPC opponents with difficulty tiers, reward amounts, and assigned moves.

**To add an opponent:** Add a `prisma.opponent.create()` block in `seed.ts` and re-seed.

**Served via:** `GET /battles/opponents`.

---

## 9. Quick Reference — "Where do I change X?"

| Want to change... | Edit this file |
|---|---|
| Add/remove a Pokémon | `backend/config/species.json` |
| Change base stats or type | `backend/config/species.json` |
| Add an evolution chain | `backend/config/evolutions.json` |
| Add an evolution stone | `backend/config/evolutions.json` → `evolutionStones` |
| Change spawn rates | `backend/config/regions.json` |
| Add a new region | `backend/config/regions.json` |
| Change XP formula | `backend/config/game-constants.json` → `levels` |
| Change catch rates | `backend/config/game-constants.json` → `catching` |
| Change ticket limits | `backend/config/game-constants.json` → `tickets` |
| Change heal cost | `backend/config/game-constants.json` → `healing` |
| Change max pets/items | `backend/config/game-constants.json` → `limits` |
| Change stat formula | `backend/config/game-constants.json` → `stats` |
| Add a new item | `backend/prisma/seed.ts` → re-seed DB |
| Add a new move | `backend/prisma/seed.ts` → re-seed DB |
| Add a battle opponent | `backend/prisma/seed.ts` → re-seed DB |

---

## 10. Frontend Data Flow

The frontend does **not** hardcode game data. All data flows from the backend:

```
Backend JSON configs / Database
        ↓
  NestJS REST API
        ↓
  Frontend API layer (src/services/api/)
        ↓
  Redux Saga (src/stores/saga/game.ts)
        ↓
  Redux Store → Screens
```

The `GET /config/game` endpoint exposes all game constants for the frontend to consume.
