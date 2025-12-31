# Pokemon Data Management Guide

This guide explains how to modify Pokemon data in the VnPet app.

---

## Quick Reference Table

| What to Change | File Location | Section |
|----------------|---------------|---------|
| Pokemon Image | `src/assets/images/pet_image/*.png` | [Images](#1-changing-pokemon-images) |
| Base Stats (HP, ATK, DEF, SPD) | `backend/src/config/species-stats.config.ts` | [Stats](#2-modifying-base-stats) |
| Evolution Level Requirement | `backend/src/config/evolution-chains.config.ts` | [Evolution](#3-modifying-evolution-requirements) |
| Evolution Target Species | `backend/src/config/evolution-chains.config.ts` | [Evolution](#4-changing-evolution-target) |
| Required Evolution Item | `backend/src/config/evolution-chains.config.ts` | [Evolution](#3-modifying-evolution-requirements) |

---

## 1. Changing Pokemon Images

### File Locations
```
Frontend Image Files:  src/assets/images/pet_image/*.png
Image Registry:        src/assets/images/pet-images.ts
Image Lookup:          src/assets/images/pokemon-map.ts
```

### How to Replace an Image (e.g., Charizard)

**Step 1:** Find the current image file:
```
src/assets/images/pet_image/charizard.png
```

**Step 2:** Replace the PNG with your new image:
- Keep the **same filename** (`charizard.png`)
- Recommended size: **256x256** or **512x512** pixels
- Format: **PNG with transparency**

**Step 3:** Done! The app will automatically use the new image.

### Image Naming Convention
- All **lowercase**: `charizard.png` (not `Charizard.png`)
- No spaces: use hyphens: `mr-mime.png`
- Forms/variants: `charizard-mega.png`, `pikachu-cosplay.png`

### Adding a New Pokemon Image

**Step 1:** Add the PNG file:
```
src/assets/images/pet_image/newpokemon.png
```

**Step 2:** Register it in `src/assets/images/pet-images.ts`:
```typescript
export const PetImages = {
  // ... existing entries ...
  newpokemon: require('./pet_image/newpokemon.png'),
}
```

**Step 3:** The `getPokemonImage()` function will automatically find it.

### How Image Lookup Works
The `getPokemonImage('Charizard')` function:
1. Converts to lowercase: `charizard`
2. Removes special characters
3. Looks up in `PetImages` object
4. Falls back to Bulbasaur if not found

---

## 2. Modifying Base Stats

### File Location
```
backend/src/config/species-stats.config.ts
```

### How Stats Work
```
Final Stat = (BaseStat + IV) × LevelMultiplier × RarityMultiplier

- BaseStat: What you define in config (30-100)
- IV: Random 0-15 added on capture
- LevelMultiplier: Increases with level
- RarityMultiplier: Common=1.0, Rare=1.1, Epic=1.2, Legendary=1.3
```

### Stat Ranges
| Category | HP | Attack | Defense | Speed |
|----------|-----|--------|---------|-------|
| Low | 30-45 | 30-45 | 30-45 | 30-45 |
| Medium | 50-65 | 50-65 | 50-65 | 50-65 |
| High | 70-85 | 70-85 | 70-85 | 70-85 |
| Very High | 90-100 | 90-100 | 90-100 | 90-100 |

### Example: Change Charizard's Stats

**Find the entry in `species-stats.config.ts`:**
```typescript
export const SPECIES_BASE_STATS: Record<string, SpeciesBaseStats> = {
  // ... 
  'Charizard': {
    hp: 78,      // ← Change this
    attack: 84,  // ← Change this
    defense: 78, // ← Change this
    speed: 100,  // ← Change this
  },
}
```

**Save and restart the backend.** New captures will use updated stats.

> ⚠️ **Note:** Existing Pokemon keep their old stats. Only newly caught/evolved Pokemon get new stats.

---

## 3. Modifying Evolution Requirements

### File Location
```
backend/src/config/evolution-chains.config.ts
```

### Example: Change Charmander Evolution Level

**Find the entry:**
```typescript
'Charmander': {
  canEvolve: true,
  evolutions: [
    { 
      evolvesTo: 'Charmeleon', 
      levelRequired: 16,           // ← Change level here
      itemRequired: EVOLUTION_STONES.FIRE_STONE,  // ← Change item here
      description: 'Use Fire Stone at level 16+' 
    }
  ],
  stage: 1,
  maxStage: 3,
  evolvesFrom: null,
},
```

### Available Evolution Stones
```typescript
EVOLUTION_STONES.FIRE_STONE     // 'fire-stone'
EVOLUTION_STONES.WATER_STONE    // 'water-stone'
EVOLUTION_STONES.THUNDER_STONE  // 'thunder-stone'
EVOLUTION_STONES.LEAF_STONE     // 'leaf-stone'
EVOLUTION_STONES.MOON_STONE     // 'moon-stone'
EVOLUTION_STONES.SUN_STONE      // 'sun-stone'
EVOLUTION_STONES.ICE_STONE      // 'ice-stone'
EVOLUTION_STONES.DUSK_STONE     // 'dusk-stone'
```

### Level-Only Evolution (No Item Required)
```typescript
evolutions: [
  { 
    evolvesTo: 'Charmeleon', 
    levelRequired: 16,
    itemRequired: null,  // ← No item needed
    description: 'Evolves at level 16' 
  }
],
```

---

## 4. Changing Evolution Target

### Change What Pokemon Evolves Into

**Example: Make Pikachu evolve into Jolteon instead of Raichu**

```typescript
'Pikachu': {
  canEvolve: true,
  evolutions: [
    { 
      evolvesTo: 'Jolteon',  // ← Changed from 'Raichu'
      levelRequired: 20, 
      itemRequired: EVOLUTION_STONES.THUNDER_STONE,
      description: 'Use Thunder Stone at level 20+' 
    }
  ],
  stage: 1,
  maxStage: 2,
  evolvesFrom: null,
},
```

### Adding Branching Evolution (Like Eevee)

**Example: Give Pikachu multiple evolution options**

```typescript
'Pikachu': {
  canEvolve: true,
  evolutions: [
    { 
      evolvesTo: 'Raichu', 
      levelRequired: 20, 
      itemRequired: EVOLUTION_STONES.THUNDER_STONE,
      description: 'Use Thunder Stone' 
    },
    { 
      evolvesTo: 'AlolaMon',  // New branching evolution
      levelRequired: 25, 
      itemRequired: EVOLUTION_STONES.ICE_STONE,
      description: 'Use Ice Stone' 
    },
  ],
  stage: 1,
  maxStage: 2,
  evolvesFrom: null,
},
```

---

## 5. Adding a Completely New Pokemon

### Step-by-Step Checklist

**Frontend:**
- [ ] Add image: `src/assets/images/pet_image/newpokemon.png`
- [ ] Register in `src/assets/images/pet-images.ts`

**Backend:**
- [ ] Add base stats in `backend/src/config/species-stats.config.ts`
- [ ] Add evolution data in `backend/src/config/evolution-chains.config.ts`
- [ ] Add to spawn tables if needed (region config)

### Example: Add "Flamefox" Pokemon

**1. Add Image:**
```
src/assets/images/pet_image/flamefox.png
```

**2. Register Image (`pet-images.ts`):**
```typescript
export const PetImages = {
  flamefox: require('./pet_image/flamefox.png'),
  // ...
}
```

**3. Add Base Stats (`species-stats.config.ts`):**
```typescript
'Flamefox': {
  hp: 55,
  attack: 75,
  defense: 45,
  speed: 85,
},
```

**4. Add Evolution Chain (`evolution-chains.config.ts`):**
```typescript
'Flamefox': {
  canEvolve: true,
  evolutions: [
    { 
      evolvesTo: 'Infernofox', 
      levelRequired: 32, 
      itemRequired: EVOLUTION_STONES.FIRE_STONE,
      description: 'Use Fire Stone at level 32+' 
    }
  ],
  stage: 1,
  maxStage: 2,
  evolvesFrom: null,
},
'Infernofox': {
  canEvolve: false,
  evolutions: [],
  stage: 2,
  maxStage: 2,
  evolvesFrom: 'Flamefox',
},
```

---

## 6. Image Display in App

### How Images Are Sized

All Pokemon images use `resizeMode="contain"` which ensures:
- ✅ Large images scale down to fit
- ✅ Aspect ratio is preserved
- ✅ No cropping or distortion
- ✅ Safe for any image size

### Image Sizes by Screen

| Screen | Image Size | Notes |
|--------|------------|-------|
| Pet Grid Card | 100×100 | Collection view |
| Encounter Modal | 150×150 | Wild Pokemon encounter |
| Battle Field | 130×130 | Battle screen |
| Pet Details | 200×200 | Full detail view |
| Evolution Preview | 60-80px | Evolution modal |

### Recommended Image Specs
- **Size:** 256×256 or 512×512 pixels
- **Format:** PNG with transparency
- **Background:** Transparent
- **Style:** Consistent art style with existing sprites

---

## 7. Common Tasks Quick Reference

### "I want to make Charizard stronger"
→ Edit `backend/src/config/species-stats.config.ts`, increase stats values

### "I want Charmander to evolve earlier"
→ Edit `backend/src/config/evolution-chains.config.ts`, lower `levelRequired`

### "I want to change Pikachu's image"
→ Replace `src/assets/images/pet_image/pikachu.png`

### "I want to add a new Pokemon"
→ Follow Section 5 checklist

### "I want Eevee to have a new evolution"
→ Add new entry to `evolutions` array in Eevee's config

---

## 8. Troubleshooting

### Image Not Showing
1. Check filename is lowercase: `charizard.png` not `Charizard.png`
2. Check file is in correct folder: `src/assets/images/pet_image/`
3. Check entry exists in `pet-images.ts`
4. Restart Metro bundler: `npx expo start -c`

### Evolution Not Working
1. Check species name matches exactly (case-sensitive in config)
2. Check item ID matches `EVOLUTION_STONES` constant
3. Check user has the required item in inventory
4. Restart backend after config changes

### Stats Not Updated
1. Remember: Existing Pokemon keep old stats
2. Only new catches/evolutions get updated stats
3. Restart backend after changes
