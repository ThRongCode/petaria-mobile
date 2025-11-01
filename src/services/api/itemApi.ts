import { realApiClient } from './realApiClient'

/**
 * Item API Service
 * Handles item shop, purchasing, and usage
 */
export const itemApi = {
  /**
   * Get item catalog (shop)
   */
  async getCatalog() {
    const response = await realApiClient.get<Array<{
      id: string
      name: string
      description: string
      type: string
      category: string
      price: number
      effect: any
      imageUrl: string
      purchasable: boolean
      consumable: boolean
      createdAt: string
      updatedAt: string
    }>>('/item/catalog')

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Get item details by ID
   */
  async getItem(itemId: string) {
    const response = await realApiClient.get<{
      id: string
      name: string
      description: string
      type: string
      category: string
      price: number
      effect: any
      imageUrl: string
      purchasable: boolean
      consumable: boolean
    }>(`/item/${itemId}`)

    return {
      success: true,
      data: response,
    }
  },

  /**
   * Buy item from shop
   */
  async buyItem(itemId: string, quantity: number = 1) {
    const response = await realApiClient.post<{
      message: string
      totalCost: number
      newBalance: number
      inventoryItem: {
        itemId: string
        quantity: number
      }
    }>('/item/buy', {
      itemId,
      quantity,
    })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },

  /**
   * Use item on pet (healing items, stat boosters, etc.)
   */
  async useItem(itemId: string, petId: string) {
    const response = await realApiClient.post<{
      message: string
      effect: {
        type: string
        value: number
      }
      pet: {
        id: string
        hp: number
        maxHp: number
        attack?: number
        defense?: number
        speed?: number
      }
    }>('/item/use', {
      itemId,
      petId,
    })

    return {
      success: true,
      data: response,
      message: response.message,
    }
  },
}
