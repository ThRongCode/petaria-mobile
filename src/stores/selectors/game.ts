import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Pet, Region, Auction, Battle } from '../types/game'
import { OPPONENTS } from '@/constants/opponents'

// Base selectors
export const getGameState = (state: RootState) => state.game
export const getUserProfile = (state: RootState) => state.game.profile
export const getUserInventory = (state: RootState) => state.game.inventory
export const getAllPets = (state: RootState) => state.game.pets
export const getAllItems = (state: RootState) => state.game.items
export const getAllRegions = (state: RootState) => state.game.regions
export const getAllOpponents = () => OPPONENTS // Now returns constant instead of state
export const getAllAuctions = (state: RootState) => state.game.auctions
export const getAllBattles = (state: RootState) => state.game.battles
export const getActiveBattle = (state: RootState) => state.game.activeBattle
export const getNotifications = (state: RootState) => state.game.notifications
export const getHuntingCooldowns = (state: RootState) => state.game.huntingCooldowns

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
  (allPets, inventory) => 
    allPets.filter(pet => inventory.pets.includes(pet.id))
)

export const getPetById = (petId: string) => createSelector(
  getAllPets,
  (pets) => pets.find(pet => pet.id === petId)
)

export const getOwnedPetsByRarity = createSelector(
  getOwnedPets,
  (pets) => {
    const grouped = pets.reduce((acc, pet) => {
      if (!acc[pet.rarity]) acc[pet.rarity] = []
      acc[pet.rarity].push(pet)
      return acc
    }, {} as Record<string, Pet[]>)
    
    return grouped
  }
)

export const getLegendaryPets = createSelector(
  getOwnedPets,
  (pets) => pets.filter(pet => pet.isLegendary)
)

export const getPetsReadyToEvolve = createSelector(
  [getOwnedPets, getUserInventory, getAllItems],
  (pets, inventory, items) => 
    pets.filter(pet => {
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
  (allItems, inventory) => 
    allItems.filter(item => (inventory.items[item.id] || 0) > 0)
      .map(item => ({
        ...item,
        quantity: inventory.items[item.id] || 0
      }))
)

export const getItemById = (itemId: string) => createSelector(
  getAllItems,
  (items) => items.find(item => item.id === itemId)
)

export const getItemQuantity = (itemId: string) => createSelector(
  getUserInventory,
  (inventory) => inventory.items[itemId] || 0
)

// Region selectors
export const getAvailableRegions = createSelector(
  [getAllRegions, getUserProfile],
  (regions, profile) => 
    regions.filter(region => profile.level >= region.unlockLevel)
)

export const getRegionById = (regionId: string) => createSelector(
  getAllRegions,
  (regions) => regions.find(region => region.id === regionId)
)

export const getOwnedLegendRegions = createSelector(
  [getAllRegions, getUserProfile],
  (regions, profile) => 
    regions.filter(region => region.legendOwnerId === profile.id)
)

export const getRegionHuntingCost = (regionId: string) => createSelector(
  [getRegionById(regionId), getAllRegions],
  (region) => {
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
  [getUserProfile],
  (profile) => {
    const opponents = getAllOpponents()
    if (!opponents || !profile) return []
    return opponents.filter(opponent => profile.level >= opponent.unlockLevel)
  }
)

export const getOpponentById = (opponentId: string) => {
  const opponents = getAllOpponents()
  return opponents.find(opponent => opponent.id === opponentId)
}

export const getOpponentsByDifficulty = createSelector(
  [getUserProfile],
  (profile) => {
    const opponents = getAvailableOpponents.resultFunc(profile)
    if (!opponents) return {}
    const grouped = opponents.reduce((acc, opponent) => {
      if (!acc[opponent.difficulty]) acc[opponent.difficulty] = []
      acc[opponent.difficulty].push(opponent)
      return acc
    }, {} as Record<string, typeof opponents>)
    
    return grouped
  }
)

// Battle selectors
export const getRecentBattles = createSelector(
  getAllBattles,
  (battles) => 
    battles
      .filter(battle => battle.status === 'completed')
      .sort((a, b) => b.createdAt - a.createdAt)
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

// Auction selectors
export const getActiveAuctions = createSelector(
  getAllAuctions,
  (auctions) => 
    auctions.filter(auction => 
      auction.status === 'active' && auction.endTime > Date.now()
    )
)

export const getMyAuctionListings = createSelector(
  [getAllAuctions, getUserProfile],
  (auctions, profile) => 
    auctions.filter(auction => auction.sellerId === profile.id)
)

export const getMyActiveBids = createSelector(
  [getAllAuctions, getUserProfile],
  (auctions, profile) => 
    auctions.filter(auction => 
      auction.status === 'active' && 
      auction.currentBidderId === profile.id
    )
)

export const getAuctionsByCategory = createSelector(
  getActiveAuctions,
  (auctions) => ({
    pets: auctions.filter(auction => auction.itemType === 'pet'),
    items: auctions.filter(auction => auction.itemType === 'item'),
  })
)

export const getEndingSoonAuctions = createSelector(
  getActiveAuctions,
  (auctions) => 
    auctions
      .filter(auction => auction.endTime - Date.now() < 3600000) // 1 hour
      .sort((a, b) => a.endTime - b.endTime)
)

// Notification selectors
export const getUnreadNotifications = createSelector(
  getNotifications,
  (notifications) => notifications.filter(notif => !notif.read)
)

export const getNotificationCount = createSelector(
  getUnreadNotifications,
  (notifications) => notifications.length
)

export const getNotificationsByType = createSelector(
  getNotifications,
  (notifications) => 
    notifications.reduce((acc, notif) => {
      if (!acc[notif.type]) acc[notif.type] = []
      acc[notif.type].push(notif)
      return acc
    }, {} as Record<string, typeof notifications>)
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
  (pets) => 
    pets.reduce((total, pet) => {
      // Basic value calculation based on level and rarity
      const baseValue = pet.level * 100
      const rarityMultiplier = {
        'Common': 1,
        'Rare': 2,
        'Epic': 4,
        'Legendary': 8
      }[pet.rarity] || 1
      
      return total + (baseValue * rarityMultiplier)
    }, 0)
)

export const getGameStats = createSelector(
  [getUserProfile, getOwnedPets, getTotalPetValue],
  (profile, pets, petValue) => ({
    level: profile.level,
    totalPets: pets.length,
    legendaryPets: pets.filter(pet => pet.isLegendary).length,
    totalValue: petValue,
    huntsCompleted: profile.stats.huntsCompleted,
    battlesWon: profile.stats.battlesWon,
    auctionsSold: profile.stats.auctionsSold,
    totalEarnings: profile.stats.totalEarnings,
  })
)
