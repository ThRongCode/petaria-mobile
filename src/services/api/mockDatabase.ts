/**
 * Mock In-Memory Database
 * Simulates backend database for development
 */

import { OPPONENTS } from '@/constants/opponents'
import { getPokemonImage } from '@/assets/images'
import { Pet, UserProfile, Region, Item, Auction, Battle, Move } from '@/stores/types/game'

class MockDatabase {
  private users: Map<string, any> = new Map()
  private pets: Map<string, Pet> = new Map()
  private userPets: Map<string, string[]> = new Map() // userId -> petIds
  private auctions: Map<string, Auction> = new Map()
  private battles: Map<string, Battle> = new Map()
  private sessions: Map<string, string> = new Map() // token -> userId

  constructor() {
    this.initializeDummyData()
  }

  private initializeDummyData() {
    // Create dummy user
    const dummyUserId = 'user-001'
    const dummyUser: UserProfile = {
      id: dummyUserId,
      username: 'TrainerAsh',
      email: 'ash@pokemon.com',
      avatar: 'https://via.placeholder.com/100/FF6B6B/FFFFFF?text=🎮',
      level: 12,
      xp: 2450,
      xpToNext: 3000,
      currency: { coins: 15750, gems: 245 },
      stats: {
        battlesWon: 67,
        battlesLost: 23,
        petsOwned: 8,
        legendPetsOwned: 0,
        huntsCompleted: 45,
        auctionsSold: 12,
        totalEarnings: 125000,
      },
      achievements: ['first_catch', 'battle_winner', 'collector'],
      settings: {
        notifications: true,
        autoFeed: false,
        battleAnimations: true,
      },
      lastLogin: Date.now(),
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    }

    this.users.set(dummyUserId, dummyUser)

    // Create dummy pets
    const dummyPets: Pet[] = [
      {
        id: 'pet-001',
        species: 'Pikachu',
        name: 'Pikachu',
        rarity: 'Common' as const,
        level: 15,
        xp: 450,
        xpToNext: 600,
        stats: {
          hp: 55,
          maxHp: 55,
          attack: 35,
          defense: 25,
          speed: 40,
        },
        moves: [],
        image: getPokemonImage('Pikachu'),
        evolutionStage: 1,
        maxEvolutionStage: 2,
        isLegendary: false,
        ownerId: dummyUserId,
        isForSale: false,
        mood: 85,
        lastFed: Date.now() - 7200000,
      },
      {
        id: 'pet-002',
        species: 'Charizard',
        name: 'Charizard',
        rarity: 'Rare' as const,
        level: 18,
        xp: 890,
        xpToNext: 1100,
        stats: {
          hp: 78,
          maxHp: 78,
          attack: 52,
          defense: 43,
          speed: 50,
        },
        moves: [],
        image: getPokemonImage('Charizard'),
        evolutionStage: 3,
        maxEvolutionStage: 3,
        isLegendary: false,
        ownerId: dummyUserId,
        isForSale: false,
        mood: 92,
        lastFed: Date.now() - 3600000,
      },
    ]

    dummyPets.forEach(pet => {
      this.pets.set(pet.id, pet)
    })

    this.userPets.set(dummyUserId, dummyPets.map(p => p.id))

    // Create dummy session
    this.sessions.set('dummy-token-12345', dummyUserId)
  }

  // Auth methods
  login(email: string, password: string): { token: string; user: UserProfile } | null {
    const user = Array.from(this.users.values()).find(u => u.email === email)
    if (user && password === 'password') { // Simple password check for demo
      const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      this.sessions.set(token, user.id)
      return { token, user }
    }
    return null
  }

  register(email: string, password: string, username: string): { token: string; user: UserProfile } {
    const userId = `user-${Date.now()}`
    const newUser: UserProfile = {
      id: userId,
      username,
      email,
      avatar: 'https://via.placeholder.com/100/4ECDC4/FFFFFF?text=👤',
      level: 1,
      xp: 0,
      xpToNext: 100,
      currency: { coins: 1000, gems: 50 },
      stats: {
        battlesWon: 0,
        battlesLost: 0,
        petsOwned: 0,
        legendPetsOwned: 0,
        huntsCompleted: 0,
        auctionsSold: 0,
        totalEarnings: 0,
      },
      achievements: [],
      settings: {
        notifications: true,
        autoFeed: false,
        battleAnimations: true,
      },
      lastLogin: Date.now(),
      createdAt: Date.now(),
    }

    this.users.set(userId, newUser)
    this.userPets.set(userId, [])

    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.sessions.set(token, userId)

    return { token, user: newUser }
  }

  validateToken(token: string): string | null {
    return this.sessions.get(token) || null
  }

  // User methods
  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null
  }

  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const user = this.users.get(userId)
    if (!user) return null

    const updatedUser = { ...user, ...updates }
    this.users.set(userId, updatedUser)
    return updatedUser
  }

  // Pet methods
  getUserPets(userId: string): Pet[] {
    const petIds = this.userPets.get(userId) || []
    return petIds.map(id => this.pets.get(id)).filter(Boolean) as Pet[]
  }

  addPet(userId: string, pet: Pet): void {
    this.pets.set(pet.id, pet)
    const userPets = this.userPets.get(userId) || []
    this.userPets.set(userId, [...userPets, pet.id])
  }

  updatePet(petId: string, updates: Partial<Pet>): Pet | null {
    const pet = this.pets.get(petId)
    if (!pet) return null

    const updatedPet = { ...pet, ...updates }
    this.pets.set(petId, updatedPet)
    return updatedPet
  }

  getPet(petId: string): Pet | null {
    return this.pets.get(petId) || null
  }

  // Auction methods
  getActiveAuctions(): Auction[] {
    return Array.from(this.auctions.values()).filter(
      a => a.status === 'active' && a.endTime > Date.now()
    )
  }

  createAuction(auction: Auction): Auction {
    this.auctions.set(auction.id, auction)
    return auction
  }

  updateAuction(auctionId: string, updates: Partial<Auction>): Auction | null {
    const auction = this.auctions.get(auctionId)
    if (!auction) return null

    const updated = { ...auction, ...updates }
    this.auctions.set(auctionId, updated)
    return updated
  }

  // Battle methods
  createBattle(battle: Battle): Battle {
    this.battles.set(battle.id, battle)
    return battle
  }

  updateBattle(battleId: string, updates: Partial<Battle>): Battle | null {
    const battle = this.battles.get(battleId)
    if (!battle) return null

    const updated = { ...battle, ...updates }
    this.battles.set(battleId, updated)
    return updated
  }

  getUserBattles(userId: string): Battle[] {
    return Array.from(this.battles.values())
      .filter(b => b.attacker.userId === userId || b.defender.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
  }

  // Delete pet
  deletePet(petId: string): boolean {
    const pet = this.pets.get(petId)
    if (!pet) return false

    // Remove from pets map
    this.pets.delete(petId)

    // Remove from userPets map
    const userPetIds = this.userPets.get(pet.ownerId) || []
    const updatedPetIds = userPetIds.filter(id => id !== petId)
    if (updatedPetIds.length > 0) {
      this.userPets.set(pet.ownerId, updatedPetIds)
    } else {
      this.userPets.delete(pet.ownerId)
    }

    return true
  }

  // Clear all data (for testing)
  reset(): void {
    this.users.clear()
    this.pets.clear()
    this.userPets.clear()
    this.auctions.clear()
    this.battles.clear()
    this.sessions.clear()
    this.initializeDummyData()
  }
}

// Singleton instance
export const mockDB = new MockDatabase()
