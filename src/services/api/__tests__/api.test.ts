/**
 * API Test Examples
 * 
 * Run these tests to verify the mock API is working correctly
 */

import { apiClient } from '@/services/api'

/**
 * Test 1: Authentication Flow
 */
export const testAuthFlow = async () => {
  console.log('=== Testing Auth Flow ===')
  
  // Test login
  console.log('1. Login...')
  const loginResponse = await apiClient.login('test@test.com', 'password')
  
  if (!loginResponse.success) {
    console.error('❌ Login failed:', loginResponse.error)
    return false
  }
  
  console.log('✅ Login successful')
  console.log('   Token:', loginResponse.data?.token)
  console.log('   User ID:', loginResponse.data?.userId)
  
  // Test get profile
  console.log('2. Get Profile...')
  const profileResponse = await apiClient.getProfile()
  
  if (!profileResponse.success) {
    console.error('❌ Get profile failed:', profileResponse.error)
    return false
  }
  
  console.log('✅ Profile retrieved')
  console.log('   Username:', profileResponse.data?.username)
  console.log('   Coins:', profileResponse.data?.coins)
  
  return true
}

/**
 * Test 2: Pet Management
 */
export const testPetFlow = async () => {
  console.log('\n=== Testing Pet Flow ===')
  
  // Login first
  await apiClient.login('test@test.com', 'password')
  
  // Get pets
  console.log('1. Get Pets...')
  const petsResponse = await apiClient.getPets()
  
  if (!petsResponse.success) {
    console.error('❌ Get pets failed:', petsResponse.error)
    return false
  }
  
  console.log('✅ Pets retrieved')
  console.log(`   Found ${petsResponse.data?.length} pets`)
  petsResponse.data?.forEach((pet, i) => {
    console.log(`   ${i + 1}. ${pet.name} (${pet.species}) - Level ${pet.level}`)
  })
  
  // Get pet details
  if (petsResponse.data && petsResponse.data.length > 0) {
    const firstPet = petsResponse.data[0]
    console.log('2. Get Pet Details...')
    const petDetailsResponse = await apiClient.getPetDetails(firstPet.id)
    
    if (!petDetailsResponse.success) {
      console.error('❌ Get pet details failed:', petDetailsResponse.error)
      return false
    }
    
    console.log('✅ Pet details retrieved')
    console.log('   Name:', petDetailsResponse.data?.name)
    console.log('   Species:', petDetailsResponse.data?.species)
    console.log('   HP:', petDetailsResponse.data?.stats.hp)
    console.log('   Attack:', petDetailsResponse.data?.stats.attack)
  }
  
  return true
}

/**
 * Test 3: Hunting Flow
 */
export const testHuntFlow = async () => {
  console.log('\n=== Testing Hunt Flow ===')
  
  // Login first
  await apiClient.login('test@test.com', 'password')
  
  // Get regions
  console.log('1. Get Regions...')
  const regionsResponse = await apiClient.getRegions()
  
  if (!regionsResponse.success) {
    console.error('❌ Get regions failed:', regionsResponse.error)
    return false
  }
  
  console.log('✅ Regions retrieved')
  console.log(`   Found ${regionsResponse.data?.length} regions`)
  regionsResponse.data?.forEach((region, i) => {
    console.log(`   ${i + 1}. ${region.name} - Cost: ${region.huntingCost} coins`)
  })
  
  // Start hunt
  if (regionsResponse.data && regionsResponse.data.length > 0) {
    const firstRegion = regionsResponse.data[0]
    console.log('2. Start Hunt...')
    const huntResponse = await apiClient.startHunt(firstRegion.id)
    
    if (!huntResponse.success) {
      console.error('❌ Hunt failed:', huntResponse.error)
      return false
    }
    
    console.log('✅ Hunt completed')
    if (huntResponse.data?.petCaught) {
      console.log('   🎉 Caught:', huntResponse.data.petCaught.name)
      console.log('   Species:', huntResponse.data.petCaught.species)
      console.log('   Level:', huntResponse.data.petCaught.level)
    } else {
      console.log('   No Pokemon caught this time')
    }
    console.log('   XP Gained:', huntResponse.data?.xpGained)
    console.log('   Coins:', huntResponse.data?.updatedCoins)
  }
  
  return true
}

