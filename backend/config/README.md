# Game Configuration System

This directory contains JSON configuration files that define game content like Pokemon species, hunting regions, and evolution chains. These files allow easy content management without code changes.

## Configuration Files

### `species.json`
Defines all Pokemon species with their base stats (HP, Attack, Defense, Speed).

**Structure:**
```json
{
  "species": {
    "starters": {
      "Bulbasaur": { "hp": 45, "attack": 49, "defense": 49, "speed": 45 }
    },
    "common": { ... },
    "grass": { ... },
    "fire": { ... },
    "water": { ... },
    "electric": { ... },
    "bug": { ... },
    "legendaries": { ... },
    "eeveelutions": { ... }
  },
  "rarityMultipliers": {
    "common": 1.0,
    "uncommon": 1.1,
    "rare": 1.2,
    "epic": 1.3,
    "legendary": 1.5
  }
}
```

### `regions.json`
Defines hunting regions and their Pokemon spawns.

**Structure:**
```json
{
  "regions": [
    {
      "id": "meadow-valley",
      "name": "Meadow Valley",
      "description": "A peaceful valley with gentle creatures",
      "difficulty": "easy",
      "energyCost": 5,
      "coinsCost": 0,
      "unlockLevel": 1,
      "imageUrl": "/regions/meadow-valley.png",
      "spawns": [
        { "species": "Rattata", "spawnRate": 30, "rarity": "common", "minLevel": 1, "maxLevel": 5 },
        { "species": "Pikachu", "spawnRate": 8, "rarity": "uncommon", "minLevel": 5, "maxLevel": 10 }
      ]
    }
  ]
}
```

### `evolutions.json`
Defines evolution chains and items.

**Structure:**
```json
{
  "evolutionItems": {
    "fire-stone": { "name": "Fire Stone", "description": "..." }
  },
  "evolutionChains": [
    {
      "chain": [
        { "species": "Charmander" },
        { "species": "Charmeleon", "from": "Charmander", "type": "level", "level": 16 },
        { "species": "Charizard", "from": "Charmeleon", "type": "level", "level": 36 }
      ]
    }
  ]
}
```

## How to Add Content

### Adding a New Pokemon Species

1. Open `species.json`
2. Add the species under the appropriate category:
   ```json
   "Pichu": { "hp": 20, "attack": 40, "defense": 15, "speed": 60 }
   ```
3. If it has evolutions, update `evolutions.json` as well

### Adding a New Region

1. Open `regions.json`
2. Add a new region object to the `regions` array:
   ```json
   {
     "id": "new-region",
     "name": "New Region Name",
     "description": "Description here",
     "difficulty": "medium",
     "energyCost": 10,
     "coinsCost": 200,
     "unlockLevel": 8,
     "imageUrl": "/regions/new-region.png",
     "spawns": [
       { "species": "Bulbasaur", "spawnRate": 25, "rarity": "uncommon", "minLevel": 5, "maxLevel": 10 }
     ]
   }
   ```
3. Run the database seed to apply: `npx ts-node prisma/seed.ts`

### Modifying Spawn Rates

1. Open `regions.json`
2. Find the region you want to modify
3. Adjust `spawnRate` values (should roughly total 100 per region)
4. Re-seed the database

## Stats Formula

Final stat calculation:
```
finalStat = (baseStat + IV) * levelMultiplier * rarityMultiplier

where:
- baseStat: from species.json
- IV: random 0-15 generated at catch
- levelMultiplier: 1 + (level * 0.1)
- rarityMultiplier: from species.json rarityMultipliers
```

## Development Notes

- The `ConfigLoaderService` loads these JSON files at application startup
- Changes to JSON files require server restart (or calling `reloadConfigs()`)
- Database seeding uses `prisma/config-loader.ts` to read from these files
- Frontend still uses database data, which is populated from these configs via seeding

## File Locations

- Config files: `/backend/config/`
- Config loader service: `/backend/src/config/config-loader.service.ts`
- Seed config loader: `/backend/prisma/config-loader.ts`
