import { 
  Pet, 
  Item, 
  Region, 
  UserProfile, 
  UserInventory, 
  Battle, 
  Auction, 
  GameNotification,
  Currency
} from '../types/game'

export const generateDummyData = () => {
  // Pet species data
  const petSpecies = [
    { name: 'Fluffball', baseStats: { hp: 50, attack: 25, defense: 20, speed: 30 } },
    { name: 'Rockpup', baseStats: { hp: 70, attack: 30, defense: 35, speed: 15 } },
    { name: 'Sparkwing', baseStats: { hp: 40, attack: 35, defense: 15, speed: 45 } },
    { name: 'Aquafin', baseStats: { hp: 60, attack: 28, defense: 25, speed: 35 } },
    { name: 'Flamecrest', baseStats: { hp: 55, attack: 40, defense: 20, speed: 40 } },
    { name: 'Shadowpaw', baseStats: { hp: 45, attack: 45, defense: 18, speed: 50 } },
    { name: 'Ironback', baseStats: { hp: 80, attack: 35, defense: 45, speed: 10 } },
    { name: 'Windwhisper', baseStats: { hp: 35, attack: 30, defense: 15, speed: 60 } },
  ]

  // Generate user profile
  const profile: UserProfile = {
    id: 'user-001',
    username: 'VnPetTrainer',
    email: 'trainer@vnpet.com',
    avatar: 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=VT',
    level: 15,
    xp: 2840,
    xpToNext: 3200,
    currency: {
      coins: 15750,
      gems: 245,
    },
    stats: {
      battlesWon: 67,
      battlesLost: 23,
      petsOwned: 8,
      legendPetsOwned: 1,
      huntsCompleted: 142,
      auctionsSold: 12,
      totalEarnings: 89500,
    },
    achievements: [
      'first_pet',
      'first_battle_win',
      'pet_collector_10',
      'hunt_master_100',
      'legend_owner',
    ],
    settings: {
      notifications: true,
      autoFeed: false,
      battleAnimations: true,
    },
    lastLogin: Date.now() - 3600000, // 1 hour ago
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
  }

  // Generate pets
  const pets: Pet[] = [
    {
      id: 'pet-001',
      name: 'Fluffy',
      species: 'Fluffball',
      rarity: 'Common',
      level: 12,
      xp: 840,
      xpToNext: 1200,
      stats: {
        hp: 68,
        maxHp: 68,
        attack: 32,
        defense: 28,
        speed: 38,
      },
      image: 'https://via.placeholder.com/120/FFB74D/FFFFFF?text=🐾',
      evolutionStage: 1,
      maxEvolutionStage: 3,
      evolutionRequirements: {
        level: 15,
        itemId: 'item-evo-001',
      },
      isLegendary: false,
      ownerId: 'user-001',
      isForSale: false,
      mood: 85,
      lastFed: Date.now() - 7200000, // 2 hours ago
    },
    {
      id: 'pet-002',
      name: 'Rocky',
      species: 'Rockpup',
      rarity: 'Rare',
      level: 18,
      xp: 2100,
      xpToNext: 2400,
      stats: {
        hp: 95,
        maxHp: 95,
        attack: 42,
        defense: 48,
        speed: 22,
      },
      image: 'https://via.placeholder.com/120/8D6E63/FFFFFF?text=🪨',
      evolutionStage: 2,
      maxEvolutionStage: 3,
      evolutionRequirements: {
        level: 25,
        itemId: 'item-evo-002',
      },
      isLegendary: false,
      ownerId: 'user-001',
      isForSale: false,
      mood: 92,
      lastFed: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: 'pet-003',
      name: 'Zappy',
      species: 'Sparkwing',
      rarity: 'Epic',
      level: 20,
      xp: 1800,
      xpToNext: 2800,
      stats: {
        hp: 58,
        maxHp: 58,
        attack: 52,
        defense: 28,
        speed: 65,
      },
      image: 'https://via.placeholder.com/120/9C27B0/FFFFFF?text=⚡',
      evolutionStage: 2,
      maxEvolutionStage: 3,
      isLegendary: false,
      ownerId: 'user-001',
      isForSale: false,
      mood: 78,
      lastFed: Date.now() - 5400000, // 1.5 hours ago
    },
    {
      id: 'pet-004',
      name: 'Crimson Emperor',
      species: 'Flamecrest',
      rarity: 'Legendary',
      level: 35,
      xp: 8500,
      xpToNext: 12000,
      stats: {
        hp: 140,
        maxHp: 140,
        attack: 95,
        defense: 65,
        speed: 85,
      },
      image: 'https://via.placeholder.com/120/F44336/FFFFFF?text=🔥',
      evolutionStage: 3,
      maxEvolutionStage: 3,
      isLegendary: true,
      regionId: 'region-001',
      ownerId: 'user-001',
      isForSale: false,
      mood: 95,
      lastFed: Date.now() - 1800000, // 30 minutes ago
    },
  ]

  // Generate items
  const items: Item[] = [
    {
      id: 'item-heal-001',
      name: 'Health Potion',
      description: 'Restores 50 HP to a pet',
      type: 'Consumable',
      rarity: 'Common',
      effects: {
        hp: 50,
        permanent: false,
      },
      price: {
        coins: 100,
      },
      image: 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=🧪',
    },
    {
      id: 'item-evo-001',
      name: 'Evolution Stone',
      description: 'Required for basic pet evolution',
      type: 'Evolution',
      rarity: 'Rare',
      effects: {},
      price: {
        coins: 2500,
      },
      image: 'https://via.placeholder.com/80/2196F3/FFFFFF?text=💎',
    },
    {
      id: 'item-stat-001',
      name: 'Power Crystal',
      description: 'Permanently increases Attack by 5',
      type: 'StatBoost',
      rarity: 'Epic',
      effects: {
        attack: 5,
        permanent: true,
      },
      price: {
        gems: 50,
      },
      image: 'https://via.placeholder.com/80/FF5722/FFFFFF?text=⚔️',
    },
    {
      id: 'item-xp-001',
      name: 'XP Boost',
      description: 'Grants 500 XP to a pet',
      type: 'Consumable',
      rarity: 'Rare',
      effects: {
        xpBoost: 500,
        permanent: false,
      },
      price: {
        coins: 800,
      },
      image: 'https://via.placeholder.com/80/9C27B0/FFFFFF?text=⭐',
    },
  ]

  // Generate regions
  const regions: Region[] = [
    {
      id: 'region-001',
      name: 'Mystic Forest',
      description: 'A magical forest where nature pets thrive',
      huntingCost: 100,
      legendFee: 50,
      legendPetId: 'pet-004',
      legendOwnerId: 'user-001',
      availablePets: [
        { petSpecies: 'Fluffball', rarity: 'Common', spawnRate: 0.4 },
        { petSpecies: 'Sparkwing', rarity: 'Rare', spawnRate: 0.15 },
        { petSpecies: 'Windwhisper', rarity: 'Epic', spawnRate: 0.05 },
      ],
      exclusivePets: ['Treant Guardian', 'Forest Spirit'],
      image: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=🌲',
      unlockLevel: 1,
    },
    {
      id: 'region-002',
      name: 'Crystal Caves',
      description: 'Deep underground caverns filled with precious gems',
      huntingCost: 150,
      legendFee: 75,
      legendPetId: 'pet-legend-002',
      legendOwnerId: 'user-002',
      availablePets: [
        { petSpecies: 'Rockpup', rarity: 'Common', spawnRate: 0.35 },
        { petSpecies: 'Ironback', rarity: 'Rare', spawnRate: 0.2 },
        { petSpecies: 'Shadowpaw', rarity: 'Epic', spawnRate: 0.08 },
      ],
      exclusivePets: ['Crystal Golem', 'Diamond Drake'],
      image: 'https://via.placeholder.com/200/9C27B0/FFFFFF?text=💎',
      unlockLevel: 5,
    },
    {
      id: 'region-003',
      name: 'Flame Peaks',
      description: 'Volcanic mountains where fire pets dominate',
      huntingCost: 200,
      legendFee: 100,
      legendPetId: undefined,
      legendOwnerId: undefined,
      availablePets: [
        { petSpecies: 'Flamecrest', rarity: 'Rare', spawnRate: 0.25 },
        { petSpecies: 'Rockpup', rarity: 'Common', spawnRate: 0.3 },
      ],
      exclusivePets: ['Volcano Lord', 'Phoenix Hatchling'],
      image: 'https://via.placeholder.com/200/F44336/FFFFFF?text=🌋',
      unlockLevel: 10,
    },
    {
      id: 'region-004',
      name: 'Azure Seas',
      description: 'Vast ocean realm home to aquatic creatures',
      huntingCost: 175,
      legendFee: 85,
      legendPetId: 'pet-legend-004',
      legendOwnerId: 'user-003',
      availablePets: [
        { petSpecies: 'Aquafin', rarity: 'Common', spawnRate: 0.4 },
        { petSpecies: 'Sparkwing', rarity: 'Rare', spawnRate: 0.15 },
      ],
      exclusivePets: ['Leviathan', 'Coral Guardian'],
      image: 'https://via.placeholder.com/200/03A9F4/FFFFFF?text=🌊',
      unlockLevel: 8,
    },
  ]

  // Generate inventory
  const inventory: UserInventory = {
    pets: ['pet-001', 'pet-002', 'pet-003', 'pet-004'],
    items: {
      'item-heal-001': 12,
      'item-evo-001': 3,
      'item-stat-001': 1,
      'item-xp-001': 8,
    },
    maxPetSlots: 20,
    maxItemSlots: 100,
  }

  // Generate battles
  const battles: Battle[] = [
    {
      id: 'battle-001',
      type: 'PvE',
      attacker: {
        userId: 'user-001',
        petId: 'pet-002',
        username: 'VnPetTrainer',
      },
      defender: {
        userId: 'wild',
        petId: 'wild-pet-001',
        username: 'Wild Pet',
      },
      result: {
        winner: 'attacker',
        rewards: {
          xp: 150,
          coins: 75,
          items: ['item-heal-001'],
        },
        battleLog: [
          { turn: 1, actor: 'attacker', action: 'attack', damage: 25, description: 'Rocky used Rock Smash!' },
          { turn: 1, actor: 'defender', action: 'attack', damage: 18, description: 'Wild Fluffball used Tackle!' },
          { turn: 2, actor: 'attacker', action: 'attack', damage: 30, description: 'Rocky used Power Strike!' },
        ],
      },
      status: 'completed',
      createdAt: Date.now() - 7200000,
    },
  ]

  // Generate auctions
  const auctions: Auction[] = [
    {
      id: 'auction-001',
      sellerId: 'user-002',
      sellerUsername: 'PetMaster99',
      itemType: 'pet',
      itemId: 'pet-auction-001',
      startingBid: 1000,
      buyoutPrice: 5000,
      currentBid: 2300,
      currentBidderId: 'user-003',
      currentBidderUsername: 'DragonTamer',
      endTime: Date.now() + 7200000, // 2 hours from now
      status: 'active',
      bids: [
        {
          id: 'bid-001',
          bidderId: 'user-001',
          bidderUsername: 'VnPetTrainer',
          amount: 1200,
          timestamp: Date.now() - 3600000,
        },
        {
          id: 'bid-002',
          bidderId: 'user-003',
          bidderUsername: 'DragonTamer',
          amount: 2300,
          timestamp: Date.now() - 1800000,
        },
      ],
      commission: 0.05,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'auction-002',
      sellerId: 'user-004',
      sellerUsername: 'ItemCollector',
      itemType: 'item',
      itemId: 'item-stat-001',
      startingBid: 500,
      currentBid: 800,
      currentBidderId: 'user-001',
      currentBidderUsername: 'VnPetTrainer',
      endTime: Date.now() + 3600000, // 1 hour from now
      status: 'active',
      bids: [
        {
          id: 'bid-003',
          bidderId: 'user-001',
          bidderUsername: 'VnPetTrainer',
          amount: 800,
          timestamp: Date.now() - 900000,
        },
      ],
      commission: 0.05,
      createdAt: Date.now() - 43200000,
    },
  ]

  // Generate notifications
  const notifications: GameNotification[] = [
    {
      id: 'notif-001',
      type: 'auction_won',
      title: 'Auction Won!',
      message: 'You won the auction for Power Crystal!',
      data: { auctionId: 'auction-002' },
      read: false,
      timestamp: Date.now() - 300000,
    },
    {
      id: 'notif-002',
      type: 'level_up',
      title: 'Pet Level Up!',
      message: 'Rocky reached level 18!',
      data: { petId: 'pet-002' },
      read: false,
      timestamp: Date.now() - 1800000,
    },
    {
      id: 'notif-003',
      type: 'legend_challenged',
      title: 'Legend Pet Challenged!',
      message: 'Someone hunted in your region: Mystic Forest',
      data: { regionId: 'region-001', fee: 50 },
      read: true,
      timestamp: Date.now() - 7200000,
    },
  ]

  return {
    profile,
    pets,
    items,
    regions,
    inventory,
    battles,
    auctions,
    notifications,
  }
}
