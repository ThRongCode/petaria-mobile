/**
 * Mock API Service
 * Simulates backend API responses for development
 * Replace with real API calls when backend is ready
 */

import { mockDB } from './mockDatabase'
import { OPPONENTS } from '@/constants/opponents'
import { getPokemonImage } from '@/assets/images'
import { Pet, Region, Item, Auction, Battle } from '@/stores/types/game'
import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  HuntStartRequest,
  HuntCompleteRequest,
  HuntResponse,
  BattleStartRequest,
  BattleCompleteRequest,
  BattleCompleteResponse,
  CreateAuctionRequest,
  PlaceBidRequest,
  ApiError,
} from './types'
import { API_CONFIG } from './config'

/**
 * Console logger with colors and emojis for mock API
 */
class MockApiLogger {
  private enabled = __DEV__ // Only log in development

  private log(emoji: string, label: string, message: string, data?: any) {
    if (!this.enabled) return
    console.log(`${emoji} [MOCK API] ${label} ${message}`)
    if (data) console.log('   ', data)
  }

  request(method: string, endpoint: string, data?: any) {
    if (!this.enabled) return
    const emoji = method === 'POST' ? '📤' : method === 'GET' ? '📥' : method === 'PUT' ? '✏️' : '🗑️'
    console.log(`\n${emoji} [MOCK API] ${method} ${endpoint}`)
    if (data && Object.keys(data).length > 0) {
      console.log('   📋 Request:', data)
    }
  }

  response(data: any) {
    if (!this.enabled) return
    console.log('   ✅ Response Success')
    
    // Log useful summary of response data
    if (data) {
      if (Array.isArray(data)) {
        console.log(`   📦 Array with ${data.length} items:`)
        if (data.length > 0 && data.length <= 10) {
          data.forEach((item: any, idx: number) => {
            const label = item.name || item.title || item.username || item.id || `Item ${idx + 1}`
            console.log(`      ${idx + 1}. ${label}`)
          })
        }
      } else if (typeof data === 'object') {
        console.log('   📦 Response data:')
        // Show key properties
        if (data.name) console.log(`      name: ${data.name}`)
        if (data.username) console.log(`      username: ${data.username}`)
        if (data.title) console.log(`      title: ${data.title}`)
        if (data.level !== undefined) console.log(`      level: ${data.level}`)
        if (data.coins !== undefined) console.log(`      coins: ${data.coins}`)
        if (data.email) console.log(`      email: ${data.email}`)
      }
    }
  }

  error(message: string, code: string) {
    if (!this.enabled) return
    console.log(`   ❌ Error [${code}]: ${message}`)
  }

  dbUpdate(entity: string, action: string, details: any) {
    if (!this.enabled) return
    console.log(`   💾 [DB] ${entity} - ${action}`)
    console.log('   ', details)
  }

  stateChange(description: string, before: any, after: any) {
    if (!this.enabled) return
    console.log(`   📊 ${description}`)
    console.log('      Before:', before)
    console.log('      After: ', after)
  }

  highlight(message: string) {
    if (!this.enabled) return
    console.log(`   🎉 ${message}`)
  }

  separator() {
    if (!this.enabled) return
    console.log('   ' + '─'.repeat(50))
  }
}

const logger = new MockApiLogger()

