import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GameState, Pet, Item, Battle, HuntResult, UserProfile, UserInventory, GameNotification, Move, Opponent, DailyLoginState } from '../types/game'
import { getPokemonImage } from '@/assets/images'

export const gameInitialState: GameState = {
  profile: {
    id: '',
    username: '',
    email: '',
    avatar: '',
    level: 1,
    xp: 0,
    xpToNext: 100,
    currency: { coins: 0, gems: 0 },
    huntTickets: 0,
    battleTickets: 0,
    maxHuntTickets: 5,
    maxBattleTickets: 20,
    nextHuntTicketAt: null,
    nextBattleTicketAt: null,
    huntRegenMinutes: 180,
    battleRegenMinutes: 60,
    petCount: 0,
    itemCount: 0,
    stats: {
      battlesWon: 0,
      battlesLost: 0,
      petsOwned: 0,
      legendPetsOwned: 0,
      huntsCompleted: 0,
      totalEarnings: 0,
    },
    achievements: [],
    settings: {
      notifications: true,
      autoFeed: false,
      battleAnimations: true,
      soundEnabled: true,
      musicEnabled: true,
      language: 'en',
    },
    lastLogin: 0,
    createdAt: 0,
  },
  inventory: { pets: [], items: {}, maxPetSlots: 20, maxItemSlots: 100 },
  pets: [],
  items: [],
  regions: [],
  opponents: [],
  battles: [],
  activeBattle: undefined,
  huntingCooldowns: {},
  dailyLogin: {
    currentStreak: 0,
    currentDay: 0,
    claimedToday: false,
    totalLogins: 0,
    rewards: [],
    lastClaimedReward: null,
  },
  notifications: [],
  isLoading: false,
  isLoadingPets: false,
  isLoadingItems: false,
  isLoadingRegions: false,
}

const gameSlice = createSlice({
  name: 'game',
  initialState: gameInitialState,
  reducers: {
    // Trigger API data loading (handled by saga)
    loadUserData: (state) => {
      // This is just a trigger action, actual loading is done in saga
      state.isLoading = true
    },

    setLoadingComplete: (state) => {
      state.isLoading = false
      state.isLoadingPets = false
      state.isLoadingItems = false
      state.isLoadingRegions = false
    },

    setLoadingPets: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPets = action.payload
    },

    setLoadingItems: (state, action: PayloadAction<boolean>) => {
      state.isLoadingItems = action.payload
    },

    setLoadingRegions: (state, action: PayloadAction<boolean>) => {
      state.isLoadingRegions = action.payload
    },

    // API Data Loading Actions
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
    },
    
    setPets: (state, action: PayloadAction<Pet[]>) => {
      state.pets = action.payload
      state.inventory.pets = action.payload.map(pet => pet.id)
    },
    
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload
    },
    
    setRegions: (state, action: PayloadAction<any[]>) => {
      state.regions = action.payload
    },
    
    setOpponents: (state, action: PayloadAction<Opponent[]>) => {
      state.opponents = action.payload
    },
    
    setInventory: (state, action: PayloadAction<{ items: Record<string, number> }>) => {
      state.inventory.items = action.payload.items
    },

    // Profile Actions
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload }
    },

    // Pet Actions
    addPet: (state, action: PayloadAction<Pet>) => {
      state.pets.push(action.payload)
      state.inventory.pets.push(action.payload.id)
      state.profile.stats.petsOwned += 1
    },
    
    removePet: (state, action: PayloadAction<string>) => {
      state.pets = state.pets.filter(pet => pet.id !== action.payload)
      state.inventory.pets = state.inventory.pets.filter(petId => petId !== action.payload)
      state.profile.stats.petsOwned -= 1
    },

    // Item Actions
    addItem: (state, action: PayloadAction<{ itemId: string; quantity?: number }>) => {
      const quantity = action.payload.quantity || 1
      const currentQuantity = state.inventory.items[action.payload.itemId] || 0
      state.inventory.items[action.payload.itemId] = currentQuantity + quantity
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

    // Daily Login Actions
    setDailyLogin: (state, action: PayloadAction<DailyLoginState>) => {
      state.dailyLogin = action.payload
    },

    // Settings Actions
    updateSettings: (state, action: PayloadAction<Partial<UserProfile['settings']>>) => {
      state.profile.settings = { ...state.profile.settings, ...action.payload }
    },
  },
})

export const gameActions = gameSlice.actions
export default gameSlice.reducer
