import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GameState, Pet, Item, Battle, Auction, HuntResult, UserProfile, UserInventory, GameNotification, Move, Opponent } from '../types/game'

// Simple dummy data inline to avoid circular dependencies
const createDummyData = () => {
  // Create basic moves
  const moves: Move[] = [
    {
      id: 'move-tackle',
      name: 'Tackle',
      type: 'Physical',
      element: 'Normal',
      power: 40,
      accuracy: 100,
      pp: 35,
      maxPp: 35,
      description: 'A physical attack where the user charges at the target.',
    },
    {
      id: 'move-scratch',
      name: 'Scratch',
      type: 'Physical',
      element: 'Normal',
      power: 35,
      accuracy: 100,
      pp: 35,
      maxPp: 35,
      description: 'Hard, pointed claws rake the target.',
    },
    {
      id: 'move-ember',
      name: 'Ember',
      type: 'Special',
      element: 'Fire',
      power: 40,
      accuracy: 100,
      pp: 25,
      maxPp: 25,
      description: 'Small flames are shot at the target.',
    },
    {
      id: 'move-water-gun',
      name: 'Water Gun',
      type: 'Special',
      element: 'Water',
      power: 40,
      accuracy: 100,
      pp: 25,
      maxPp: 25,
      description: 'Water is blasted at the target.',
    },
    {
      id: 'move-heal',
      name: 'Heal',
      type: 'Status',
      element: 'Normal',
      power: 0,
      accuracy: 100,
      pp: 10,
      maxPp: 10,
      description: 'Restores HP.',
      effects: { healing: 20 }
    },
    {
      id: 'move-power-up',
      name: 'Power Up',
      type: 'Status',
      element: 'Normal',
      power: 0,
      accuracy: 100,
      pp: 15,
      maxPp: 15,
      description: 'Increases Attack.',
      effects: { statBoost: { attack: 10 } }
    }
  ]

  const profile: UserProfile = {
    id: 'user-001',
    username: 'VnPetTrainer',
    email: 'trainer@vnpet.com',
    avatar: 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=VT',
    level: 15,
    xp: 2840,
    xpToNext: 3200,
    currency: { coins: 15750, gems: 245 },
    stats: {
      battlesWon: 67,
      battlesLost: 23,
      petsOwned: 8,
      legendPetsOwned: 1,
      huntsCompleted: 142,
      auctionsSold: 12,
      totalEarnings: 89500,
    },
    achievements: ['first_pet', 'first_battle_win', 'pet_collector_10', 'hunt_master_100', 'legend_owner'],
    settings: { notifications: true, autoFeed: false, battleAnimations: true },
    lastLogin: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 30,
  }

  const pets: Pet[] = [
    {
      id: 'pet-001',
      name: 'Fluffy',
      species: 'Fluffball',
      rarity: 'Common',
      level: 12,
      xp: 840,
      xpToNext: 1200,
      stats: { hp: 68, maxHp: 68, attack: 32, defense: 28, speed: 38 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-scratch'),
        moves.find(m => m.id === 'move-heal'),
        moves.find(m => m.id === 'move-power-up'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/FFB74D/FFFFFF?text=🐾',
      evolutionStage: 1,
      maxEvolutionStage: 3,
      evolutionRequirements: { level: 15, itemId: 'item-evo-001' },
      isLegendary: false,
      ownerId: 'user-001',
      isForSale: false,
      mood: 85,
      lastFed: Date.now() - 7200000,
    }
  ]

  const opponents: Opponent[] = [
    {
      id: 'opp-001',
      name: 'Wild Rookie',
      species: 'Grassling',
      level: 5,
      difficulty: 'Easy',
      stats: { hp: 35, maxHp: 35, attack: 18, defense: 15, speed: 20 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-scratch'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/8BC34A/FFFFFF?text=🌱',
      rewards: { xp: 50, coins: 25, items: [] },
      unlockLevel: 1,
    },
    {
      id: 'opp-002',
      name: 'Forest Guardian',
      species: 'Treebeast',
      level: 10,
      difficulty: 'Normal',
      stats: { hp: 55, maxHp: 55, attack: 28, defense: 25, speed: 22 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-scratch'),
        moves.find(m => m.id === 'move-heal'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/4CAF50/FFFFFF?text=🌳',
      rewards: { xp: 75, coins: 40, items: ['item-heal-001'] },
      unlockLevel: 5,
    },
    {
      id: 'opp-003',
      name: 'Flame Warrior',
      species: 'Blazehound',
      level: 15,
      difficulty: 'Hard',
      stats: { hp: 75, maxHp: 75, attack: 42, defense: 30, speed: 35 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-ember'),
        moves.find(m => m.id === 'move-power-up'),
        moves.find(m => m.id === 'move-heal'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/FF5722/FFFFFF?text=🔥',
      rewards: { xp: 120, coins: 75, items: ['item-heal-001', 'item-evo-001'] },
      unlockLevel: 10,
    },
    {
      id: 'opp-004',
      name: 'Water Master',
      species: 'Hydralord',
      level: 20,
      difficulty: 'Expert',
      stats: { hp: 95, maxHp: 95, attack: 38, defense: 45, speed: 40 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-water-gun'),
        moves.find(m => m.id === 'move-heal'),
        moves.find(m => m.id === 'move-power-up'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/2196F3/FFFFFF?text=🌊',
      rewards: { xp: 180, coins: 120, items: ['item-heal-001', 'item-evo-001', 'item-stat-001'] },
      unlockLevel: 15,
    },
    {
      id: 'opp-005',
      name: 'Shadow Champion',
      species: 'Darklord',
      level: 25,
      difficulty: 'Master',
      stats: { hp: 120, maxHp: 120, attack: 55, defense: 50, speed: 50 },
      moves: [
        moves.find(m => m.id === 'move-tackle'),
        moves.find(m => m.id === 'move-scratch'),
        moves.find(m => m.id === 'move-heal'),
        moves.find(m => m.id === 'move-power-up'),
      ].filter(Boolean) as Move[],
      image: 'https://via.placeholder.com/120/9C27B0/FFFFFF?text=👹',
      rewards: { xp: 250, coins: 200, items: ['item-heal-001', 'item-evo-001', 'item-stat-001'] },
      unlockLevel: 20,
    },
  ]

  const items: Item[] = [
    {
      id: 'item-heal-001',
      name: 'Health Potion',
      description: 'Restores 50 HP to a pet',
      type: 'Consumable',
      rarity: 'Common',
      effects: { hp: 50, permanent: false },
      price: { coins: 100 },
      image: 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=🧪',
    }
  ]

  const regions = [
    {
      id: 'region-001',
      name: 'Mystic Forest',
      description: 'A magical forest where nature pets thrive',
      huntingCost: 100,
      legendFee: 50,
      legendPetId: 'pet-004',
      legendOwnerId: 'user-001',
      availablePets: [
        { petSpecies: 'Fluffball', rarity: 'Common' as const, spawnRate: 0.4 },
      ],
      exclusivePets: ['Treant Guardian'],
      image: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=🌲',
      unlockLevel: 1,
    }
  ]

  return {
    profile,
    pets,
    items,
    regions,
    opponents,
    inventory: { pets: ['pet-001'], items: { 'item-heal-001': 5 }, maxPetSlots: 20, maxItemSlots: 100 },
    battles: [],
    auctions: [],
    notifications: [],
  }
}

const dummyData = createDummyData()

export const gameInitialState: GameState = {
  profile: dummyData.profile,
  inventory: dummyData.inventory,
  pets: dummyData.pets,
  items: dummyData.items,
  regions: dummyData.regions,
  opponents: dummyData.opponents,
  auctions: dummyData.auctions,
  battles: dummyData.battles,
  activeBattle: undefined,
  huntingCooldowns: {},
  notifications: dummyData.notifications,
}

const gameSlice = createSlice({
  name: 'game',
  initialState: gameInitialState,
  reducers: {
    // Profile Actions
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    
    addCurrency: (state, action: PayloadAction<{ coins?: number; gems?: number }>) => {
      if (action.payload.coins) {
        state.profile.currency.coins += action.payload.coins
      }
      if (action.payload.gems) {
        state.profile.currency.gems += action.payload.gems
      }
    },
    
    spendCurrency: (state, action: PayloadAction<{ coins?: number; gems?: number }>) => {
      if (action.payload.coins) {
        state.profile.currency.coins = Math.max(0, state.profile.currency.coins - action.payload.coins)
      }
      if (action.payload.gems) {
        state.profile.currency.gems = Math.max(0, state.profile.currency.gems - action.payload.gems)
      }
    },

    // Pet Actions
    addPet: (state, action: PayloadAction<Pet>) => {
      state.pets.push(action.payload)
      state.inventory.pets.push(action.payload.id)
      state.profile.stats.petsOwned += 1
    },
    
    updatePet: (state, action: PayloadAction<{ petId: string; updates: Partial<Pet> }>) => {
      const petIndex = state.pets.findIndex(pet => pet.id === action.payload.petId)
      if (petIndex !== -1) {
        state.pets[petIndex] = { ...state.pets[petIndex], ...action.payload.updates }
      }
    },
    
    removePet: (state, action: PayloadAction<string>) => {
      state.pets = state.pets.filter(pet => pet.id !== action.payload)
      state.inventory.pets = state.inventory.pets.filter(petId => petId !== action.payload)
      state.profile.stats.petsOwned -= 1
    },
    
    levelUpPet: (state, action: PayloadAction<{ petId: string; xpGained: number }>) => {
      const petIndex = state.pets.findIndex(pet => pet.id === action.payload.petId)
      if (petIndex !== -1) {
        const pet = state.pets[petIndex]
        pet.xp += action.payload.xpGained
        
        // Check for level up
        while (pet.xp >= pet.xpToNext) {
          pet.xp -= pet.xpToNext
          pet.level += 1
          pet.xpToNext = Math.floor(pet.xpToNext * 1.2)
          
          // Stat increases on level up
          pet.stats.maxHp += Math.floor(pet.level * 0.5) + 2
          pet.stats.hp = pet.stats.maxHp
          pet.stats.attack += Math.floor(pet.level * 0.3) + 1
          pet.stats.defense += Math.floor(pet.level * 0.3) + 1
          pet.stats.speed += Math.floor(pet.level * 0.2) + 1
        }
      }
    },

    // Item Actions
    addItem: (state, action: PayloadAction<{ itemId: string; quantity?: number }>) => {
      const quantity = action.payload.quantity || 1
      const currentQuantity = state.inventory.items[action.payload.itemId] || 0
      state.inventory.items[action.payload.itemId] = currentQuantity + quantity
    },
    
    useItem: (state, action: PayloadAction<{ itemId: string; petId?: string; quantity?: number }>) => {
      const quantity = action.payload.quantity || 1
      const currentQuantity = state.inventory.items[action.payload.itemId] || 0
      
      if (currentQuantity >= quantity) {
        state.inventory.items[action.payload.itemId] = currentQuantity - quantity
        
        // Apply item effects if pet is specified
        if (action.payload.petId) {
          const petIndex = state.pets.findIndex(pet => pet.id === action.payload.petId)
          const item = state.items.find(item => item.id === action.payload.itemId)
          
          if (petIndex !== -1 && item) {
            const pet = state.pets[petIndex]
            if (item.effects) {
              if (item.effects.hp) pet.stats.hp = Math.min(pet.stats.maxHp, pet.stats.hp + item.effects.hp)
              if (item.effects.attack && item.effects.permanent) pet.stats.attack += item.effects.attack
              if (item.effects.defense && item.effects.permanent) pet.stats.defense += item.effects.defense
              if (item.effects.speed && item.effects.permanent) pet.stats.speed += item.effects.speed
              if (item.effects.xpBoost) pet.xp += item.effects.xpBoost
            }
          }
        }
      }
    },

    // Battle Actions
    startBattle: (state, action: PayloadAction<Battle>) => {
      state.activeBattle = action.payload
      state.battles.push(action.payload)
    },
    
    updateBattle: (state, action: PayloadAction<{ battleId: string; updates: Partial<Battle> }>) => {
      const battleIndex = state.battles.findIndex(battle => battle.id === action.payload.battleId)
      if (battleIndex !== -1) {
        state.battles[battleIndex] = { ...state.battles[battleIndex], ...action.payload.updates }
        
        if (state.activeBattle?.id === action.payload.battleId) {
          state.activeBattle = { ...state.activeBattle, ...action.payload.updates }
        }
      }
    },
    
    completeBattle: (state, action: PayloadAction<{ battleId: string; result: Battle['result'] }>) => {
      const battleIndex = state.battles.findIndex(battle => battle.id === action.payload.battleId)
      if (battleIndex !== -1) {
        state.battles[battleIndex].result = action.payload.result
        state.battles[battleIndex].status = 'completed'
        
        // Update stats
        if (action.payload.result?.winner === 'attacker') {
          state.profile.stats.battlesWon += 1
        } else {
          state.profile.stats.battlesLost += 1
        }
        
        // Apply rewards
        if (action.payload.result?.rewards) {
          state.profile.currency.coins += action.payload.result.rewards.coins
          action.payload.result.rewards.items.forEach(itemId => {
            const currentQuantity = state.inventory.items[itemId] || 0
            state.inventory.items[itemId] = currentQuantity + 1
          })
        }
      }
      
      if (state.activeBattle?.id === action.payload.battleId) {
        state.activeBattle = undefined
      }
    },

    // Hunting Actions
    setHuntingCooldown: (state, action: PayloadAction<{ regionId: string; cooldownEnd: number }>) => {
      state.huntingCooldowns[action.payload.regionId] = action.payload.cooldownEnd
    },
    
    processHuntResult: (state, action: PayloadAction<{ regionId: string; result: HuntResult; cost: number }>) => {
      // Deduct hunting cost
      state.profile.currency.coins -= action.payload.cost
      state.profile.stats.huntsCompleted += 1
      
      // Apply hunt result
      if (action.payload.result.type === 'pet' && action.payload.result.pet) {
        state.pets.push(action.payload.result.pet)
        state.inventory.pets.push(action.payload.result.pet.id)
        state.profile.stats.petsOwned += 1
      }
      
      if (action.payload.result.type === 'item' && action.payload.result.item) {
        const currentQuantity = state.inventory.items[action.payload.result.item.id] || 0
        state.inventory.items[action.payload.result.item.id] = currentQuantity + 1
      }
      
      // Add rewards
      state.profile.currency.coins += action.payload.result.coins
      state.profile.xp += action.payload.result.xp
    },

    // Auction Actions
    createAuction: (state, action: PayloadAction<Auction>) => {
      state.auctions.push(action.payload)
      
      // Remove item from inventory (it's now in auction)
      if (action.payload.itemType === 'pet') {
        state.inventory.pets = state.inventory.pets.filter(petId => petId !== action.payload.itemId)
      } else {
        const currentQuantity = state.inventory.items[action.payload.itemId] || 0
        state.inventory.items[action.payload.itemId] = Math.max(0, currentQuantity - 1)
      }
    },
    
    bidOnAuction: (state, action: PayloadAction<{ auctionId: string; bidAmount: number; bidderId: string; bidderUsername: string }>) => {
      const auctionIndex = state.auctions.findIndex(auction => auction.id === action.payload.auctionId)
      if (auctionIndex !== -1) {
        const auction = state.auctions[auctionIndex]
        
        // Refund previous bidder
        if (auction.currentBidderId && auction.currentBidderId !== action.payload.bidderId) {
          // In a real app, this would be handled by the backend
        }
        
        // Set new highest bid
        auction.currentBid = action.payload.bidAmount
        auction.currentBidderId = action.payload.bidderId
        auction.currentBidderUsername = action.payload.bidderUsername
        
        auction.bids.push({
          id: Date.now().toString(),
          bidderId: action.payload.bidderId,
          bidderUsername: action.payload.bidderUsername,
          amount: action.payload.bidAmount,
          timestamp: Date.now(),
        })
        
        // Lock currency for current user's bid
        if (action.payload.bidderId === state.profile.id) {
          state.profile.currency.coins -= action.payload.bidAmount
        }
      }
    },
    
    completeAuction: (state, action: PayloadAction<{ auctionId: string; winnerId?: string }>) => {
      const auctionIndex = state.auctions.findIndex(auction => auction.id === action.payload.auctionId)
      if (auctionIndex !== -1) {
        const auction = state.auctions[auctionIndex]
        auction.status = 'completed'
        
        if (auction.sellerId === state.profile.id) {
          // Seller receives payment
          const finalPrice = auction.currentBid
          const commission = Math.floor(finalPrice * auction.commission)
          state.profile.currency.coins += (finalPrice - commission)
          state.profile.stats.auctionsSold += 1
          state.profile.stats.totalEarnings += (finalPrice - commission)
        }
        
        if (action.payload.winnerId === state.profile.id) {
          // Winner receives item
          if (auction.itemType === 'pet') {
            const pet = state.pets.find(p => p.id === auction.itemId)
            if (pet) {
              pet.ownerId = state.profile.id
              state.inventory.pets.push(auction.itemId)
              state.profile.stats.petsOwned += 1
            }
          } else {
            const currentQuantity = state.inventory.items[auction.itemId] || 0
            state.inventory.items[auction.itemId] = currentQuantity + 1
          }
        }
      }
    },

    // Notification Actions
    addNotification: (state, action: PayloadAction<GameNotification>) => {
      state.notifications.unshift(action.payload)
    },
    
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(notif => notif.id === action.payload)
      if (notificationIndex !== -1) {
        state.notifications[notificationIndex].read = true
      }
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },

    // Region Actions
    updateRegionLegend: (state, action: PayloadAction<{ regionId: string; legendPetId?: string; legendOwnerId?: string }>) => {
      const regionIndex = state.regions.findIndex(region => region.id === action.payload.regionId)
      if (regionIndex !== -1) {
        state.regions[regionIndex].legendPetId = action.payload.legendPetId
        state.regions[regionIndex].legendOwnerId = action.payload.legendOwnerId
      }
    },
  },
})

export const gameActions = gameSlice.actions
export default gameSlice.reducer
