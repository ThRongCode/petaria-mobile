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
      evolutionStage: number
      mood: number
      lastFed: string | null
      isForSale: boolean
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
}
