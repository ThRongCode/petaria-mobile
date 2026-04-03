import { AnyAction } from 'redux'
import { call, put, takeLatest } from 'redux-saga/effects'
import { gameActions } from '../reducers'
import { petApi, userApi, itemApi, huntApi, battleApi } from '@/services/api'

/**
 * Load all user data from API after login
 * This includes: profile, pets, inventory, items catalog, regions, opponents
 */
function* loadUserDataSaga(): IterableIterator<AnyAction> {
  try {
    if (__DEV__) console.log('📊 Loading user data from API...')

    // Load user profile
    const profileResponse: Awaited<ReturnType<typeof userApi.getProfile>> = yield call([userApi, userApi.getProfile])
    if (profileResponse.success && profileResponse.data) {
      const p = profileResponse.data
      yield put(gameActions.setProfile({
        id: p.id,
        username: p.username,
        email: p.email,
        avatar: p.avatarUrl || `https://ui-avatars.com/api/?name=${p.username}&background=random`,
        level: p.level,
        xp: p.xp,
        xpToNext: p.xpToNext,
        currency: {
          coins: p.coins,
          gems: p.gems,
          pokeballs: p.pokeballs,
        },
        huntTickets: p.huntTickets,
        battleTickets: p.battleTickets,
        lastTicketReset: p.lastTicketReset,
        petCount: p.petCount,
        itemCount: p.itemCount,
        stats: {
          battlesWon: p.battlesWon,
          battlesLost: p.battlesLost,
          petsOwned: p.petCount,
          legendPetsOwned: 0,
          huntsCompleted: p.huntsCompleted,
          totalEarnings: 0,
        },
        achievements: [],
        settings: p.settings ?? {
          notifications: true,
          autoFeed: false,
          battleAnimations: true,
          soundEnabled: true,
          musicEnabled: true,
          language: 'en',
        },
        lastLogin: Date.now(),
        createdAt: new Date(p.createdAt).getTime(),
      }))
      console.log('✅ Profile loaded')
    }

    // Load user's pets
    const petsResponse: Awaited<ReturnType<typeof petApi.getUserPets>> = yield call([petApi, petApi.getUserPets])
    if (petsResponse.success && petsResponse.data) {
      // Transform backend pets to frontend Pet type
      const pets = petsResponse.data.map((backendPet: any) => ({
        id: backendPet.id,
        name: backendPet.nickname || backendPet.species,
        species: backendPet.species,
        type: backendPet.type || 'Normal', // Type from backend (Fire, Water, etc.)
        rarity: backendPet.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary',
        level: backendPet.level,
        xp: backendPet.xp,
        xpToNext: backendPet.xpToNext ?? backendPet.level * 100, // matches petXpPerLevel in game-constants.json
        stats: {
          hp: backendPet.hp,
          maxHp: backendPet.maxHp,
          attack: backendPet.attack,
          defense: backendPet.defense,
          speed: backendPet.speed,
        },
        // Individual Values (IVs) - random stats generated on capture
        ivs: {
          hp: backendPet.ivHp ?? 0,
          attack: backendPet.ivAttack ?? 0,
          defense: backendPet.ivDefense ?? 0,
          speed: backendPet.ivSpeed ?? 0,
        },
        moves: backendPet.moves?.map((petMove: any) => ({
          id: petMove.move.id,
          name: petMove.move.name,
          type: petMove.move.type as 'Physical' | 'Special' | 'Status',
          element: petMove.move.element,
          power: petMove.move.power,
          accuracy: petMove.move.accuracy,
          pp: petMove.pp,
          maxPp: petMove.maxPp,
          description: petMove.move.description,
        })) || [],
        image: backendPet.species, // Will be resolved by getPokemonImage
        evolutionStage: backendPet.evolutionStage,
        maxEvolutionStage: backendPet.maxEvolutionStage ?? 3, // From backend, fallback to 3
        canEvolve: backendPet.canEvolve ?? false, // From backend
        isLegendary: backendPet.rarity === 'Legendary',
        ownerId: backendPet.ownerId,
        isForSale: backendPet.isForSale || false,
        mood: backendPet.mood,
        lastFed: backendPet.lastFed ? new Date(backendPet.lastFed).getTime() : Date.now(),
        isFavorite: backendPet.isFavorite || false,
      }))
      
      yield put(gameActions.setPets(pets))
      console.log(`✅ Loaded ${pets.length} pets`)
    }

    // Load user inventory
    const inventoryResponse: Awaited<ReturnType<typeof userApi.getInventory>> = yield call([userApi, userApi.getInventory])
    if (inventoryResponse.success && inventoryResponse.data) {
      const items: Record<string, number> = {}
      inventoryResponse.data.forEach((userItem: any) => {
        items[userItem.itemId] = userItem.quantity
      })
      yield put(gameActions.setInventory({ items }))
      console.log(`✅ Loaded inventory with ${Object.keys(items).length} item types`)
    }

    // Load items catalog
    const itemsResponse: Awaited<ReturnType<typeof itemApi.getCatalog>> = yield call([itemApi, itemApi.getCatalog])
    if (itemsResponse.success && itemsResponse.data) {
      yield put(gameActions.setItems(itemsResponse.data))
      console.log(`✅ Loaded ${itemsResponse.data.length} items`)
    }

    // Load regions
    const regionsResponse: Awaited<ReturnType<typeof huntApi.getRegions>> = yield call([huntApi, huntApi.getRegions])
    if (regionsResponse.success && regionsResponse.data) {
      const regions = regionsResponse.data.map((region: any) => ({
        id: region.id,
        name: region.name,
        description: region.description,
        difficulty: region.difficulty,
        cost: region.coinsCost || 100,
        energyCost: region.energyCost || 20,
        unlockLevel: region.unlockLevel || 1,
        image: region.imageUrl,
        availablePets: [], // Will be populated from spawns if needed
        exclusivePets: [],
        legendPetId: undefined,
        legendOwnerId: undefined,
      }))
      yield put(gameActions.setRegions(regions))
      console.log(`✅ Loaded ${regions.length} regions`)
    }

    // Load opponents
    const opponentsResponse: Awaited<ReturnType<typeof battleApi.listOpponents>> = yield call([battleApi, battleApi.listOpponents])
    if (opponentsResponse.success && opponentsResponse.data) {
      const opponents = opponentsResponse.data.map((opponent: any) => ({
        id: opponent.id,
        name: opponent.name,
        species: opponent.species,
        level: opponent.level,
        difficulty: opponent.difficulty,
        stats: {
          hp: opponent.hp,
          maxHp: opponent.maxHp,
          attack: opponent.attack,
          defense: opponent.defense,
          speed: opponent.speed,
        },
        moves: opponent.moves?.map((opponentMove: any) => ({
          id: opponentMove.move.id,
          name: opponentMove.move.name,
          type: opponentMove.move.type,
          element: opponentMove.move.element,
          power: opponentMove.move.power,
          accuracy: opponentMove.move.accuracy,
          pp: opponentMove.move.pp,
          maxPp: opponentMove.move.maxPp,
          description: opponentMove.move.description,
        })) || [],
        image: opponent.imageUrl,
        rewards: {
          xp: opponent.rewardXp,
          coins: opponent.rewardCoins,
          items: [],
        },
        unlockLevel: opponent.unlockLevel,
      }))
      yield put(gameActions.setOpponents(opponents))
      console.log(`✅ Loaded ${opponents.length} opponents`)
    }

    if (__DEV__) console.log('🎉 User data loading complete!')
    yield put(gameActions.setLoadingComplete())
  } catch (error) {
    console.error('❌ Error loading user data:', error)
    yield put(gameActions.setLoadingComplete())
  }
}

export default function* gameSaga() {
  yield takeLatest('game/loadUserData', loadUserDataSaga)
}