/**
 * Test 4: Battle Flow
 */
export const testBattleFlow = async () => {
  console.log('\n=== Testing Battle Flow ===')
  
  // Login first
  await apiClient.login('test@test.com', 'password')
  
  // Get opponents
  console.log('1. Get Opponents...')
  const opponentsResponse = await apiClient.getOpponents()
  
  if (!opponentsResponse.success) {
    console.error('❌ Get opponents failed:', opponentsResponse.error)
    return false
  }
  
  console.log('✅ Opponents retrieved')
  console.log(`   Found ${opponentsResponse.data?.length} opponents`)
  opponentsResponse.data?.forEach((opponent, i) => {
    console.log(`   ${i + 1}. ${opponent.name} - ${opponent.difficulty}`)
  })
  
  // Complete a battle
  console.log('2. Complete Battle...')
  const battleResponse = await apiClient.completeBattle(
    'battle-123',
    'player',
    [{ turn: 1, action: 'attack' }],
    'pet-1',
    'opponent-1'
  )
  
  if (!battleResponse.success) {
    console.error('❌ Complete battle failed:', battleResponse.error)
    return false
  }
  
  console.log('✅ Battle completed')
  console.log('   Rewards:')
  console.log('   - Coins:', battleResponse.data?.rewards.coins)
  console.log('   - XP:', battleResponse.data?.rewards.xp)
  console.log('   - Items:', battleResponse.data?.rewards.items.join(', '))
  
  return true
}

/**
 * Test 5: Auction Flow
 */
export const testAuctionFlow = async () => {
  console.log('\n=== Testing Auction Flow ===')
  
  // Login first
  await apiClient.login('test@test.com', 'password')
  
  // Get auctions
  console.log('1. Get Auctions...')
  const auctionsResponse = await apiClient.getAuctions()
  
  if (!auctionsResponse.success) {
    console.error('❌ Get auctions failed:', auctionsResponse.error)
    return false
  }
  
  console.log('✅ Auctions retrieved')
  console.log(`   Found ${auctionsResponse.data?.length} active auctions`)
  auctionsResponse.data?.forEach((auction, i) => {
    console.log(`   ${i + 1}. ${auction.itemType} - Current Bid: ${auction.currentBid}`)
  })
  
  // Create auction
  console.log('2. Create Auction...')
  const createResponse = await apiClient.createAuction(
    'pet',
    'pet-1',
    1000,
    24,
    5000
  )
  
  if (!createResponse.success) {
    console.error('❌ Create auction failed:', createResponse.error)
    return false
  }
  
  console.log('✅ Auction created')
  console.log('   ID:', createResponse.data?.id)
  console.log('   Starting Bid:', createResponse.data?.startingBid)
  console.log('   Buyout Price:', createResponse.data?.buyoutPrice)
  
  // Place bid
  if (createResponse.data) {
    console.log('3. Place Bid...')
    const bidResponse = await apiClient.placeBid(
      createResponse.data.id,
      1500
    )
    
    if (!bidResponse.success) {
      console.error('❌ Place bid failed:', bidResponse.error)
      return false
    }
    
    console.log('✅ Bid placed')
    console.log('   New Current Bid:', bidResponse.data?.currentBid)
    console.log('   Total Bids:', bidResponse.data?.bids.length)
  }
  
  return true
}

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('╔═══════════════════════════════════════╗')
  console.log('║   Mock API Integration Tests          ║')
  console.log('╚═══════════════════════════════════════╝\n')
  
  try {
    await testAuthFlow()
    await testPetFlow()
    await testHuntFlow()
    await testBattleFlow()
    await testAuctionFlow()
    
    console.log('\n╔═══════════════════════════════════════╗')
    console.log('║   ✅ All Tests Passed!                 ║')
    console.log('╚═══════════════════════════════════════╝')
  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
  }
}

// Export for manual testing
export default {
  testAuthFlow,
  testPetFlow,
  testHuntFlow,
  testBattleFlow,
  testAuctionFlow,
  runAllTests,
}