class MockApiService {
  /**
   * Simulate network delay
   */
  private async delay(): Promise<void> {
    const { min, max } = API_CONFIG.mockDelay
    const delay = Math.random() * (max - min) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Simulate API response wrapper
   */
  private async respond<T>(data: T, shouldDelay = true): Promise<ApiResponse<T>> {
    if (shouldDelay) {
      await this.delay()
    }

    return {
      success: true,
      data,
    }
  }

  /**
   * Simulate API error
   */
  private async respondError(message: string, code: string, status: number): Promise<never> {
    await this.delay()
    throw new ApiError(code, message, status)
  }

  /**
   * Apply XP to pet and handle leveling up
   */
  private applyXpToPet(petId: string, xpGained: number): Pet | null {
    const pet = mockDB.getPet(petId)
    if (!pet) return null

    const oldLevel = pet.level
    const oldXp = pet.xp

    let currentXp = pet.xp + xpGained
    let currentLevel = pet.level
    let xpToNext = pet.xpToNext
    let leveledUp = false

    // Check for level up (can level up multiple times)
    while (currentXp >= xpToNext) {
      currentXp -= xpToNext
      currentLevel += 1
      leveledUp = true
      xpToNext = Math.floor(xpToNext * 1.2) // Each level requires 20% more XP
    }

    // Calculate stat increases if leveled up
    const statIncreases = leveledUp ? {
      hp: pet.stats.maxHp + (currentLevel - pet.level) * 5,
      maxHp: pet.stats.maxHp + (currentLevel - pet.level) * 5,
      attack: pet.stats.attack + (currentLevel - pet.level) * 3,
      defense: pet.stats.defense + (currentLevel - pet.level) * 3,
      speed: pet.stats.speed + (currentLevel - pet.level) * 2,
    } : pet.stats

    // Update pet in database
    const updatedPet = mockDB.updatePet(petId, {
      level: currentLevel,
      xp: currentXp,
      xpToNext,
      stats: statIncreases,
    })

    // Log the XP gain and potential level up
    if (leveledUp) {
      logger.highlight(`${pet.name} leveled up! ${oldLevel} → ${currentLevel}`)
      logger.stateChange(
        `${pet.name} Stats`,
        { level: oldLevel, hp: pet.stats.hp, attack: pet.stats.attack },
        { level: currentLevel, hp: statIncreases.hp, attack: statIncreases.attack }
      )
    } else {
      logger.dbUpdate('Pet XP', 'Gained XP', {
        pet: pet.name,
        xpGained,
        progress: `${currentXp}/${xpToNext}`,
      })
    }

    return updatedPet
  }

  // ==================== AUTH ====================

  async login(req: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    logger.request('POST', '/auth/login', { email: req.email })

    const result = mockDB.login(req.email, req.password)
    
    if (!result) {
      logger.error('Invalid credentials', 'AUTH_INVALID')
      return this.respondError('Invalid email or password', 'AUTH_INVALID', 401)
    }

    logger.dbUpdate('Session', 'Created', { userId: result.user.id, username: result.user.username })
    logger.highlight(`Welcome back, ${result.user.username}!`)

    return this.respond<AuthResponse>({
      token: result.token,
      userId: result.user.id,
      username: result.user.username,
      email: result.user.email,
    })
  }

  async register(req: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    console.log('[Mock API] POST /api/auth/register', req)

    const result = mockDB.register(req.email, req.password, req.username)

    return this.respond<AuthResponse>({
      token: result.token,
      userId: result.user.id,
      username: result.user.username,
      email: result.user.email,
    })
  }

  async validateToken(token: string): Promise<ApiResponse<{ userId: string }>> {
    console.log('[Mock API] GET /api/auth/validate')

    const userId = mockDB.validateToken(token)
    
    if (!userId) {
      return this.respondError('Invalid or expired token', 'AUTH_INVALID_TOKEN', 401)
    }

    return this.respond({ userId })
  }

  // ==================== USER ====================

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    console.log('[Mock API] GET /api/user/profile', { userId })

    const user = mockDB.getUser(userId)
    
    if (!user) {
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    return this.respond(user)
  }

  async updateUserProfile(userId: string, updates: any): Promise<ApiResponse<any>> {
    console.log('[Mock API] PATCH /api/user/profile', { userId, updates })

    const user = mockDB.updateUser(userId, updates)
    
    if (!user) {
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    return this.respond(user)
  }

  async getUserInventory(userId: string): Promise<ApiResponse<any>> {
    console.log('[Mock API] GET /api/user/inventory', { userId })

    const pets = mockDB.getUserPets(userId)
    const user = mockDB.getUser(userId)
    
    if (!user) {
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    return this.respond({
      pets: pets.map(p => p.id),
      items: { 'item-heal-001': 5 },
      maxPetSlots: 20,
      maxItemSlots: 100,
    })
  }

  // ==================== PETS ====================

  async getUserPets(userId: string): Promise<ApiResponse<Pet[]>> {
    console.log('[Mock API] GET /api/user/pets', { userId })

    const pets = mockDB.getUserPets(userId)
    return this.respond(pets)
  }

  async getPetDetails(petId: string): Promise<ApiResponse<Pet>> {
    console.log('[Mock API] GET /api/user/pets/:id', { petId })

    const pet = mockDB.getPet(petId)
    
    if (!pet) {
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    return this.respond(pet)
  }

  async updatePet(petId: string, updates: Partial<Pet>): Promise<ApiResponse<Pet>> {
    console.log('[Mock API] PATCH /api/user/pets/:id', { petId, updates })

    const pet = mockDB.updatePet(petId, updates)
    
    if (!pet) {
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    return this.respond(pet)
  }

  async feedPet(petId: string): Promise<ApiResponse<Pet>> {
    logger.request('POST', '/pets/feed', { petId })

    const pet = mockDB.getPet(petId)
    if (!pet) {
      logger.error('Pet not found', 'PET_NOT_FOUND')
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    const oldMood = pet.mood
    const newMood = Math.min(100, oldMood + 10)

    const updatedPet = mockDB.updatePet(petId, {
      mood: newMood,
      lastFed: Date.now(),
    })
    
    if (!updatedPet) {
      logger.error('Failed to update pet', 'UPDATE_FAILED')
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    logger.stateChange(`🍖 ${pet.name} Mood`, oldMood, newMood)
    logger.dbUpdate('Pet', 'Fed', { name: pet.name, mood: newMood })

    return this.respond(updatedPet)
  }

  // ==================== GAME CONTENT ====================

  async getRegions(): Promise<ApiResponse<Region[]>> {
    console.log('[Mock API] GET /api/game/regions')

    // In real API, this would come from database
    const regions: Region[] = [
      {
        id: 'region-001',
        name: 'Mystic Forest',
        description: 'A magical forest where grass and bug type pets thrive',
        huntingCost: 100,
        legendFee: 50,
        legendPetId: 'pet-legend-001',
        legendOwnerId: 'user-001',
        availablePets: [
          { petSpecies: 'Bulbasaur', rarity: 'Common' as const, spawnRate: 0.3 },
          { petSpecies: 'Caterpie', rarity: 'Common' as const, spawnRate: 0.25 },
          { petSpecies: 'Oddish', rarity: 'Common' as const, spawnRate: 0.2 },
          { petSpecies: 'Bellsprout', rarity: 'Rare' as const, spawnRate: 0.15 },
          { petSpecies: 'Scyther', rarity: 'Rare' as const, spawnRate: 0.08 },
          { petSpecies: 'Celebi', rarity: 'Legendary' as const, spawnRate: 0.02 },
        ],
        exclusivePets: ['Celebi'],
        image: 'https://via.placeholder.com/200/4CAF50/FFFFFF?text=🌲',
        unlockLevel: 1,
      },
      {
        id: 'region-002',
        name: 'Crystal Caves',
        description: 'Deep underground caves filled with rock and ground type pets',
        huntingCost: 200,
        legendFee: 75,
        legendPetId: 'pet-legend-002',
        legendOwnerId: undefined,
        availablePets: [
          { petSpecies: 'Geodude', rarity: 'Common' as const, spawnRate: 0.3 },
          { petSpecies: 'Onix', rarity: 'Rare' as const, spawnRate: 0.2 },
          { petSpecies: 'Rhyhorn', rarity: 'Rare' as const, spawnRate: 0.15 },
        ],
        exclusivePets: [],
        image: 'https://via.placeholder.com/200/95A5A6/FFFFFF?text=⛏️',
        unlockLevel: 5,
      },
    ]

    return this.respond(regions)
  }

  async getOpponents(): Promise<ApiResponse<any[]>> {
    console.log('[Mock API] GET /api/game/opponents')

    return this.respond(OPPONENTS)
  }

  async getItemsCatalog(): Promise<ApiResponse<Item[]>> {
    console.log('[Mock API] GET /api/game/items/catalog')

    const items: Item[] = [
      // Healing Items
      {
        id: 'item-heal-001',
        name: 'Potion',
        description: 'Restores 50 HP to a Pokemon',
        type: 'Consumable',
        rarity: 'Common',
        effects: { hp: 50, permanent: false },
        price: { coins: 100 },
        image: 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=🧪',
      },
      {
        id: 'item-heal-002',
        name: 'Super Potion',
        description: 'Restores 100 HP to a Pokemon',
        type: 'Consumable',
        rarity: 'Rare',
        effects: { hp: 100, permanent: false },
        price: { coins: 250 },
        image: 'https://via.placeholder.com/80/2196F3/FFFFFF?text=🧪',
      },
      {
        id: 'item-heal-003',
        name: 'Hyper Potion',
        description: 'Restores 200 HP to a Pokemon',
        type: 'Consumable',
        rarity: 'Epic',
        effects: { hp: 200, permanent: false },
        price: { coins: 500 },
        image: 'https://via.placeholder.com/80/9C27B0/FFFFFF?text=🧪',
      },
      {
        id: 'item-heal-004',
        name: 'Max Potion',
        description: 'Fully restores HP to a Pokemon',
        type: 'Consumable',
        rarity: 'Legendary',
        effects: { hp: 999, permanent: false },
        price: { gems: 10 },
        image: 'https://via.placeholder.com/80/FFD700/FFFFFF?text=🧪',
      },
      // Stat Boost Items
      {
        id: 'item-boost-001',
        name: 'Protein',
        description: 'Permanently increases Attack by 5',
        type: 'StatBoost',
        rarity: 'Rare',
        effects: { attack: 5, permanent: true },
        price: { coins: 1000 },
        image: 'https://via.placeholder.com/80/F44336/FFFFFF?text=💪',
      },
      {
        id: 'item-boost-002',
        name: 'Iron',
        description: 'Permanently increases Defense by 5',
        type: 'StatBoost',
        rarity: 'Rare',
        effects: { defense: 5, permanent: true },
        price: { coins: 1000 },
        image: 'https://via.placeholder.com/80/607D8B/FFFFFF?text=🛡️',
      },
      {
        id: 'item-boost-003',
        name: 'Carbos',
        description: 'Permanently increases Speed by 5',
        type: 'StatBoost',
        rarity: 'Rare',
        effects: { speed: 5, permanent: true },
        price: { coins: 1000 },
        image: 'https://via.placeholder.com/80/FFC107/FFFFFF?text=⚡',
      },
      {
        id: 'item-boost-004',
        name: 'HP Up',
        description: 'Permanently increases HP by 10',
        type: 'StatBoost',
        rarity: 'Rare',
        effects: { hp: 10, permanent: true },
        price: { coins: 1000 },
        image: 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=❤️',
      },
      // Evolution Stones
      {
        id: 'item-evo-001',
        name: 'Fire Stone',
        description: 'Evolves certain Fire-type Pokemon',
        type: 'Evolution',
        rarity: 'Epic',
        effects: { permanent: true },
        price: { gems: 50 },
        image: 'https://via.placeholder.com/80/F44336/FFFFFF?text=🔥',
      },
      {
        id: 'item-evo-002',
        name: 'Water Stone',
        description: 'Evolves certain Water-type Pokemon',
        type: 'Evolution',
        rarity: 'Epic',
        effects: { permanent: true },
        price: { gems: 50 },
        image: 'https://via.placeholder.com/80/2196F3/FFFFFF?text=💧',
      },
      {
        id: 'item-evo-003',
        name: 'Thunder Stone',
        description: 'Evolves certain Electric-type Pokemon',
        type: 'Evolution',
        rarity: 'Epic',
        effects: { permanent: true },
        price: { gems: 50 },
        image: 'https://via.placeholder.com/80/FFC107/FFFFFF?text=⚡',
      },
      {
        id: 'item-evo-004',
        name: 'Leaf Stone',
        description: 'Evolves certain Grass-type Pokemon',
        type: 'Evolution',
        rarity: 'Epic',
        effects: { permanent: true },
        price: { gems: 50 },
        image: 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=🍃',
      },
      {
        id: 'item-evo-005',
        name: 'Moon Stone',
        description: 'Evolves certain Fairy-type Pokemon',
        type: 'Evolution',
        rarity: 'Epic',
        effects: { permanent: true },
        price: { gems: 50 },
        image: 'https://via.placeholder.com/80/E91E63/FFFFFF?text=🌙',
      },
      // XP Boosters
      {
        id: 'item-xp-001',
        name: 'Rare Candy',
        description: 'Grants 1000 XP to a Pokemon',
        type: 'Consumable',
        rarity: 'Epic',
        effects: { xpBoost: 1000, permanent: false },
        price: { gems: 25 },
        image: 'https://via.placeholder.com/80/9C27B0/FFFFFF?text=🍬',
      },
    ]

    return this.respond(items)
  }

  // ==================== HUNTING ====================

  async startHunt(req: HuntStartRequest, userId: string): Promise<ApiResponse<HuntResponse>> {
    logger.request('POST', '/hunt/start', { regionId: req.regionId, userId })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    const regions = (await this.getRegions()).data!
    const region = regions.find(r => r.id === req.regionId)
    
    if (!region) {
      logger.error('Region not found', 'REGION_NOT_FOUND')
      return this.respondError('Region not found', 'REGION_NOT_FOUND', 404)
    }

    if (user.currency.coins < region.huntingCost) {
      logger.error(`Insufficient coins. Need ${region.huntingCost}, have ${user.currency.coins}`, 'INSUFFICIENT_FUNDS')
      return this.respondError('Insufficient coins', 'INSUFFICIENT_FUNDS', 400)
    }

    const oldCoins = user.currency.coins
    const newCoins = oldCoins - region.huntingCost

    // Deduct cost
    mockDB.updateUser(userId, {
      currency: {
        ...user.currency,
        coins: newCoins,
      },
    })

    logger.stateChange('💰 Coins', oldCoins, newCoins)
    logger.dbUpdate('User', 'Deducted hunting cost', { region: region.name, cost: region.huntingCost })

    // Simulate pet catch (50% chance)
    const caught = Math.random() > 0.5
    let caughtPet: Pet | undefined

    if (caught) {
      // Random pet from region
      const randomPet = region.availablePets[
        Math.floor(Math.random() * region.availablePets.length)
      ]

      caughtPet = {
        id: `pet-${Date.now()}`,
        species: randomPet.petSpecies,
        name: randomPet.petSpecies,
        rarity: randomPet.rarity,
        level: Math.floor(Math.random() * 5) + 1,
        xp: 0,
        xpToNext: 100,
        stats: {
          hp: 30 + Math.floor(Math.random() * 20),
          maxHp: 30 + Math.floor(Math.random() * 20),
          attack: 20 + Math.floor(Math.random() * 15),
          defense: 15 + Math.floor(Math.random() * 15),
          speed: 20 + Math.floor(Math.random() * 15),
        },
        moves: [],
        image: getPokemonImage(randomPet.petSpecies),
        evolutionStage: 1,
        maxEvolutionStage: 3,
        isLegendary: randomPet.rarity === 'Legendary',
        ownerId: userId,
        isForSale: false,
        mood: 100,
        lastFed: Date.now(),
      }

      mockDB.addPet(userId, caughtPet)
      
      logger.highlight(`🎉 Caught ${caughtPet.name}! (Level ${caughtPet.level}, ${caughtPet.rarity})`)
      logger.dbUpdate('Pet', 'Added to collection', {
        id: caughtPet.id,
        name: caughtPet.name,
        level: caughtPet.level,
        rarity: caughtPet.rarity,
      })
    } else {
      logger.dbUpdate('Hunt', 'No catch', { region: region.name })
    }

    // Set cooldown
    const cooldownEnd = Date.now() + 30000 // 30 seconds

    const updatedUser = mockDB.getUser(userId)!

    return this.respond<HuntResponse>({
      success: caught,
      petCaught: caughtPet,
      xpGained: caught ? 25 : 10,
      cooldownEnd,
      updatedCoins: updatedUser.currency.coins,
    })
  }

  // ==================== BATTLE ====================

  async completeBattle(req: BattleCompleteRequest, userId: string): Promise<ApiResponse<BattleCompleteResponse>> {
    logger.request('POST', '/battle/complete', { 
      battleId: req.battleId, 
      winner: req.winner,
      petId: req.playerPetId,
    })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    const opponent = OPPONENTS.find(o => o.id === req.opponentId)
    if (!opponent) {
      logger.error('Opponent not found', 'OPPONENT_NOT_FOUND')
      return this.respondError('Opponent not found', 'OPPONENT_NOT_FOUND', 404)
    }

    // Calculate rewards
    const rewards = req.winner === 'player' ? {
      coins: opponent.rewards.coins,
      xp: opponent.rewards.xp,
      items: opponent.rewards.items,
    } : {
      coins: 0,
      xp: 5,
      items: [],
    }

    const oldCoins = user.currency.coins
    const newCoins = oldCoins + rewards.coins
    const oldWins = user.stats.battlesWon
    const oldLosses = user.stats.battlesLost

    // Update user stats and currency
    const updatedUser = mockDB.updateUser(userId, {
      currency: {
        coins: newCoins,
        gems: user.currency.gems,
      },
      stats: {
        ...user.stats,
        battlesWon: req.winner === 'player' ? oldWins + 1 : oldWins,
        battlesLost: req.winner === 'opponent' ? oldLosses + 1 : oldLosses,
      },
    })!

    if (req.winner === 'player') {
      logger.highlight(`🎊 Victory against ${opponent.name}!`)
      logger.stateChange('💰 Coins', oldCoins, newCoins)
      logger.stateChange('🏆 Battle Stats', 
        { wins: oldWins, losses: oldLosses },
        { wins: oldWins + 1, losses: oldLosses }
      )
    } else {
      logger.dbUpdate('Battle', 'Defeated', { opponent: opponent.name })
      logger.stateChange('Battle Stats',
        { wins: oldWins, losses: oldLosses },
        { wins: oldWins, losses: oldLosses + 1 }
      )
    }

    // Apply XP to the pet that battled
    const updatedPet = this.applyXpToPet(req.playerPetId, rewards.xp)
    if (!updatedPet) {
      logger.error(`Pet ${req.playerPetId} not found`, 'PET_NOT_FOUND')
    }

    // Create battle record
    const battle: Battle = {
      id: req.battleId,
      type: 'PvE',
      attacker: {
        userId,
        petId: req.playerPetId,
        username: user.username,
      },
      defender: {
        userId: 'system',
        petId: req.opponentId,
        username: opponent.name,
      },
      result: {
        winner: req.winner === 'player' ? 'attacker' : 'defender',
        rewards,
        battleLog: req.battleLog,
      },
      status: 'completed',
      createdAt: Date.now(),
    }

    mockDB.createBattle(battle)
    logger.dbUpdate('Battle', 'Recorded', { id: battle.id, winner: req.winner })

    return this.respond<BattleCompleteResponse>({
      rewards,
      updatedProfile: updatedUser,
      battle,
    })
  }

  async getBattleHistory(userId: string): Promise<ApiResponse<Battle[]>> {
    console.log('[Mock API] GET /api/battle/history', { userId })

    const battles = mockDB.getUserBattles(userId)
    return this.respond(battles)
  }

  // ==================== AUCTION ====================

  async getActiveAuctions(): Promise<ApiResponse<Auction[]>> {
    console.log('[Mock API] GET /api/auction/active')

    const auctions = mockDB.getActiveAuctions()
    return this.respond(auctions)
  }

  async createAuction(req: CreateAuctionRequest, userId: string): Promise<ApiResponse<Auction>> {
    logger.request('POST', '/auction/create', { 
      itemType: req.itemType, 
      itemId: req.itemId,
      startingBid: req.startingBid,
    })

    const auction: Auction = {
      id: `auction-${Date.now()}`,
      itemType: req.itemType as 'pet' | 'item',
      itemId: req.itemId,
      sellerId: userId,
      sellerUsername: mockDB.getUser(userId)?.username || 'Unknown',
      startingBid: req.startingBid,
      currentBid: req.startingBid,
      buyoutPrice: req.buyoutPrice,
      bids: [],
      status: 'active',
      commission: Math.floor(req.startingBid * 0.05), // 5% commission
      createdAt: Date.now(),
      endTime: Date.now() + req.duration * 60 * 60 * 1000,
    }

    mockDB.createAuction(auction)
    
    logger.highlight(`🏪 Auction created for ${req.itemType}`)
    logger.dbUpdate('Auction', 'Created', {
      id: auction.id,
      startingBid: auction.startingBid,
      buyoutPrice: auction.buyoutPrice,
    })

    return this.respond(auction)
  }

  async placeBid(req: PlaceBidRequest, userId: string): Promise<ApiResponse<Auction>> {
    logger.request('POST', '/auction/bid', { auctionId: req.auctionId, amount: req.amount })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    if (user.currency.coins < req.amount) {
      logger.error(`Insufficient coins. Need ${req.amount}, have ${user.currency.coins}`, 'INSUFFICIENT_FUNDS')
      return this.respondError('Insufficient coins', 'INSUFFICIENT_FUNDS', 400)
    }

    const auction = mockDB.updateAuction(req.auctionId, {
      currentBid: req.amount,
      bids: [
        {
          id: `bid-${Date.now()}`,
          bidderId: userId,
          bidderUsername: user.username,
          amount: req.amount,
          timestamp: Date.now(),
        },
      ],
    })

    if (!auction) {
      logger.error('Auction not found', 'AUCTION_NOT_FOUND')
      return this.respondError('Auction not found', 'AUCTION_NOT_FOUND', 404)
    }

    logger.highlight(`💰 Bid placed!`)
    logger.stateChange('Auction Bid', auction.currentBid - req.amount, req.amount)
    logger.dbUpdate('Auction', 'Bid placed', {
      auctionId: req.auctionId,
      bidder: user.username,
      amount: req.amount,
    })

    return this.respond(auction)
  }

  // ==================== ITEMS ====================

  async useItemOnPet(
    itemId: string,
    petId: string,
    userId: string
  ): Promise<ApiResponse<{ pet: Pet; message: string }>> {
    console.log('[Mock API] POST /api/game/items/use', { itemId, petId, userId })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    // Get item from catalog
    const itemsCatalog = (await this.getItemsCatalog()).data!
    const item = itemsCatalog.find(i => i.id === itemId)
    if (!item) {
      logger.error('Item not found', 'ITEM_NOT_FOUND')
      return this.respondError('Item not found', 'ITEM_NOT_FOUND', 404)
    }

    // Check if user has the item (for now we'll skip inventory check for demo)
    // TODO: Implement proper inventory system

    // Get the pet
    const pet = mockDB.getPet(petId)
    if (!pet) {
      logger.error('Pet not found', 'PET_NOT_FOUND')
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    if (pet.ownerId !== userId) {
      logger.error('Pet does not belong to user', 'FORBIDDEN')
      return this.respondError('Pet does not belong to user', 'FORBIDDEN', 403)
    }

    let message = ''
    const updatedStats = { ...pet.stats }

    // Apply item effects based on type
    switch (item.type) {
      case 'Consumable':
        if (item.effects.hp) {
          const oldHp = updatedStats.hp
          const maxHp = updatedStats.hp + 100 // Assuming max HP is current + 100 for demo
          updatedStats.hp = Math.min(updatedStats.hp + item.effects.hp, maxHp)
          message = `${pet.name} restored ${updatedStats.hp - oldHp} HP!`
          logger.highlight(`💚 Healed ${pet.name}`)
          logger.stateChange('HP', oldHp, updatedStats.hp)
        }
        if (item.effects.xpBoost) {
          const oldXp = pet.xp
          const newXp = oldXp + item.effects.xpBoost
          const updatedPet = this.applyXpToPet(petId, item.effects.xpBoost)
          if (updatedPet) {
            message = `${pet.name} gained ${item.effects.xpBoost} XP!`
            logger.highlight(`⭐ XP Boost for ${pet.name}`)
            logger.stateChange('XP', oldXp, newXp)
            return this.respond({ pet: updatedPet, message })
          }
        }
        break

      case 'StatBoost':
        const statChanges: string[] = []
        if (item.effects.attack) {
          updatedStats.attack += item.effects.attack
          statChanges.push(`ATK +${item.effects.attack}`)
          logger.stateChange('Attack', pet.stats.attack, updatedStats.attack)
        }
        if (item.effects.defense) {
          updatedStats.defense += item.effects.defense
          statChanges.push(`DEF +${item.effects.defense}`)
          logger.stateChange('Defense', pet.stats.defense, updatedStats.defense)
        }
        if (item.effects.speed) {
          updatedStats.speed += item.effects.speed
          statChanges.push(`SPD +${item.effects.speed}`)
          logger.stateChange('Speed', pet.stats.speed, updatedStats.speed)
        }
        if (item.effects.hp && item.effects.permanent) {
          updatedStats.hp += item.effects.hp
          statChanges.push(`HP +${item.effects.hp}`)
          logger.stateChange('Max HP', pet.stats.hp, updatedStats.hp)
        }
        message = `${pet.name}'s stats increased! ${statChanges.join(', ')}`
        logger.highlight(`📈 Stat Boost for ${pet.name}`)
        break

      case 'Evolution':
        // Evolution logic - for demo, we'll append "Evolved" to the species
        const evolutionMap: Record<string, string> = {
          'Pikachu': 'Raichu',
          'Charmander': 'Charmeleon',
          'Squirtle': 'Wartortle',
          'Bulbasaur': 'Ivysaur',
          'Eevee': 'Vaporeon', // Water Stone
          'Oddish': 'Gloom',
          'Pidgey': 'Pidgeotto',
        }
        
        const evolvedSpecies = evolutionMap[pet.species] || `${pet.species} (Evolved)`
        const oldSpecies = pet.species
        
        const updatedPet = mockDB.updatePet(petId, {
          species: evolvedSpecies,
          stats: {
            ...updatedStats,
            attack: updatedStats.attack + 10,
            defense: updatedStats.defense + 10,
            speed: updatedStats.speed + 5,
            hp: updatedStats.hp + 20,
          },
        })

        if (updatedPet) {
          message = `Congratulations! ${pet.name} evolved into ${evolvedSpecies}!`
          logger.highlight(`🌟 EVOLUTION! ${oldSpecies} → ${evolvedSpecies}`)
          logger.dbUpdate('Pet', 'Evolved', {
            oldSpecies,
            newSpecies: evolvedSpecies,
            statBonus: '+10 ATK, +10 DEF, +5 SPD, +20 HP',
          })
          return this.respond({ pet: updatedPet, message })
        }
        break
    }

    // Update the pet with new stats
    const updatedPet = mockDB.updatePet(petId, { stats: updatedStats })
    if (!updatedPet) {
      logger.error('Failed to update pet', 'UPDATE_FAILED')
      return this.respondError('Failed to update pet', 'UPDATE_FAILED', 500)
    }

    logger.dbUpdate('Pet', 'Item Used', {
      pet: updatedPet.name,
      item: item.name,
      effect: message,
    })

    return this.respond({ pet: updatedPet, message })
  }

  // ==================== PET MANAGEMENT ====================

  async releasePet(
    petId: string,
    userId: string
  ): Promise<ApiResponse<{ message: string; rewards: { coins: number } }>> {
    console.log('[Mock API] POST /api/pets/release', { petId, userId })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    const pet = mockDB.getPet(petId)
    if (!pet) {
      logger.error('Pet not found', 'PET_NOT_FOUND')
      return this.respondError('Pet not found', 'PET_NOT_FOUND', 404)
    }

    if (pet.ownerId !== userId) {
      logger.error('Pet does not belong to user', 'FORBIDDEN')
      return this.respondError('Pet does not belong to user', 'FORBIDDEN', 403)
    }

    // Calculate release rewards based on pet level
    const releaseReward = pet.level * 50

    // Remove pet
    mockDB.deletePet(petId)

    // Give user coins as release reward
    const oldCoins = user.currency.coins
    const newCoins = oldCoins + releaseReward
    mockDB.updateUser(userId, {
      currency: {
        ...user.currency,
        coins: newCoins,
      },
      stats: {
        ...user.stats,
        petsOwned: user.stats.petsOwned - 1,
      },
    })

    logger.highlight(`💫 Released ${pet.name}`)
    logger.stateChange('Coins', oldCoins, newCoins)
    logger.dbUpdate('Pet', 'Released', {
      pet: pet.name,
      reward: releaseReward,
    })

    return this.respond({
      message: `${pet.name} was released! You received ${releaseReward} coins.`,
      rewards: { coins: releaseReward },
    })
  }

  // ==================== HEALING CENTER ====================

  async healAllPets(
    userId: string
  ): Promise<ApiResponse<{ message: string; healedCount: number }>> {
    console.log('[Mock API] POST /api/game/heal-center', { userId })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    // Get all user's pets
    const pets = mockDB.getUserPets(userId)
    let healedCount = 0

    // Heal each pet to full HP
    pets.forEach((pet) => {
      const maxHp = pet.stats.hp + 100 // Assuming max HP is current + 100
      if (pet.stats.hp < maxHp) {
        mockDB.updatePet(pet.id, {
          stats: {
            ...pet.stats,
            hp: maxHp,
          },
        })
        healedCount++
      }
    })

    logger.highlight(`💚 Healed all Pokemon at Healing Center`)
    logger.dbUpdate('Healing Center', 'Healed', {
      user: user.username,
      petsHealed: healedCount,
    })

    return this.respond({
      message: healedCount > 0 
        ? `All your Pokemon have been fully healed! (${healedCount} Pokemon restored)`
        : 'All your Pokemon are already at full health!',
      healedCount,
    })
  }

  // ==================== INVENTORY MANAGEMENT ====================

  async getInventoryInfo(
    userId: string
  ): Promise<ApiResponse<{
    pets: { current: number; max: number }
    items: { current: number; max: number }
  }>> {
    console.log('[Mock API] GET /api/inventory/info', { userId })

    const user = mockDB.getUser(userId)
    if (!user) {
      logger.error('User not found', 'USER_NOT_FOUND')
      return this.respondError('User not found', 'USER_NOT_FOUND', 404)
    }

    const pets = mockDB.getUserPets(userId)
    const inventory = await this.getUserInventory(userId)
    
    const itemCount = inventory.data?.items 
      ? Object.values(inventory.data.items as Record<string, number>).reduce((sum: number, qty: number) => sum + qty, 0)
      : 0

    return this.respond({
      pets: {
        current: pets.length,
        max: 100,
      },
      items: {
        current: itemCount,
        max: 500,
      },
    })
  }
}

// Singleton instance
export const mockApi = new MockApiService()
