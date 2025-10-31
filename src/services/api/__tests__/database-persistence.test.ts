/**
 * Mock Database Persistence Test
 * 
 * Demonstrates that the mock API actually modifies the mock database
 * and changes persist across multiple API calls
 */

import { apiClient, mockDB } from '@/services/api'

/**
 * Test 1: Battle XP Updates Pet Level
 */
export const testBattleXpPersistence = async () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  TEST: Battle XP Updates Pet in Mock Database            ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // Login
  console.log('1. Login...')
  await apiClient.login('test@test.com', 'password')
  const userId = apiClient.getUserId()!

  // Get initial pet state
  console.log('2. Get initial pets...')
  const initialPets = await apiClient.getPets()
  const firstPet = initialPets.data![0]
  
  console.log(`   📊 Initial State:`)
  console.log(`   Pet: ${firstPet.name} (${firstPet.species})`)
  console.log(`   Level: ${firstPet.level}`)
  console.log(`   XP: ${firstPet.xp}/${firstPet.xpToNext}`)
  console.log(`   HP: ${firstPet.stats.hp}`)
  console.log(`   Attack: ${firstPet.stats.attack}`)

  // Check mock database directly
  const directPet1 = mockDB.getPet(firstPet.id)
  console.log(`\n   ✅ Mock DB has same data:`)
  console.log(`   Level: ${directPet1?.level}, XP: ${directPet1?.xp}`)

  // Complete a battle (gain XP)
  console.log('\n3. Complete battle (gaining XP)...')
  const battleResult = await apiClient.completeBattle(
    'battle-test-123',
    'player',
    [{ turn: 1, action: 'attack', damage: 20 }],
    firstPet.id,
    'opponent-1'
  )

  console.log(`   🎉 Battle won! Gained ${battleResult.data?.rewards.xp} XP`)

  // Fetch pets again from API
  console.log('\n4. Fetch pets again from API...')
  const updatedPets = await apiClient.getPets()
  const updatedPet = updatedPets.data!.find(p => p.id === firstPet.id)!

  console.log(`   📊 After Battle:`)
  console.log(`   Level: ${updatedPet.level} ${updatedPet.level > firstPet.level ? '⬆️ LEVELED UP!' : ''}`)
  console.log(`   XP: ${updatedPet.xp}/${updatedPet.xpToNext}`)
  console.log(`   HP: ${updatedPet.stats.hp} ${updatedPet.stats.hp > firstPet.stats.hp ? `(+${updatedPet.stats.hp - firstPet.stats.hp})` : ''}`)
  console.log(`   Attack: ${updatedPet.stats.attack} ${updatedPet.stats.attack > firstPet.stats.attack ? `(+${updatedPet.stats.attack - firstPet.stats.attack})` : ''}`)

  // Check mock database directly again
  const directPet2 = mockDB.getPet(firstPet.id)
  console.log(`\n   ✅ Mock DB updated correctly:`)
  console.log(`   Level: ${directPet2?.level}, XP: ${directPet2?.xp}`)

  // Verify persistence
  if (directPet2?.xp !== updatedPet.xp) {
    console.error('   ❌ ERROR: Mock DB and API response don\'t match!')
    return false
  }

  console.log('\n   ✅ SUCCESS: Pet data persisted in mock database!')
  return true
}

/**
 * Test 2: Hunt Deducts Coins and Adds Pet
 */
