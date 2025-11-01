// Move Types
export interface Move {
  id: string
  name: string
  type: 'Physical' | 'Special' | 'Status'
  element: 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice' | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug' | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy'
  power: number
  accuracy: number
  pp: number
  maxPp: number
  description: string
  effects?: {
    damage?: number
    healing?: number
    statusEffect?: 'burn' | 'freeze' | 'paralyze' | 'poison' | 'sleep'
    statBoost?: {
      attack?: number
      defense?: number
      speed?: number
    }
  }
}

// Opponent Types
export interface Opponent {
  id: string
  name: string
  species: string
  level: number
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master'
  stats: {
    hp: number
    maxHp: number
    attack: number
    defense: number
    speed: number
  }
  moves: Move[]
  image: string | ReturnType<typeof require>
  rewards: {
    xp: number
    coins: number
    items: string[]
  }
  unlockLevel: number
}

// Pet Types
export interface Pet {
  id: string
  name: string
  species: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  level: number
  xp: number
  xpToNext: number
  stats: {
    hp: number
    maxHp: number
    attack: number
    defense: number
    speed: number
  }
  moves: Move[]
  image: string
  evolutionStage: number
  maxEvolutionStage: number
  evolutionRequirements?: {
    level: number
    itemId: string
  }
  isLegendary: boolean
  regionId?: string // For legend pets
  ownerId: string
  isForSale: boolean
  mood: number // 0-100
  lastFed: number
}

// Item Types
export interface Item {
  id: string
  name: string
  description: string
  type: 'StatBoost' | 'Evolution' | 'Consumable' | 'Cosmetic'
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  effects: {
    hp?: number
    attack?: number
    defense?: number
    speed?: number
    xpBoost?: number
    permanent?: boolean
  }
  price: {
    coins?: number
    gems?: number
  }
  image: string
}

// Battle Types
export interface Battle {
  id: string
  type: 'PvE' | 'PvP' | 'LegendChallenge'
  attacker: {
    userId: string
    petId: string
    username: string
  }
  defender: {
    userId: string
    petId: string
    username: string
  }
  result?: {
    winner: 'attacker' | 'defender'
    rewards: {
      xp: number
      coins: number
      items: string[]
    }
    battleLog: BattleAction[]
  }
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: number
}

export interface BattleAction {
  turn: number
  actor: 'attacker' | 'defender'
  action: 'attack' | 'defend' | 'special'
  damage: number
  description: string
}

// Region & Hunting Types
export interface Region {
  id: string
  name: string
  description: string
  huntingCost: number
  legendFee: number
  legendPetId?: string
  legendOwnerId?: string
  availablePets: {
    petSpecies: string
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
    spawnRate: number
  }[]
  exclusivePets: string[]
  image: string
  unlockLevel: number
}

export interface HuntResult {
  type: 'pet' | 'item' | 'empty'
  pet?: Pet
  item?: Item
  xp: number
  coins: number
}

// Auction Types
export interface Auction {
  id: string
  sellerId: string
  sellerUsername: string
  itemType: 'pet' | 'item'
  itemId: string
  startingBid: number
  buyoutPrice?: number
  currentBid: number
  currentBidderId?: string
  currentBidderUsername?: string
  endTime: number
  status: 'active' | 'completed' | 'cancelled'
  bids: AuctionBid[]
  commission: number
  createdAt: number
}

export interface AuctionBid {
  id: string
  bidderId: string
  bidderUsername: string
  amount: number
  timestamp: number
}

// Economy Types
export interface Currency {
  coins: number
  gems: number
}

export interface Transaction {
  id: string
  userId: string
  type: 'battle_reward' | 'hunt_cost' | 'auction_sale' | 'auction_purchase' | 'legend_fee' | 'iap'
  amount: number
  currency: 'coins' | 'gems'
  description: string
  timestamp: number
  relatedId?: string // battle id, auction id, etc.
}

// User Profile Types
export interface UserProfile {
  id: string
  username: string
  email: string
  avatar: string
  level: number
  xp: number
  xpToNext: number
  currency: Currency
  // Ticket system for hunts and battles
  huntTickets: number
  battleTickets: number
  lastTicketReset: string
  // Inventory tracking
  petCount: number
  itemCount: number
  stats: {
    battlesWon: number
    battlesLost: number
    petsOwned: number
    legendPetsOwned: number
    huntsCompleted: number
    auctionsSold: number
    totalEarnings: number
  }
  achievements: string[]
  settings: {
    notifications: boolean
    autoFeed: boolean
    battleAnimations: boolean
  }
  lastLogin: number
  createdAt: number
}

// Inventory Types
export interface UserInventory {
  pets: string[] // Pet IDs
  items: {
    [itemId: string]: number // quantity
  }
  maxPetSlots: number
  maxItemSlots: number
}

// Game State Types
export interface GameState {
  profile: UserProfile
  inventory: UserInventory
  pets: Pet[]
  items: Item[]
  regions: Region[]
  // opponents removed - now a constant in src/constants/opponents.ts
  auctions: Auction[]
  battles: Battle[]
  activeBattle?: Battle
  huntingCooldowns: {
    [regionId: string]: number
  }
  notifications: GameNotification[]
}

export interface GameNotification {
  id: string
  type: 'auction_won' | 'auction_outbid' | 'legend_challenged' | 'hunt_result' | 'level_up'
  title: string
  message: string
  data?: any
  read: boolean
  timestamp: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Evolution System
export interface EvolutionTree {
  [speciesId: string]: {
    stage: number
    nextEvolution?: {
      species: string
      requirements: {
        level: number
        itemId: string
      }
    }
  }
}
