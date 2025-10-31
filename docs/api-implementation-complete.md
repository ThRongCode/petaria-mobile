# Mock API Implementation - Complete ✅

## What's Been Implemented

### 1. API Configuration (`/src/services/api/config.ts`)
- **useMock toggle**: Switch between mock and real API
- **baseURL**: Placeholder for real backend URL
- **timeout**: Request timeout configuration
- **mockDelay**: Realistic API delay simulation
- **retry**: Retry strategy for failed requests

### 2. API Types (`/src/services/api/types.ts`)
- Generic `ApiResponse<T>` wrapper
- All request/response types:
  - Auth: LoginRequest, RegisterRequest, AuthResponse
  - Hunt: HuntStartRequest, HuntCompleteRequest, HuntResponse
  - Battle: BattleStartRequest, BattleCompleteRequest, BattleCompleteResponse
  - Auction: CreateAuctionRequest, PlaceBidRequest
- PaginatedResponse for future list endpoints
- ApiError class for error handling

### 3. Mock Database (`/src/services/api/mockDatabase.ts`)
- In-memory mock database simulation
- Sample data:
  - User: test@test.com / password
  - Pets: Pikachu (level 15), Charizard (level 18)
  - Mock auctions, battles, cooldowns
- Database operations:
  - login(), register(), validateToken()
  - getUser(), updateUser()
  - getUserPets(), addPet(), updatePet()
  - And more...

### 4. Mock API Service (`/src/services/api/mockApi.ts`)
All endpoints implemented:

#### Auth (3 endpoints)
- ✅ POST /auth/login - Authenticate user
- ✅ POST /auth/register - Create new account
- ✅ GET /auth/validate - Validate auth token

#### Profile (2 endpoints)
- ✅ GET /profile - Get user profile
- ✅ PUT /profile - Update user profile

#### Inventory (1 endpoint)
- ✅ GET /inventory - Get user inventory

#### Pets (4 endpoints)
- ✅ GET /pets - Get all user pets
- ✅ GET /pets/:id - Get specific pet details
- ✅ PUT /pets/:id - Update pet
- ✅ POST /pets/feed/:id - Feed pet

#### Hunting (2 endpoints)
- ✅ GET /regions - Get all hunting regions
- ✅ POST /hunt - Start hunt and catch Pokemon

#### Battles (3 endpoints)
- ✅ GET /opponents - Get battle opponents
- ✅ POST /battle/complete - Complete battle, save result
- ✅ GET /battle/history - Get user battle history

#### Items (1 endpoint)
- ✅ GET /items - Get items catalog

#### Auctions (3 endpoints)
- ✅ GET /auctions - Get active auctions
- ✅ POST /auctions - Create new auction
- ✅ POST /auction/bid - Place bid on auction

**Total: 19 endpoints implemented**

### 5. API Client (`/src/services/api/client.ts`)
- Unified interface for API calls
- Automatically routes to mock or real API based on config
- Handles auth token management
- Clean public API methods matching all endpoints
- Error handling with proper TypeScript types

### 6. Export Module (`/src/services/api/index.ts`)
- Central export point for all API functionality
- Easy imports: `import { apiClient, API_CONFIG } from '@/services/api'`

## How to Use

### Basic Usage
```typescript
import { apiClient } from '@/services/api'

// Login
const response = await apiClient.login('test@test.com', 'password')
if (response.success) {
  console.log('Token:', response.data.token)
  // apiClient automatically stores token
}

// Get pets (auth required)
const petsResponse = await apiClient.getPets()
if (petsResponse.success) {
  console.log('Pets:', petsResponse.data)
}

// Start hunt
const huntResponse = await apiClient.startHunt('forest-region-1')
if (huntResponse.success && huntResponse.data.petCaught) {
  console.log('Caught:', huntResponse.data.petCaught.name)
}
```

### Switch to Real API
When backend is ready, just change one line in `/src/services/api/config.ts`:
```typescript
export const API_CONFIG = {
  useMock: false,  // Change this to false
  baseURL: 'https://api.vnpeteria.com',  // Update this
  // ... rest stays the same
}
```

## Response Structure
All API responses follow this structure:
```typescript
{
  success: boolean
  data?: T  // Response data if successful
  message?: string  // Optional message
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

## Features

### ✅ Realistic API Simulation
- Random delays (300-800ms) to simulate network latency
- Proper error responses with status codes
- Token validation and authentication
- State persistence across requests

### ✅ Type Safety
- Full TypeScript coverage
- Intellisense support for all endpoints
- Compile-time error checking

### ✅ Easy Testing
- Mock database can be reset
- Predictable test data
- No external dependencies

### ✅ Future-Proof
- Same interface for mock and real API
- Easy migration path
- Minimal code changes needed

## Next Steps

### Phase 2: Redux Integration
1. **Update Redux Actions to Call API**
   - Refactor `game.ts` actions to use apiClient
   - Add loading states (e.g., `isLoading`, `error`)
   - Handle API errors gracefully

2. **Remove Redux Persist for Game Data**
   - Keep only auth token in persisted state
   - All other data fetched from API on app start
   - Clear state on logout

3. **Add Loading States**
   - Show loading indicators during API calls
   - Handle refresh/retry logic
   - Implement pull-to-refresh on screens

### Phase 3: Screen Updates
1. **Update All Game Screens**
   - Call API on mount to fetch fresh data
   - Show loading states
   - Handle errors with user-friendly messages
   - Implement retry logic

2. **Add Data Refresh**
   - Pull-to-refresh on list screens
   - Auto-refresh stale data
   - Cache invalidation strategies

### Phase 4: Backend Integration
1. **Backend Team Handoff**
   - Provide API documentation (types.ts)
   - Share mock API implementation as reference
   - Define expected response structures

2. **Switch to Real API**
   - Change `useMock: false` in config
   - Update `baseURL` to real server
   - Test all endpoints
   - Monitor errors and fix edge cases

### Phase 5: Polish
1. **Error Handling**
   - Better error messages
   - Retry failed requests
   - Offline mode support

2. **Performance**
   - Request caching
   - Optimistic updates
   - Background data sync

## Testing

### Test Login Flow
```typescript
import { apiClient } from '@/services/api'

// Test login
const loginTest = async () => {
  const response = await apiClient.login('test@test.com', 'password')
  console.log('Login:', response)
  
  // Should now be authenticated
  const profile = await apiClient.getProfile()
  console.log('Profile:', profile)
}
```

### Test Hunt Flow
```typescript
const huntTest = async () => {
  // Login first
  await apiClient.login('test@test.com', 'password')
  
  // Get regions
  const regions = await apiClient.getRegions()
  console.log('Regions:', regions)
  
  // Hunt in first region
  const hunt = await apiClient.startHunt('forest-region-1')
  console.log('Hunt result:', hunt)
  
  // Check updated pets
  const pets = await apiClient.getPets()
  console.log('Pets after hunt:', pets)
}
```

## Summary

**✅ Complete mock API infrastructure ready**
- 19 endpoints implemented
- Full type safety
- Easy to switch to real backend
- Production-ready architecture

**Next: Integrate with Redux and update screens to use the new API!**
