import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getSpeciesBaseStats,
  calculateFinalStat,
  getRarityMultiplier,
} from '../src/config/species-stats.config';
import {
  loadRegionsConfig,
  loadMovesConfig,
  loadItemsConfig,
  loadOpponentsConfig,
  loadQuestsConfig,
} from './config-loader';

const prisma = new PrismaClient();

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

  // ── Test User ───────────────────────────────────────────────────────────
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
      lastHuntTicketRegen: new Date(),
      lastBattleTicketRegen: new Date(),
      petCount: 2,
      itemCount: 5,
      battlesWon: 15,
      battlesLost: 5,
      huntsCompleted: 8,
    },
  });
  console.log('✅ Test user: test@vnpet.com / password123');

  // ── Moves (from moves.json) ─────────────────────────────────────────────
  const movesConfig = loadMovesConfig();
  await prisma.move.createMany({
    data: movesConfig.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      element: m.element,
      power: m.power,
      accuracy: m.accuracy,
      description: m.description,
    })),
  });
  console.log(`✅ Seeded ${movesConfig.length} moves from moves.json`);

  // ── Items (from items.json) ─────────────────────────────────────────────
  const itemsConfig = loadItemsConfig();
  await prisma.item.createMany({
    data: itemsConfig.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      type: i.type,
      rarity: i.rarity,
      effectHp: i.effectHp,
      effectAttack: i.effectAttack,
      effectDefense: i.effectDefense,
      effectSpeed: i.effectSpeed,
      effectXpBoost: i.effectXpBoost,
      teachesMove: i.teachesMove,
      priceCoins: i.priceCoins,
      priceGems: i.priceGems,
      imageUrl: i.imageUrl,
    })),
  });
  console.log(`✅ Seeded ${itemsConfig.length} items from items.json`);

  // ── Test User Starter Pets ──────────────────────────────────────────────
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

  await prisma.petMove.createMany({
    data: [
      { petId: starterPet1.id, moveId: 'thunder-shock', pp: 30, maxPp: 30 },
      { petId: starterPet1.id, moveId: 'thunderbolt', pp: 15, maxPp: 15 },
      { petId: starterPet1.id, moveId: 'quick-attack', pp: 30, maxPp: 30 },
      { petId: starterPet1.id, moveId: 'tackle', pp: 35, maxPp: 35 },
      { petId: starterPet2.id, moveId: 'ember', pp: 25, maxPp: 25 },
      { petId: starterPet2.id, moveId: 'flamethrower', pp: 15, maxPp: 15 },
      { petId: starterPet2.id, moveId: 'scratch', pp: 35, maxPp: 35 },
      { petId: starterPet2.id, moveId: 'tackle', pp: 35, maxPp: 35 },
    ],
  });
  console.log('✅ Test user starter pets with moves');

  // ── Regions (from regions.json) ─────────────────────────────────────────
  const regionsConfig = loadRegionsConfig();
  for (const r of regionsConfig) {
    await prisma.region.create({
      data: {
        id: r.id,
        name: r.name,
        description: r.description,
        difficulty: r.difficulty,
        energyCost: r.energyCost,
        coinsCost: r.coinsCost,
        imageUrl: r.imageUrl,
        unlockLevel: r.unlockLevel,
      },
    });
    if (r.spawns?.length) {
      await prisma.regionSpawn.createMany({
        data: r.spawns.map(s => ({
          regionId: r.id,
          species: s.species,
          spawnRate: s.spawnRate,
          rarity: s.rarity,
          minLevel: s.minLevel,
          maxLevel: s.maxLevel,
        })),
      });
    }
  }
  console.log(`✅ Seeded ${regionsConfig.length} regions from regions.json`);

  // ── Opponents (from opponents.json) ─────────────────────────────────────
  // Stats are calculated from species base stats using the game formula
  const opponentsConfig = loadOpponentsConfig();
  for (const opp of opponentsConfig) {
    const avgIv = 7;
    const ivs = { ivHp: avgIv, ivAttack: avgIv, ivDefense: avgIv, ivSpeed: avgIv };
    const stats = calculatePetStats(opp.species, opp.level, opp.rarity, ivs);

    const opponent = await prisma.opponent.create({
      data: {
        id: opp.id,
        name: opp.name,
        species: opp.species,
        level: opp.level,
        difficulty: opp.difficulty,
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        rewardXp: opp.rewardXp,
        rewardCoins: opp.rewardCoins,
        unlockLevel: opp.unlockLevel,
        imageUrl: opp.imageUrl,
      },
    });

    if (opp.moves?.length) {
      await prisma.opponentMove.createMany({
        data: opp.moves.map(moveId => ({
          opponentId: opponent.id,
          moveId,
        })),
      });
    }
  }
  console.log(`✅ Seeded ${opponentsConfig.length} opponents from opponents.json (stats calculated from formula)`);

  // ── Quest Templates (from quests.json) ──────────────────────────────────
  const questsConfig = loadQuestsConfig();
  await prisma.questTemplate.createMany({
    data: questsConfig.map(q => ({
      id: q.id,
      name: q.name,
      description: q.description,
      type: q.type,
      category: q.category,
      targetType: q.targetType,
      targetCount: q.targetCount,
      targetRarity: q.targetRarity,
      rewardCoins: q.rewardCoins,
      rewardGems: q.rewardGems,
      rewardXp: q.rewardXp,
      rewardHuntTickets: q.rewardHuntTickets ?? 0,
      rewardBattleTickets: q.rewardBattleTickets ?? 0,
      difficulty: q.difficulty,
      sortOrder: q.sortOrder,
    })),
  });
  console.log(`✅ Seeded ${questsConfig.length} quests from quests.json`);

  // ── Sample Events ───────────────────────────────────────────────────────
  const now = new Date();
  const eventEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.event.create({
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
          { species: 'Pikachu', rarity: 'Rare', spawnRate: 0.25, minLevel: 5, maxLevel: 20, isGuaranteed: false },
          { species: 'Pichu', rarity: 'Epic', spawnRate: 0.1, minLevel: 1, maxLevel: 10, isGuaranteed: false },
        ],
      },
    },
  });

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
      config: { xpMultiplier: 2 },
    },
  });
  console.log('✅ Seeded sample events');

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
