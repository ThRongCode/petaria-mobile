import { realApiClient } from './realApiClient'

/**
 * Pet API Service
 * Handles pet CRUD operations, feeding, and healing
 */
export const petApi = {
  /**
   * Get all user's pets
   */
  async getUserPets() {
    const response = await realApiClient.get<Array<{
      id: string
      ownerId: string
      species: string
      nickname: string | null
      rarity: string
      level: number
      xp: number
      hp: number
      maxHp: number
      attack: number
      defense: number
      speed: number
      // Individual Values (IVs)
      ivHp: number
      ivAttack: number
      ivDefense: number
      ivSpeed: number
      evolutionStage: number
      maxEvolutionStage: number
      canEvolve: boolean
      mood: number
      lastFed: string | null
      isForSale: boolean
      isFavorite: boolean
      createdAt: string
      updatedAt: string
      moves: Array<{
        moveId: string
        pp: number
        maxPp: number
        move: {
          id: string
          name: string
          type: string
          element: string
          power: number
          accuracy: number
          description: string
        }
      }>
    }>>('/pet')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get pet details by ID
   */
  async getPetDetails(petId: string) {
    const response = await realApiClient.get(`/pet/${petId}`)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Update pet (nickname, isForSale, etc.)
   */
  async updatePet(petId: string, data: { nickname?: string; isForSale?: boolean }) {
    const response = await realApiClient.patch(`/pet/${petId}`, data)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Feed pet to increase mood
   */
  async feedPet(petId: string) {
    const response = await realApiClient.post<{
      id: string
      mood: number
      lastFed: string
      moodIncreased: number
    }>(`/pet/${petId}/feed`)

    return {
      success: true,
      data: response,
      message: `Mood increased by ${response.moodIncreased}!`,
    }
  },

  /**
   * Heal pet using item
   */
  async healPet(petId: string, itemId: string) {
    const response = await realApiClient.post<{
      id: string
      hp: number
      healAmount: number
    }>(`/pet/${petId}/heal`, { itemId })

    return {
      success: true,
      data: response,
      message: `Healed ${response.healAmount} HP!`,
    }
  },

  /**
   * Release pet (delete)
   */
  async releasePet(petId: string) {
    const response = await realApiClient.delete<{
      message: string
    }>(`/pet/${petId}`)

    return {
      success: true,
      data: null,
      message: response.message,
    }
  },

  /**
   * Add pet to favorites
   */
  async addToFavorites(petId: string) {
    const response = await realApiClient.post<{
      message: string
      isFavorite: boolean
    }>(`/pet/${petId}/favorite`)

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Remove pet from favorites
   */
  async removeFromFavorites(petId: string) {
    const response = await realApiClient.delete<{
      message: string
      isFavorite: boolean
    }>(`/pet/${petId}/favorite`)

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Get favorite pets
   */
  async getFavoritePets() {
    const response = await realApiClient.get('/pet/favorites/list')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get evolution options for a pet
   * Returns available evolution paths and whether user has required items
   */
  async getEvolutionOptions(petId: string) {
    const response = await realApiClient.get<{
      petId: string
      species: string
      level: number
      canEvolve: boolean
      currentStage: number
      maxStage: number
      evolvesFrom: string | null
      availableEvolutions: Array<{
        evolvesTo: string
        levelRequired: number
        itemRequired: string | null
        description?: string
        hasItem: boolean
        itemQuantity: number | null
      }>
    }>(`/pet/${petId}/evolution`)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Evolve a pet using an evolution stone
   */
  async evolvePet(petId: string, itemId: string) {
    const response = await realApiClient.post<{
      message: string
      previousSpecies: string
      newSpecies: string
      pet: {
        id: string
        species: string
        evolutionStage: number
        maxHp: number
        hp: number
        attack: number
        defense: number
        speed: number
      }
      itemUsed: string
      statsChanged: {
        maxHp: { from: number; to: number }
        attack: { from: number; to: number }
        defense: { from: number; to: number }
        speed: { from: number; to: number }
      }
    }>(`/pet/${petId}/evolve`, { itemId })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },
}
