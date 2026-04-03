import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Pet, Item, Region, Battle, Opponent, GameNotification } from '../types/game'

// Base selectors
export const getGameState = (state: RootState) => state.game
export const getUserProfile = (state: RootState) => state.game.profile
export const getUserInventory = (state: RootState) => state.game.inventory
export const getAllPets = (state: RootState) => state.game.pets
export const getAllItems = (state: RootState) => state.game.items
export const getAllRegions = (state: RootState) => state.game.regions
export const getAllOpponents = (state: RootState) => state.game.opponents
export const getAllBattles = (state: RootState) => state.game.battles
export const getActiveBattle = (state: RootState) => state.game.activeBattle
export const getNotifications = (state: RootState) => state.game.notifications
export const getHuntingCooldowns = (state: RootState) => state.game.huntingCooldowns

// Loading selectors
export const getIsLoading = (state: RootState) => state.game.isLoading
export const getIsLoadingPets = (state: RootState) => state.game.isLoadingPets
export const getIsLoadingItems = (state: RootState) => state.game.isLoadingItems
export const getIsLoadingRegions = (state: RootState) => state.game.isLoadingRegions

// Currency selectors
export const getUserCurrency = createSelector(
  getUserProfile,
  (profile) => profile.currency
)

export const getCoins = createSelector(
  getUserCurrency,
  (currency) => currency.coins
)

export const getGems = createSelector(
  getUserCurrency,
  (currency) => currency.gems
)

// Pet selectors
export const getOwnedPets = createSelector(
  [getAllPets, getUserInventory],
  (allPets: Pet[], inventory) => 
    allPets.filter((pet: Pet) => inventory.pets.includes(pet.id))
)

export const getPetById = (petId: string) => createSelector(
  getAllPets,
  (pets: Pet[]) => pets.find((pet: Pet) => pet.id === petId)
)

export const getOwnedPetsByRarity = createSelector(
  getOwnedPets,
  (pets: Pet[]) => {
    const grouped = pets.reduce((acc: Record<string, Pet[]>, pet: Pet) => {
      if (!acc[pet.rarity]) acc[pet.rarity] = []
      acc[pet.rarity].push(pet)
      return acc
    }, {} as Record<string, Pet[]>)
    
    return grouped
  }
)

export const getLegendaryPets = createSelector(
  getOwnedPets,
  (pets: Pet[]) => pets.filter((pet: Pet) => pet.isLegendary)
)

export const getPetsReadyToEvolve = createSelector(
  [getOwnedPets, getUserInventory, getAllItems],
  (pets: Pet[], inventory, items) => 
    pets.filter((pet: Pet) => {
      if (!pet.evolutionRequirements || pet.evolutionStage >= pet.maxEvolutionStage) {
        return false
      }
      
      const hasLevel = pet.level >= pet.evolutionRequirements.level
      const hasItem = (inventory.items[pet.evolutionRequirements.itemId] || 0) > 0
      
      return hasLevel && hasItem
    })
)

// Item selectors
export const getOwnedItems = createSelector(
  [getAllItems, getUserInventory],
  (allItems: Item[], inventory) => 
    allItems.filter((item: Item) => (inventory.items[item.id] || 0) > 0)
      .map((item: Item) => ({
        ...item,
        quantity: inventory.items[item.id] || 0
      }))
)

export const getItemById = (itemId: string) => createSelector(
  getAllItems,
  (items: Item[]) => items.find((item: Item) => item.id === itemId)
)

export const getItemQuantity = (itemId: string) => createSelector(
  getUserInventory,
  (inventory) => inventory.items[itemId] || 0
)

// Region selectors
export const getAvailableRegions = createSelector(
  [getAllRegions, getUserProfile],
  (regions: Region[], profile) => 
    regions.filter((region: Region) => profile.level >= region.unlockLevel)
)

export const getRegionById = (regionId: string) => createSelector(
  getAllRegions,
  (regions: Region[]) => regions.find((region: Region) => region.id === regionId)
)

export const getOwnedLegendRegions = createSelector(
  [getAllRegions, getUserProfile],
  (regions: Region[], profile) => 
    regions.filter((region: Region) => region.legendOwnerId === profile.id)
)

export const getRegionHuntingCost = (regionId: string) => createSelector(
  [getRegionById(regionId), getAllRegions],
  (region: Region | undefined) => {
    if (!region) return 0
    let totalCost = region.huntingCost
    if (region.legendPetId && region.legendOwnerId) {
      totalCost += region.legendFee
    }
    return totalCost
  }
)