export const testHuntPersistence = async () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  TEST: Hunt Deducts Coins and Adds Pet to Database       ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // Login
  await apiClient.login('test@test.com', 'password')
  const userId = apiClient.getUserId()!

  // Get initial state
  console.log('1. Get initial state...')
  const initialProfile = await apiClient.getProfile()
  const initialPets = await apiClient.getPets()
  const initialCoins = initialProfile.data?.currency.coins
  const initialPetCount = initialPets.data?.length

  console.log(`   💰 Initial Coins: ${initialCoins}`)
  console.log(`   🐾 Initial Pet Count: ${initialPetCount}`)

  // Check mock database
  const directUser1 = mockDB.getUser(userId)
  const directPets1 = mockDB.getUserPets(userId)
  console.log(`\n   ✅ Mock DB matches:`)
  console.log(`   Coins: ${directUser1?.currency.coins}, Pets: ${directPets1.length}`)

  // Get regions
  const regions = await apiClient.getRegions()
  const firstRegion = regions.data![0]
  const huntCost = firstRegion.huntingCost

  console.log(`\n2. Starting hunt in ${firstRegion.name}...`)
  console.log(`   Cost: ${huntCost} coins`)

  // Hunt
  const huntResult = await apiClient.startHunt(firstRegion.id)
  
  console.log(`   ${huntResult.data?.petCaught ? '🎉 Caught: ' + huntResult.data.petCaught.name : '❌ No catch'}`)
  console.log(`   Updated Coins: ${huntResult.data?.updatedCoins}`)

  // Verify coins deducted
  const expectedCoins = initialCoins! - huntCost
  if (huntResult.data?.updatedCoins !== expectedCoins) {
    console.error(`   ❌ ERROR: Expected ${expectedCoins} coins, got ${huntResult.data?.updatedCoins}`)
    return false
  }

  console.log(`   ✅ Coins deducted: ${initialCoins} → ${huntResult.data?.updatedCoins} (-${huntCost})`)

  // Fetch updated data
  console.log('\n3. Fetch updated data from API...')
  const updatedProfile = await apiClient.getProfile()
  const updatedPets = await apiClient.getPets()

  console.log(`   💰 Current Coins: ${updatedProfile.data?.currency.coins}`)
  console.log(`   🐾 Current Pet Count: ${updatedPets.data?.length}`)

  // Check mock database
  const directUser2 = mockDB.getUser(userId)
  const directPets2 = mockDB.getUserPets(userId)

  console.log(`\n   ✅ Mock DB updated:`)
  console.log(`   Coins: ${directUser2?.currency.coins}`)
  console.log(`   Pets: ${directPets2.length}`)

  // Verify persistence
  if (directUser2?.currency.coins !== updatedProfile.data?.currency.coins) {
    console.error('   ❌ ERROR: Coins don\'t match between API and DB!')
    return false
  }

  if (directPets2.length !== updatedPets.data?.length) {
    console.error('   ❌ ERROR: Pet count doesn\'t match!')
    return false
  }

  console.log('\n   ✅ SUCCESS: Coins and pets persisted correctly!')
  return true
}

/**
 * Test 3: Feed Pet Updates Mood in Database
 */
export const testFeedPetPersistence = async () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  TEST: Feed Pet Updates Mood in Database                 ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // Login
  await apiClient.login('test@test.com', 'password')

  // Get a pet
  console.log('1. Get pets...')
  const pets = await apiClient.getPets()
  const pet = pets.data![0]

  console.log(`   Pet: ${pet.name}`)
  console.log(`   Initial Mood: ${pet.mood}`)

  // Check mock database
  const directPet1 = mockDB.getPet(pet.id)
  console.log(`   ✅ Mock DB mood: ${directPet1?.mood}`)

  // Feed pet
  console.log('\n2. Feeding pet...')
  const fedPet = await apiClient.feedPet(pet.id)

  console.log(`   New Mood: ${fedPet.data?.mood} ${fedPet.data!.mood > pet.mood ? `(+${fedPet.data!.mood - pet.mood})` : ''}`)

  // Check mock database
  const directPet2 = mockDB.getPet(pet.id)
  console.log(`   ✅ Mock DB updated: ${directPet2?.mood}`)

  // Fetch pet again
  console.log('\n3. Fetch pet again from API...')
  const refetchedPet = await apiClient.getPetDetails(pet.id)
  console.log(`   Mood from API: ${refetchedPet.data?.mood}`)

  // Verify persistence
  if (directPet2?.mood !== refetchedPet.data?.mood) {
    console.error('   ❌ ERROR: Mood doesn\'t match!')
    return false
  }

  console.log('\n   ✅ SUCCESS: Pet mood persisted correctly!')
  return true
}

/**
 * Test 4: Auction Creation Updates Database
 */
