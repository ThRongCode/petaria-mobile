import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getSpeciesBaseStats,
  calculateFinalStat,
  getRarityMultiplier,
} from '../src/config/species-stats.config';
import { loadRegionsConfig } from './config-loader';

const prisma = new PrismaClient();

// Helper to calculate stats for seeded pets
function calculatePetStats(
  species: string,
  level: number,
  rarity: string,
  ivs: { ivHp: number; ivAttack: number; ivDefense: number; ivSpeed: number },
) {
  const baseStats = getSpeciesBaseStats(species);
  const rarityMult = getRarityMultiplier(rarity);
  
  return {
    maxHp: calculateFinalStat(baseStats.hp, ivs.ivHp, level, rarityMult),
    attack: calculateFinalStat(baseStats.attack, ivs.ivAttack, level, rarityMult),
    defense: calculateFinalStat(baseStats.defense, ivs.ivDefense, level, rarityMult),
    speed: calculateFinalStat(baseStats.speed, ivs.ivSpeed, level, rarityMult),
  };
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.eventSpawn.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userQuest.deleteMany();
  await prisma.questTemplate.deleteMany();
  await prisma.opponentMove.deleteMany();
  await prisma.petMove.deleteMany();
  await prisma.favoritePet.deleteMany();
  await prisma.userItem.deleteMany();
  await prisma.hunt.deleteMany();
  await prisma.huntSession.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.battleSession.deleteMany();
  await prisma.regionSpawn.deleteMany();
  await prisma.region.deleteMany();
  await prisma.opponent.deleteMany();
  await prisma.move.deleteMany();
  await prisma.item.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Seed Test User
  const passwordHash = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      id: 'test-user-1',
      email: 'test@vnpet.com',
      username: 'TestTrainer',
      passwordHash,
      level: 10,
      xp: 500,
      coins: 5000,
      gems: 100,
      huntTickets: 5,
      battleTickets: 20,
      lastTicketReset: new Date(),
      petCount: 2,
      itemCount: 5,
      battlesWon: 15,
      battlesLost: 5,
      huntsCompleted: 8,
    },
  });
  console.log('✅ Seeded test user: test@vnpet.com / password123');

  // Seed Items
  const items = await prisma.item.createMany({
    data: [
      // Healing Items
      {
        id: 'potion',
        name: 'Potion',
        description: 'Restores 20 HP to a pet',
        type: 'Consumable',
        rarity: 'common',
        effectHp: 20,
        priceCoins: 50,
        imageUrl: '/items/potion.png',
      },
      {
        id: 'super-potion',
        name: 'Super Potion',
        description: 'Restores 50 HP to a pet',
        type: 'Consumable',
        rarity: 'uncommon',
        effectHp: 50,
        priceCoins: 150,
        imageUrl: '/items/super-potion.png',
      },
      {
        id: 'hyper-potion',
        name: 'Hyper Potion',
        description: 'Restores 100 HP to a pet',
        type: 'Consumable',
        rarity: 'rare',
        effectHp: 100,
        priceCoins: 300,
        imageUrl: '/items/hyper-potion.png',
      },
      {
        id: 'max-potion',
        name: 'Max Potion',
        description: 'Fully restores HP to a pet',
        type: 'Consumable',
        rarity: 'epic',
        effectHp: 200,
        priceCoins: 500,
        imageUrl: '/items/max-potion.png',
      },

      // Battle Boost Items
      {
        id: 'attack-boost',
        name: 'Attack Boost',
        description: 'Increases attack by 10 for one battle',
        type: 'StatBoost',
        rarity: 'uncommon',
        effectAttack: 10,
        priceCoins: 200,
        imageUrl: '/items/attack-boost.png',
      },
      {
        id: 'defense-boost',
        name: 'Defense Boost',
        description: 'Increases defense by 10 for one battle',
        type: 'StatBoost',
        rarity: 'uncommon',
        effectDefense: 10,
        priceCoins: 200,
        imageUrl: '/items/defense-boost.png',
      },
      {
        id: 'speed-boost',
        name: 'Speed Boost',
        description: 'Increases speed by 10 for one battle',
        type: 'StatBoost',
        rarity: 'uncommon',
        effectSpeed: 10,
        priceCoins: 200,
        imageUrl: '/items/speed-boost.png',
      },

      // Evolution Items
      {
        id: 'evolution-stone',
        name: 'Evolution Stone',
        description: 'Triggers evolution in certain pets',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 800,
        priceGems: 10,
        imageUrl: '/items/evolution-stone.png',
      },
      {
        id: 'rare-candy',
        name: 'Rare Candy',
        description: 'Instantly increases pet level by 1',
        type: 'Evolution',
        rarity: 'epic',
        effectXpBoost: 100,
        priceGems: 20,
        imageUrl: '/items/rare-candy.png',
      },

      // Evolution Stones
      {
        id: 'fire-stone',
        name: 'Fire Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It has a fiery orange color.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/fire-stone.png',
      },
      {
        id: 'water-stone',
        name: 'Water Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It has a deep blue color.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/water-stone.png',
      },
      {
        id: 'thunder-stone',
        name: 'Thunder Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It has a yellow color with lightning patterns.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/thunder-stone.png',
      },
      {
        id: 'leaf-stone',
        name: 'Leaf Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It has a verdant green color.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/leaf-stone.png',
      },
      {
        id: 'moon-stone',
        name: 'Moon Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It glows softly with moonlight.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/moon-stone.png',
      },
      {
        id: 'sun-stone',
        name: 'Sun Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It radiates warmth like sunlight.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/sun-stone.png',
      },
      {
        id: 'ice-stone',
        name: 'Ice Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It is cold to the touch.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/ice-stone.png',
      },
      {
        id: 'dusk-stone',
        name: 'Dusk Stone',
        description: 'A peculiar stone that makes certain species of Pokemon evolve. It holds shadows within.',
        type: 'Evolution',
        rarity: 'rare',
        priceCoins: 1000,
        priceGems: 15,
        imageUrl: '/items/dusk-stone.png',
      },

      // Cosmetic Items
      {
        id: 'pet-shampoo',
        name: 'Pet Shampoo',
        description: 'Makes your pet sparkle',
        type: 'Cosmetic',
        rarity: 'common',
        priceCoins: 30,
        imageUrl: '/items/shampoo.png',
      },

      // Pokeballs
      {
        id: 'pokeball',
        name: 'Pokeball',
        description: 'A standard device for catching wild Pokemon. Has a moderate catch rate.',
        type: 'Pokeball',
        rarity: 'common',
        priceCoins: 100,
        imageUrl: '/items/pokeball.png',
      },
      {
        id: 'great-ball',
        name: 'Great Ball',
        description: 'An improved Pokeball with a higher catch rate than a standard Pokeball.',
        type: 'Pokeball',
        rarity: 'uncommon',
        priceCoins: 300,
        imageUrl: '/items/great-ball.png',
      },
      {
        id: 'ultra-ball',
        name: 'Ultra Ball',
        description: 'A high-performance Pokeball with an excellent catch rate.',
        type: 'Pokeball',
        rarity: 'rare',
        priceCoins: 800,
        imageUrl: '/items/ultra-ball.png',
      },
    ],
  });
  console.log('✅ Seeded items');

  // Seed Moves
  const moves = await prisma.move.createMany({
    data: [
      // Normal Type Moves
      {
        id: 'tackle',
        name: 'Tackle',
        type: 'Physical',
        element: 'normal',
        power: 40,
        accuracy: 100,
        description: 'A physical attack',
      },
      {
        id: 'scratch',
        name: 'Scratch',
        type: 'Physical',
        element: 'normal',
        power: 40,
        accuracy: 100,
        description: 'Scratches with sharp claws',
      },
      {
        id: 'quick-attack',
        name: 'Quick Attack',
        type: 'Physical',
        element: 'normal',
        power: 40,
        accuracy: 100,
        description: 'Always strikes first',
      },
      {
        id: 'body-slam',
        name: 'Body Slam',
        type: 'Physical',
        element: 'normal',
        power: 85,
        accuracy: 100,
        description: 'Full-body charge attack',
      },

      // Fire Type Moves
      {
        id: 'ember',
        name: 'Ember',
        type: 'Special',
        element: 'fire',
        power: 40,
        accuracy: 100,
        description: 'Small flames attack',
      },
      {
        id: 'flame-burst',
        name: 'Flame Burst',
        type: 'Special',
        element: 'fire',
        power: 70,
        accuracy: 100,
        description: 'Exploding flames',
      },
      {
        id: 'flamethrower',
        name: 'Flamethrower',
        type: 'Special',
        element: 'fire',
        power: 90,
        accuracy: 100,
        description: 'Intense flame blast',
      },
      {
        id: 'fire-blast',
        name: 'Fire Blast',
        type: 'Special',
        element: 'fire',
        power: 110,
        accuracy: 85,
        description: 'Massive fire explosion',
      },

      // Water Type Moves
      {
        id: 'water-gun',
        name: 'Water Gun',
        type: 'Special',
        element: 'water',
        power: 40,
        accuracy: 100,
        description: 'Squirts water',
      },
      {
        id: 'bubble-beam',
        name: 'Bubble Beam',
        type: 'Special',
        element: 'water',
        power: 65,
        accuracy: 100,
        description: 'Forceful bubble stream',
      },
      {
        id: 'surf',
        name: 'Surf',
        type: 'Special',
        element: 'water',
        power: 90,
        accuracy: 100,
        description: 'Giant wave attack',
      },
      {
        id: 'hydro-pump',
        name: 'Hydro Pump',
        type: 'Special',
        element: 'water',
        power: 110,
        accuracy: 80,
        description: 'Powerful water blast',
      },

      // Grass Type Moves
      {
        id: 'vine-whip',
        name: 'Vine Whip',
        type: 'Physical',
        element: 'grass',
        power: 45,
        accuracy: 100,
        description: 'Strikes with vines',
      },
      {
        id: 'razor-leaf',
        name: 'Razor Leaf',
        type: 'Physical',
        element: 'grass',
        power: 55,
        accuracy: 95,
        description: 'Sharp-edged leaves',
      },
      {
        id: 'solar-beam',
        name: 'Solar Beam',
        type: 'Special',
        element: 'grass',
        power: 120,
        accuracy: 100,
        description: 'Charges then fires beam',
      },

      // Electric Type Moves
      {
        id: 'thunder-shock',
        name: 'Thunder Shock',
        type: 'Special',
        element: 'electric',
        power: 40,
        accuracy: 100,
        description: 'Electric jolt',
      },
      {
        id: 'thunderbolt',
        name: 'Thunderbolt',
        type: 'Special',
        element: 'electric',
        power: 90,
        accuracy: 100,
        description: 'Strong electric blast',
      },
      {
        id: 'thunder',
        name: 'Thunder',
        type: 'Special',
        element: 'electric',
        power: 110,
        accuracy: 70,
        description: 'Massive lightning strike',
      },
    ],
  });
  console.log('✅ Seeded moves');

  // Seed Test User's Starter Pets (with IVs and calculated stats)
  const pikachu = {
    species: 'Pikachu',
    level: 15,
    rarity: 'rare',
    ivs: { ivHp: 12, ivAttack: 10, ivDefense: 8, ivSpeed: 14 },
  };
  const pikachuStats = calculatePetStats(pikachu.species, pikachu.level, pikachu.rarity, pikachu.ivs);

  const starterPet1 = await prisma.pet.create({
    data: {
      id: 'test-pet-1',
      ownerId: testUser.id,
      species: pikachu.species,
      nickname: 'Sparky',
      level: pikachu.level,
      xp: 200,
      rarity: pikachu.rarity,
      hp: pikachuStats.maxHp,
      maxHp: pikachuStats.maxHp,
      attack: pikachuStats.attack,
      defense: pikachuStats.defense,
      speed: pikachuStats.speed,
      ivHp: pikachu.ivs.ivHp,
      ivAttack: pikachu.ivs.ivAttack,
      ivDefense: pikachu.ivs.ivDefense,
      ivSpeed: pikachu.ivs.ivSpeed,
      mood: 80,
      evolutionStage: 1,
    },
  });

  const charmander = {
    species: 'Charmander',
    level: 12,
    rarity: 'rare',
    ivs: { ivHp: 9, ivAttack: 13, ivDefense: 7, ivSpeed: 11 },
  };
  const charmanderStats = calculatePetStats(charmander.species, charmander.level, charmander.rarity, charmander.ivs);

  const starterPet2 = await prisma.pet.create({
    data: {
      id: 'test-pet-2',
      ownerId: testUser.id,
      species: charmander.species,
      nickname: 'Blaze',
      level: charmander.level,
      xp: 150,
      rarity: charmander.rarity,
      hp: charmanderStats.maxHp,
      maxHp: charmanderStats.maxHp,
      attack: charmanderStats.attack,
      defense: charmanderStats.defense,
      speed: charmanderStats.speed,
      ivHp: charmander.ivs.ivHp,
      ivAttack: charmander.ivs.ivAttack,
      ivDefense: charmander.ivs.ivDefense,
      ivSpeed: charmander.ivs.ivSpeed,
      mood: 75,
      evolutionStage: 1,
    },
  });

  // Add moves to starter pets
  await prisma.petMove.createMany({
    data: [
      // Pikachu moves
      { petId: starterPet1.id, moveId: 'thunder-shock', pp: 40, maxPp: 40 },
      { petId: starterPet1.id, moveId: 'thunderbolt', pp: 90, maxPp: 90 },
      { petId: starterPet1.id, moveId: 'quick-attack', pp: 40, maxPp: 40 },
      { petId: starterPet1.id, moveId: 'tackle', pp: 40, maxPp: 40 },
      // Charmander moves
      { petId: starterPet2.id, moveId: 'ember', pp: 40, maxPp: 40 },
      { petId: starterPet2.id, moveId: 'flamethrower', pp: 90, maxPp: 90 },
      { petId: starterPet2.id, moveId: 'scratch', pp: 35, maxPp: 35 },
      { petId: starterPet2.id, moveId: 'tackle', pp: 40, maxPp: 40 },
    ],
  });
  console.log('✅ Seeded test user starter pets');

  // Seed Regions from JSON config
  const regionsConfig = loadRegionsConfig();
  console.log(`📦 Loading ${regionsConfig.length} regions from config...`);

  for (const regionConfig of regionsConfig) {
    // Create region
    await prisma.region.create({
      data: {
        id: regionConfig.id,
        name: regionConfig.name,
        description: regionConfig.description,
        difficulty: regionConfig.difficulty,
        energyCost: regionConfig.energyCost,
        coinsCost: regionConfig.coinsCost,
        imageUrl: regionConfig.imageUrl,
        unlockLevel: regionConfig.unlockLevel,
      },
    });

    // Create spawns for this region
    if (regionConfig.spawns && regionConfig.spawns.length > 0) {
      await prisma.regionSpawn.createMany({
        data: regionConfig.spawns.map(spawn => ({
          regionId: regionConfig.id,
          species: spawn.species,
          spawnRate: spawn.spawnRate,
          rarity: spawn.rarity,
          minLevel: spawn.minLevel,
          maxLevel: spawn.maxLevel,
        })),
      });
    }
  }

  console.log('✅ Seeded regions and spawns from JSON config');

  // Seed Opponents
  const opponent1 = await prisma.opponent.create({
    data: {
      id: 'rookie-trainer',
      name: 'Rookie Trainer',
      species: 'Rattata',
      level: 5,
      difficulty: 'easy',
      hp: 60,
      maxHp: 60,
      attack: 15,
      defense: 12,
      speed: 10,
      rewardXp: 100,
      rewardCoins: 50,
      unlockLevel: 1,
      imageUrl: '/opponents/rookie.png',
    },
  });

  const opponent2 = await prisma.opponent.create({
    data: {
      id: 'forest-ranger',
      name: 'Forest Ranger',
      species: 'Oddish',
      level: 8,
      difficulty: 'medium',
      hp: 80,
      maxHp: 80,
      attack: 25,
      defense: 20,
      speed: 18,
      rewardXp: 300,
      rewardCoins: 150,
      unlockLevel: 5,
      imageUrl: '/opponents/ranger.png',
    },
  });

  const opponent3 = await prisma.opponent.create({
    data: {
      id: 'fire-master',
      name: 'Fire Master',
      species: 'Charizard',
      level: 15,
      difficulty: 'hard',
      hp: 120,
      maxHp: 120,
      attack: 45,
      defense: 35,
      speed: 40,
      rewardXp: 800,
      rewardCoins: 400,
      unlockLevel: 10,
      imageUrl: '/opponents/fire-master.png',
    },
  });

  const opponent4 = await prisma.opponent.create({
    data: {
      id: 'water-sage',
      name: 'Water Sage',
      species: 'Blastoise',
      level: 15,
      difficulty: 'hard',
      hp: 130,
      maxHp: 130,
      attack: 40,
      defense: 40,
      speed: 35,
      rewardXp: 800,
      rewardCoins: 400,
      unlockLevel: 10,
      imageUrl: '/opponents/water-sage.png',
    },
  });

  const opponent5 = await prisma.opponent.create({
    data: {
      id: 'champion',
      name: 'Elite Champion',
      species: 'Dragonite',
      level: 25,
      difficulty: 'legendary',
      hp: 200,
      maxHp: 200,
      attack: 70,
      defense: 60,
      speed: 65,
      rewardXp: 2000,
      rewardCoins: 1000,
      unlockLevel: 20,
      imageUrl: '/opponents/champion.png',
    },
  });

  console.log('✅ Seeded opponents');

  // Seed Opponent Moves
  await prisma.opponentMove.createMany({
    data: [
      // Rookie Trainer moves
      { opponentId: opponent1.id, moveId: 'tackle' },
      { opponentId: opponent1.id, moveId: 'scratch' },

      // Forest Ranger moves
      { opponentId: opponent2.id, moveId: 'vine-whip' },
      { opponentId: opponent2.id, moveId: 'razor-leaf' },

      // Fire Master moves
      { opponentId: opponent3.id, moveId: 'flamethrower' },
      { opponentId: opponent3.id, moveId: 'fire-blast' },
      { opponentId: opponent3.id, moveId: 'quick-attack' },

      // Water Sage moves
      { opponentId: opponent4.id, moveId: 'surf' },
      { opponentId: opponent4.id, moveId: 'hydro-pump' },
      { opponentId: opponent4.id, moveId: 'bubble-beam' },

      // Champion moves
      { opponentId: opponent5.id, moveId: 'fire-blast' },
      { opponentId: opponent5.id, moveId: 'solar-beam' },
      { opponentId: opponent5.id, moveId: 'thunder' },
      { opponentId: opponent5.id, moveId: 'body-slam' },
    ],
  });
  console.log('✅ Seeded opponent moves');

  // ==================== SEED QUEST TEMPLATES ====================
  await prisma.questTemplate.createMany({
    data: [
      // Daily Quests - Hunt Category
      {
        id: 'daily-catch-3',
        name: 'Catch 3 Pokemon',
        description: 'Catch any 3 Pokemon in the wild',
        type: 'daily',
        category: 'hunt',
        targetType: 'catch_pokemon',
        targetCount: 3,
        rewardCoins: 100,
        rewardXp: 50,
        difficulty: 'easy',
        sortOrder: 1,
      },
      {
        id: 'daily-catch-5',
        name: 'Pokemon Hunter',
        description: 'Catch 5 Pokemon today',
        type: 'daily',
        category: 'hunt',
        targetType: 'catch_pokemon',
        targetCount: 5,
        rewardCoins: 200,
        rewardXp: 100,
        difficulty: 'normal',
        sortOrder: 2,
      },
      {
        id: 'daily-catch-rare',
        name: 'Rare Find',
        description: 'Catch a Rare or better Pokemon',
        type: 'daily',
        category: 'hunt',
        targetType: 'catch_rarity',
        targetCount: 1,
        targetRarity: 'Rare',
        rewardCoins: 300,
        rewardGems: 5,
        rewardXp: 150,
        difficulty: 'hard',
        sortOrder: 3,
      },
      {
        id: 'daily-hunts-3',
        name: 'Explorer',
        description: 'Complete 3 hunts in any region',
        type: 'daily',
        category: 'hunt',
        targetType: 'complete_hunts',
        targetCount: 3,
        rewardCoins: 150,
        rewardXp: 75,
        difficulty: 'easy',
        sortOrder: 4,
      },

      // Daily Quests - Battle Category
      {
        id: 'daily-win-3',
        name: 'Battle Beginner',
        description: 'Win 3 battles',
        type: 'daily',
        category: 'battle',
        targetType: 'win_battles',
        targetCount: 3,
        rewardCoins: 150,
        rewardXp: 75,
        difficulty: 'easy',
        sortOrder: 5,
      },
      {
        id: 'daily-win-5',
        name: 'Battle Champion',
        description: 'Win 5 battles today',
        type: 'daily',
        category: 'battle',
        targetType: 'win_battles',
        targetCount: 5,
        rewardCoins: 300,
        rewardXp: 150,
        difficulty: 'normal',
        sortOrder: 6,
      },

      // Daily Quests - Care Category
      {
        id: 'daily-feed-3',
        name: 'Pet Caretaker',
        description: 'Feed your pets 3 times',
        type: 'daily',
        category: 'care',
        targetType: 'feed_pet',
        targetCount: 3,
        rewardCoins: 100,
        rewardXp: 50,
        difficulty: 'easy',
        sortOrder: 7,
      },
      {
        id: 'daily-use-item',
        name: 'Item User',
        description: 'Use 2 items on your pets',
        type: 'daily',
        category: 'care',
        targetType: 'use_item',
        targetCount: 2,
        rewardCoins: 100,
        rewardXp: 50,
        difficulty: 'easy',
        sortOrder: 8,
      },

      // Daily Quests - Evolution
      {
        id: 'daily-evolve-1',
        name: 'Evolution Master',
        description: 'Evolve a Pokemon',
        type: 'daily',
        category: 'evolution',
        targetType: 'evolve_pet',
        targetCount: 1,
        rewardCoins: 500,
        rewardGems: 10,
        rewardXp: 200,
        difficulty: 'hard',
        sortOrder: 9,
      },

      // Daily Quests - Shopping
      {
        id: 'daily-buy-item',
        name: 'Shopper',
        description: 'Buy 1 item from the shop',
        type: 'daily',
        category: 'shop',
        targetType: 'buy_item',
        targetCount: 1,
        rewardCoins: 50,
        rewardXp: 25,
        difficulty: 'easy',
        sortOrder: 10,
      },

      // Weekly Quests (assigned manually or with special logic)
      {
        id: 'weekly-catch-20',
        name: 'Weekly Collector',
        description: 'Catch 20 Pokemon this week',
        type: 'weekly',
        category: 'hunt',
        targetType: 'catch_pokemon',
        targetCount: 20,
        rewardCoins: 1000,
        rewardGems: 20,
        rewardXp: 500,
        difficulty: 'normal',
        sortOrder: 100,
      },
      {
        id: 'weekly-battles-15',
        name: 'Weekly Warrior',
        description: 'Win 15 battles this week',
        type: 'weekly',
        category: 'battle',
        targetType: 'win_battles',
        targetCount: 15,
        rewardCoins: 800,
        rewardGems: 15,
        rewardXp: 400,
        difficulty: 'normal',
        sortOrder: 101,
      },
    ],
  });
  console.log('✅ Seeded quest templates');

  // ==================== SEED SAMPLE EVENTS ====================
  // Create a sample event that starts now and lasts 7 days
  const now = new Date();
  const eventEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const sampleEvent = await prisma.event.create({
    data: {
      name: 'Pikachu Festival',
      description: 'Pikachu are appearing more frequently! Catch them while you can!',
      type: 'rare_spawn',
      startTime: now,
      endTime: eventEnd,
      isActive: true,
      bannerUrl: '/events/pikachu-festival.png',
      priority: 10,
      config: {
        spawnBonus: 0.3,
        xpMultiplier: 1.5,
        featuredSpecies: ['Pikachu', 'Pichu', 'Raichu'],
      },
      eventSpawns: {
        create: [
          {
            species: 'Pikachu',
            rarity: 'Rare',
            spawnRate: 0.25, // 25% spawn rate during event
            minLevel: 5,
            maxLevel: 20,
            isGuaranteed: false,
          },
          {
            species: 'Pichu',
            rarity: 'Epic',
            spawnRate: 0.1, // 10% spawn rate during event
            minLevel: 1,
            maxLevel: 10,
            isGuaranteed: false,
          },
        ],
      },
    },
  });
  console.log('✅ Seeded sample event: Pikachu Festival');

  // Create a future event
  const futureStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureEnd = new Date(futureStart.getTime() + 5 * 24 * 60 * 60 * 1000);

  await prisma.event.create({
    data: {
      name: 'Double XP Weekend',
      description: 'Earn double XP from all battles and catches!',
      type: 'double_xp',
      startTime: futureStart,
      endTime: futureEnd,
      isActive: true,
      bannerUrl: '/events/double-xp.png',
      priority: 5,
      config: {
        xpMultiplier: 2,
      },
    },
  });
  console.log('✅ Seeded upcoming event: Double XP Weekend');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
