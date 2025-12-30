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
      rarity: string
      effectHp: number | null
      effectAttack: number | null
      effectDefense: number | null
      effectSpeed: number | null
      effectXpBoost: number | null
      isPermanent: boolean
      priceCoins: number | null
      priceGems: number | null
      imageUrl: string
    }>>('/item/catalog')

    // Transform backend response to frontend Item type
    const items = response.map((item) => {
      // Capitalize rarity (backend uses lowercase)
      const capitalizeRarity = (r: string): 'Common' | 'Rare' | 'Epic' | 'Legendary' => {
        const rarityMap: Record<string, 'Common' | 'Rare' | 'Epic' | 'Legendary'> = {
          common: 'Common',
          uncommon: 'Rare', // Map uncommon to Rare
          rare: 'Rare',
          epic: 'Epic',
          legendary: 'Legendary',
        }
        return rarityMap[r.toLowerCase()] || 'Common'
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type as 'StatBoost' | 'Evolution' | 'Consumable' | 'Cosmetic' | 'Pokeball',
        rarity: capitalizeRarity(item.rarity),
        effects: {
          hp: item.effectHp ?? undefined,
          attack: item.effectAttack ?? undefined,
          defense: item.effectDefense ?? undefined,
          speed: item.effectSpeed ?? undefined,
          xpBoost: item.effectXpBoost ?? undefined,
          permanent: item.isPermanent,
        },
        price: {
          coins: item.priceCoins ?? undefined,
          gems: item.priceGems ?? undefined,
        },
        image: item.imageUrl,
      }
    })

    return {
      success: true,
      data: items,
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