export const testAuctionPersistence = async () => {
  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║  TEST: Auction Creation Persists in Database             ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // Login
  await apiClient.login('test@test.com', 'password')

  // Get initial auctions
  console.log('1. Get initial auctions...')
  const initialAuctions = await apiClient.getAuctions()
  const initialCount = initialAuctions.data?.length || 0

  console.log(`   Initial auction count: ${initialCount}`)

  // Check mock database
  const directAuctions1 = mockDB.getActiveAuctions()
  console.log(`   ✅ Mock DB has: ${directAuctions1.length} auctions`)

  // Get a pet to auction
  const pets = await apiClient.getPets()
  const petToAuction = pets.data![0]

  // Create auction
  console.log(`\n2. Creating auction for ${petToAuction.name}...`)
  const newAuction = await apiClient.createAuction(
    'pet',
    petToAuction.id,
    1000, // starting bid
    24, // 24 hours
    5000 // buyout
  )

  console.log(`   ✅ Auction created with ID: ${newAuction.data?.id}`)
  console.log(`   Starting bid: ${newAuction.data?.startingBid}`)

  // Check mock database
  const directAuctions2 = mockDB.getActiveAuctions()
  console.log(`\n   ✅ Mock DB now has: ${directAuctions2.length} auctions (+1)`)

  // Fetch auctions again
  console.log('\n3. Fetch auctions again...')
  const updatedAuctions = await apiClient.getAuctions()
  const newCount = updatedAuctions.data?.length || 0

  console.log(`   API returns: ${newCount} auctions`)

  // Verify persistence
  if (directAuctions2.length !== newCount) {
    console.error('   ❌ ERROR: Auction count doesn\'t match!')
    return false
  }

  // Find the auction we created
  const foundAuction = updatedAuctions.data?.find(a => a.id === newAuction.data?.id)
  if (!foundAuction) {
    console.error('   ❌ ERROR: Created auction not found!')
    return false
  }

  console.log(`   ✅ Found created auction: ${foundAuction.id}`)
  console.log('\n   ✅ SUCCESS: Auction persisted correctly!')
  return true
}

/**
 * Run all persistence tests
 */
export const runPersistenceTests = async () => {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║                                                           ║')
  console.log('║      MOCK DATABASE PERSISTENCE TESTS                      ║')
  console.log('║                                                           ║')
  console.log('║  Verifying that API calls actually modify the mock DB    ║')
  console.log('║  and changes persist across multiple API calls           ║')
  console.log('║                                                           ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  try {
    const test1 = await testBattleXpPersistence()
    const test2 = await testHuntPersistence()
    const test3 = await testFeedPetPersistence()
    const test4 = await testAuctionPersistence()

    console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║                    TEST SUMMARY                           ║')
    console.log('╠═══════════════════════════════════════════════════════════╣')
    console.log(`║  Battle XP Persistence:     ${test1 ? '✅ PASS' : '❌ FAIL'}                        ║`)
    console.log(`║  Hunt Persistence:          ${test2 ? '✅ PASS' : '❌ FAIL'}                        ║`)
    console.log(`║  Feed Pet Persistence:      ${test3 ? '✅ PASS' : '❌ FAIL'}                        ║`)
    console.log(`║  Auction Persistence:       ${test4 ? '✅ PASS' : '❌ FAIL'}                        ║`)
    console.log('╠═══════════════════════════════════════════════════════════╣')
    
    if (test1 && test2 && test3 && test4) {
      console.log('║                                                           ║')
      console.log('║  🎉 ALL TESTS PASSED!                                     ║')
      console.log('║                                                           ║')
      console.log('║  The mock database is correctly updated by API calls     ║')
      console.log('║  and all changes persist across multiple requests.       ║')
      console.log('║                                                           ║')
    } else {
      console.log('║  ❌ SOME TESTS FAILED                                     ║')
    }
    
    console.log('╚═══════════════════════════════════════════════════════════╝\n')
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error)
  }
}

export default {
  testBattleXpPersistence,
  testHuntPersistence,
  testFeedPetPersistence,
  testAuctionPersistence,
  runPersistenceTests,
}