export const canHuntInRegion = (regionId: string) => createSelector(
  [getRegionHuntingCost(regionId), getCoins, getHuntingCooldowns],
  (cost, coins, cooldowns) => {
    const cooldownEnd = cooldowns[regionId] || 0
    const isOnCooldown = Date.now() < cooldownEnd
    const hasEnoughCoins = coins >= cost
    
    return hasEnoughCoins && !isOnCooldown
  }
)

// Opponent selectors
export const getAvailableOpponents = createSelector(
  [getAllOpponents, getUserProfile],
  (opponents: Opponent[], profile) => {
    if (!opponents || !profile) return []
    return opponents.filter((opponent: Opponent) => profile.level >= opponent.unlockLevel)
  }
)

export const getOpponentById = (opponentId: string) => createSelector(
  getAllOpponents,
  (opponents: Opponent[]) => opponents.find((opponent: Opponent) => opponent.id === opponentId)
)

export const getOpponentsByDifficulty = createSelector(
  [getAvailableOpponents],
  (opponents: Opponent[]) => {
    if (!opponents) return {}
    return opponents.reduce((acc: Record<string, Opponent[]>, opponent: Opponent) => {
      if (!acc[opponent.difficulty]) acc[opponent.difficulty] = []
      acc[opponent.difficulty].push(opponent)
      return acc
    }, {} as Record<string, Opponent[]>)
  }
)

// Battle selectors
export const getRecentBattles = createSelector(
  getAllBattles,
  (battles: Battle[]) => 
    battles
      .filter((battle: Battle) => battle.status === 'completed')
      .sort((a: Battle, b: Battle) => b.createdAt - a.createdAt)
      .slice(0, 10)
)

export const getBattleStats = createSelector(
  getUserProfile,
  (profile) => ({
    won: profile.stats.battlesWon,
    lost: profile.stats.battlesLost,
    total: profile.stats.battlesWon + profile.stats.battlesLost,
    winRate: profile.stats.battlesWon + profile.stats.battlesLost > 0 
      ? (profile.stats.battlesWon / (profile.stats.battlesWon + profile.stats.battlesLost) * 100).toFixed(1)
      : '0.0'
  })
)

// Notification selectors
export const getUnreadNotifications = createSelector(
  getNotifications,
  (notifications: GameNotification[]) => notifications.filter((notif: GameNotification) => !notif.read)
)

export const getNotificationCount = createSelector(
  getUnreadNotifications,
  (notifications: GameNotification[]) => notifications.length
)

export const getNotificationsByType = createSelector(
  getNotifications,
  (notifications: GameNotification[]) => 
    notifications.reduce((acc: Record<string, GameNotification[]>, notif: GameNotification) => {
      if (!acc[notif.type]) acc[notif.type] = []
      acc[notif.type].push(notif)
      return acc
    }, {} as Record<string, GameNotification[]>)
)

// Game progress selectors
export const getPlayerLevel = createSelector(
  getUserProfile,
  (profile) => profile.level
)

export const getPlayerXP = createSelector(
  getUserProfile,
  (profile) => ({
    current: profile.xp,
    toNext: profile.xpToNext,
    percentage: (profile.xp / profile.xpToNext * 100).toFixed(1)
  })
)

export const getTotalPetValue = createSelector(
  getOwnedPets,
  (pets: Pet[]) => 
    pets.reduce((total: number, pet: Pet) => {
      // Basic value calculation based on level and rarity
      const baseValue = pet.level * 100
      const rarityMultiplier = {
        'Common': 1,
        'Uncommon': 1.5,
        'Rare': 2,
        'Epic': 4,
        'Legendary': 8
      }[pet.rarity] || 1
      
      return total + (baseValue * rarityMultiplier)
    }, 0)
)

export const getGameStats = createSelector(
  [getUserProfile, getOwnedPets, getTotalPetValue],
  (profile, pets: Pet[], petValue: number) => ({
    level: profile.level,
    totalPets: pets.length,
    legendaryPets: pets.filter((pet: Pet) => pet.isLegendary).length,
    totalValue: petValue,
    huntsCompleted: profile.stats.huntsCompleted,
    battlesWon: profile.stats.battlesWon,
    totalEarnings: profile.stats.totalEarnings,
  })
)
