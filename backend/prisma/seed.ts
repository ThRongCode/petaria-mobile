import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.opponentMove.deleteMany();
  await prisma.petMove.deleteMany();
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

  // Seed Test User's Starter Pets
  const starterPet1 = await prisma.pet.create({
    data: {
      id: 'test-pet-1',
      ownerId: testUser.id,
      species: 'Pikachu',
      nickname: 'Sparky',
      level: 15,
      xp: 200,
      rarity: 'rare',
      hp: 80,
      maxHp: 80,
      attack: 55,
      defense: 40,
      speed: 90,
      mood: 80,
      evolutionStage: 1,
    },
  });

  const starterPet2 = await prisma.pet.create({
    data: {
      id: 'test-pet-2',
      ownerId: testUser.id,
      species: 'Charmander',
      nickname: 'Blaze',
      level: 12,
      xp: 150,
      rarity: 'rare',
      hp: 70,
      maxHp: 70,
      attack: 52,
      defense: 43,
      speed: 65,
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

  // Seed Regions
  const region1 = await prisma.region.create({
    data: {
      id: 'meadow-valley',
      name: 'Meadow Valley',
      description: 'A peaceful valley with gentle creatures',
      difficulty: 'easy',
      energyCost: 5,
      coinsCost: 0,
      imageUrl: '/regions/meadow-valley.png',
      unlockLevel: 1,
    },
  });

  const region2 = await prisma.region.create({
    data: {
      id: 'forest-grove',
      name: 'Forest Grove',
      description: 'Dense forest with grass-type pets',
      difficulty: 'medium',
      energyCost: 8,
      coinsCost: 100,
      imageUrl: '/regions/forest-grove.png',
      unlockLevel: 5,
    },
  });

  const region3 = await prisma.region.create({
    data: {
      id: 'volcanic-peak',
      name: 'Volcanic Peak',
      description: 'Hot mountain with fire-type pets',
      difficulty: 'hard',
      energyCost: 10,
      coinsCost: 300,
      imageUrl: '/regions/volcanic-peak.png',
      unlockLevel: 10,
    },
  });

  const region4 = await prisma.region.create({
    data: {
      id: 'crystal-lake',
      name: 'Crystal Lake',
      description: 'Serene lake with water-type pets',
      difficulty: 'hard',
      energyCost: 10,
      coinsCost: 300,
      imageUrl: '/regions/crystal-lake.png',
      unlockLevel: 10,
    },
  });

  const region5 = await prisma.region.create({
    data: {
      id: 'thunder-plains',
      name: 'Thunder Plains',
      description: 'Stormy plains with electric-type pets',
      difficulty: 'expert',
      energyCost: 12,
      coinsCost: 500,
      imageUrl: '/regions/thunder-plains.png',
      unlockLevel: 15,
    },
  });

  console.log('✅ Seeded regions');

  // Seed Region Spawns (Define what pets spawn in each region)
  await prisma.regionSpawn.createMany({
    data: [
      // Meadow Valley spawns (Level 1-10)
      { regionId: region1.id, species: 'Fluffbit', spawnRate: 30, rarity: 'common', minLevel: 1, maxLevel: 5 },
      { regionId: region1.id, species: 'Hoplet', spawnRate: 25, rarity: 'common', minLevel: 2, maxLevel: 6 },
      { regionId: region1.id, species: 'Chirpie', spawnRate: 20, rarity: 'common', minLevel: 3, maxLevel: 7 },
      { regionId: region1.id, species: 'Sparkpup', spawnRate: 15, rarity: 'uncommon', minLevel: 4, maxLevel: 8 },
      { regionId: region1.id, species: 'Leafling', spawnRate: 8, rarity: 'uncommon', minLevel: 5, maxLevel: 10 },
      { regionId: region1.id, species: 'Shinybit', spawnRate: 2, rarity: 'rare', minLevel: 8, maxLevel: 10 },

      // Forest Grove spawns (Level 8-15)
      { regionId: region2.id, species: 'Leafling', spawnRate: 30, rarity: 'common', minLevel: 8, maxLevel: 12 },
      { regionId: region2.id, species: 'Vinelet', spawnRate: 25, rarity: 'common', minLevel: 9, maxLevel: 13 },
      { regionId: region2.id, species: 'Mossbug', spawnRate: 20, rarity: 'uncommon', minLevel: 10, maxLevel: 14 },
      { regionId: region2.id, species: 'Thornback', spawnRate: 15, rarity: 'uncommon', minLevel: 11, maxLevel: 15 },
      { regionId: region2.id, species: 'Bloomtail', spawnRate: 8, rarity: 'rare', minLevel: 12, maxLevel: 15 },
      { regionId: region2.id, species: 'Ancient Oak', spawnRate: 2, rarity: 'epic', minLevel: 14, maxLevel: 15 },

      // Volcanic Peak spawns (Level 12-20)
      { regionId: region3.id, species: 'Emberpup', spawnRate: 30, rarity: 'common', minLevel: 12, maxLevel: 15 },
      { regionId: region3.id, species: 'Flameling', spawnRate: 25, rarity: 'common', minLevel: 13, maxLevel: 16 },
      { regionId: region3.id, species: 'Lavabeast', spawnRate: 20, rarity: 'uncommon', minLevel: 14, maxLevel: 17 },
      { regionId: region3.id, species: 'Scorchclaw', spawnRate: 15, rarity: 'uncommon', minLevel: 15, maxLevel: 18 },
      { regionId: region3.id, species: 'Infernowolf', spawnRate: 8, rarity: 'rare', minLevel: 17, maxLevel: 20 },
      { regionId: region3.id, species: 'Phoenix', spawnRate: 2, rarity: 'legendary', minLevel: 19, maxLevel: 20 },

      // Crystal Lake spawns (Level 12-20)
      { regionId: region4.id, species: 'Splashfin', spawnRate: 30, rarity: 'common', minLevel: 12, maxLevel: 15 },
      { regionId: region4.id, species: 'Bubbler', spawnRate: 25, rarity: 'common', minLevel: 13, maxLevel: 16 },
      { regionId: region4.id, species: 'Tidecrab', spawnRate: 20, rarity: 'uncommon', minLevel: 14, maxLevel: 17 },
      { regionId: region4.id, species: 'Aquashell', spawnRate: 15, rarity: 'uncommon', minLevel: 15, maxLevel: 18 },
      { regionId: region4.id, species: 'Waveserpent', spawnRate: 8, rarity: 'rare', minLevel: 17, maxLevel: 20 },
      { regionId: region4.id, species: 'Leviathan', spawnRate: 2, rarity: 'legendary', minLevel: 19, maxLevel: 20 },

      // Thunder Plains spawns (Level 15-25)
      { regionId: region5.id, species: 'Sparkpup', spawnRate: 30, rarity: 'common', minLevel: 15, maxLevel: 18 },
      { regionId: region5.id, species: 'Voltmouse', spawnRate: 25, rarity: 'common', minLevel: 16, maxLevel: 19 },
      { regionId: region5.id, species: 'Zapperbolt', spawnRate: 20, rarity: 'uncommon', minLevel: 17, maxLevel: 20 },
      { regionId: region5.id, species: 'Thunderwing', spawnRate: 15, rarity: 'uncommon', minLevel: 19, maxLevel: 22 },
      { regionId: region5.id, species: 'Stormdrake', spawnRate: 8, rarity: 'rare', minLevel: 21, maxLevel: 24 },
      { regionId: region5.id, species: 'Zeus Beast', spawnRate: 2, rarity: 'legendary', minLevel: 23, maxLevel: 25 },
    ],
  });
  console.log('✅ Seeded region spawns');

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
