# API Migration Plan

## Overview
Migrate from Redux Persist to API-first architecture with dummy API responses until backend is ready.

## Architecture Goals

### Data Flow
```
User Login → Fetch User Data → Fetch Game Data → Store in Redux (Session Only)
                                                   ↓
                                              Use in App
                                                   ↓
                                   Save Changes via API Calls
```

### Offline-First Features
- Battle calculations (client-side)
- UI state
- Temporary form data

### Online-Required Features
- User profile/progress
- Pokemon collection
- Inventory
- Auctions
- Battle results submission

---

## Phase 1: API Structure Setup

### 1.1 Create Mock API Service
**File:** `src/services/api/mockApi.ts`

**Endpoints to implement:**

#### Authentication
- `POST /api/auth/login` → User token + basic info
- `POST /api/auth/register` → Create account
- `POST /api/auth/logout` → Clear session
- `GET /api/auth/me` → Current user info

#### User Profile
- `GET /api/user/profile` → Full profile (level, xp, coins, gems, stats)
- `PATCH /api/user/profile` → Update profile
- `GET /api/user/inventory` → Owned pets + items

#### Game Content (Static)
- `GET /api/game/regions` → All hunting regions
- `GET /api/game/opponents` → Battle opponents
- `GET /api/game/items/catalog` → Available items
- `GET /api/game/moves` → Move database

#### Pokemon Management
- `GET /api/user/pets` → User's Pokemon collection
- `GET /api/user/pets/:id` → Single Pokemon details
- `PATCH /api/user/pets/:id` → Update Pokemon (nickname, mood)
- `POST /api/user/pets/:id/feed` → Feed Pokemon
- `POST /api/user/pets/:id/evolve` → Evolve Pokemon

#### Hunting
- `POST /api/hunt/start` → Start hunt (deduct coins, set cooldown)
- `POST /api/hunt/complete` → Submit hunt result (caught Pokemon)
- `GET /api/hunt/cooldowns` → Active cooldowns

#### Battle
- `POST /api/battle/start` → Initiate battle (validate pets, opponent)
- `POST /api/battle/complete` → Submit battle result (winner, rewards)
- `GET /api/battle/history` → Battle history
- `GET /api/battle/stats` → Win/loss stats

#### Auction
- `GET /api/auction/active` → Browse active auctions
- `POST /api/auction/create` → List item/pet
- `POST /api/auction/bid` → Place bid
- `POST /api/auction/buyout` → Instant purchase
- `GET /api/auction/my-listings` → User's auctions
- `GET /api/auction/my-bids` → User's bids

---

## Phase 2: Data Structure Changes

### 2.1 Remove from Redux Persist
Remove these from persisted state:
- ❌ `regions` → Fetch from API
- ❌ `opponents` → Fetch from API (already moved to constant, will move to API)
- ❌ `items` → Fetch catalog from API
- ❌ `pets` → Fetch user's pets from API
- ❌ `profile` → Fetch from API
- ❌ `inventory` → Fetch from API
- ❌ `auctions` → Fetch from API
- ❌ `battles` → Fetch from API

### 2.2 Keep in Session State (Redux, not persisted)
- ✅ User data (fetched after login)
- ✅ Game content (cached for session)
- ✅ UI state (loading, errors)
- ✅ Active battle calculations (local)

### 2.3 New Redux Structure
```typescript
interface AppState {
  auth: {
    token: string | null
    isAuthenticated: boolean
    user: BasicUserInfo | null
  }
  
  user: {
    profile: UserProfile | null
    inventory: UserInventory | null
    pets: Pet[]
    loading: boolean
    error: string | null
  }
  
  game: {
    regions: Region[]
    opponents: Opponent[]
    itemsCatalog: Item[]
    moves: Move[]
    loading: boolean
    error: string | null
  }
  
  battle: {
    active: BattleState | null // Local battle calculations
    history: Battle[]
    stats: BattleStats
  }
  
  auction: {
    active: Auction[]
    myListings: Auction[]
    myBids: Auction[]
  }
  
  hunt: {
    cooldowns: { [regionId]: timestamp }
    lastResult: HuntResult | null
  }
  
  ui: {
    loading: { [key: string]: boolean }
    errors: { [key: string]: string }
  }
}
```

---

## Phase 3: Implementation Steps

### Step 1: Create Mock API Service ✅
**Priority: HIGH**

```typescript
// src/services/api/mockApi.ts
export class MockApiService {
  // Simulate network delay
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // In-memory database (temporary)
  private db = {
    users: [],
    pets: [],
    regions: REGIONS,
    opponents: OPPONENTS,
    auctions: [],
    battles: []
  }
  
  // Generate dummy responses
  async login(email: string, password: string) { ... }
  async getUserProfile(userId: string) { ... }
  async getUserPets(userId: string) { ... }
  // ... all endpoints
}
```

### Step 2: Create API Client ✅
**Priority: HIGH**

```typescript
// src/services/api/client.ts
class ApiClient {
  private baseURL = __DEV__ ? 'http://localhost:3000' : 'https://api.vnpeteria.com'
  private useMock = true // Toggle for mock vs real API
  
  async request(endpoint: string, options: RequestOptions) {
    if (this.useMock) {
      return mockApi.handleRequest(endpoint, options)
    }
    // Real fetch when backend ready
    return fetch(this.baseURL + endpoint, options)
  }
}
```

### Step 3: Update Redux Actions to Use API ✅
**Priority: HIGH**

```typescript
// Old (Redux Persist)
dispatch(gameActions.addPet(newPet)) // Saved to AsyncStorage automatically

// New (API-first)
const result = await api.hunt.complete({ regionId, caughtPet })
dispatch(userActions.setPets(result.data.pets)) // Only in memory
```

### Step 4: Add Data Fetching on App Start ✅
**Priority: HIGH**

```typescript
// src/hooks/useAppInit.ts
export const useAppInit = () => {
  useEffect(() => {
    const initApp = async () => {
      const token = await AsyncStorage.getItem('auth_token')
      if (token) {
        dispatch(authActions.setToken(token))
        
        // Fetch all user data
        const [profile, pets, inventory] = await Promise.all([
          api.user.getProfile(),
          api.user.getPets(),
          api.user.getInventory()
        ])
        
        dispatch(userActions.setProfile(profile))
        dispatch(userActions.setPets(pets))
        dispatch(userActions.setInventory(inventory))
        
        // Fetch game content
        const [regions, opponents] = await Promise.all([
          api.game.getRegions(),
          api.game.getOpponents()
        ])
        
        dispatch(gameActions.setRegions(regions))
        dispatch(gameActions.setOpponents(opponents))
      }
    }
    
    initApp()
  }, [])
}
```

### Step 5: Update Redux Persist Config ✅
**Priority: MEDIUM**

```typescript
// Only persist auth token
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth token
}
```

### Step 6: Update All Screens to Use API Actions ✅
**Priority: MEDIUM**

```typescript
// Hunt Screen
const handleHunt = async () => {
  try {
    const result = await api.hunt.start(regionId)
    dispatch(huntActions.setLastResult(result))
    
    // Submit caught pokemon
    if (result.caught) {
      await api.hunt.complete({ regionId, petId: result.caught.id })
      dispatch(userActions.addPet(result.caught))
    }
  } catch (error) {
    showError(error.message)
  }
}

// Battle Screen
const handleBattleComplete = async (battleResult) => {
  try {
    // Battle was calculated locally, now save result
    const result = await api.battle.complete({
      opponentId,
      playerPetId,
      winner: battleResult.winner,
      battleLog: battleResult.log
    })
    
    dispatch(userActions.updateProfile(result.profile))
    dispatch(battleActions.addToHistory(result.battle))
  } catch (error) {
    showError(error.message)
  }
}
```

### Step 7: Add Loading States ✅
**Priority: MEDIUM**

```typescript
// Add loading indicators for all API calls
const [loading, setLoading] = useState(false)

const fetchData = async () => {
  setLoading(true)
  try {
    const data = await api.user.getProfile()
    dispatch(setProfile(data))
  } catch (error) {
    showError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### Step 8: Add Error Handling ✅
**Priority: HIGH**

```typescript
// src/services/api/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Unauthorized - logout user
    dispatch(authActions.logout())
    navigation.navigate('SignIn')
  } else if (error.status === 404) {
    showToast('Resource not found')
  } else {
    showToast('Something went wrong')
  }
}
```

---

## Phase 4: Battle Logic (Offline)

### Keep Client-Side:
```typescript
// Battle calculations stay in app
const calculateDamage = (attacker, defender, move) => { ... }
const simulateBattle = (playerPet, opponentPet) => { ... }

// Only send result to API
await api.battle.complete({
  winner: battleResult.winner,
  rewards: battleResult.rewards,
  battleLog: battleResult.log // For replay/validation
})
```

### Why Offline?
- ✅ Real-time battle without lag
- ✅ No need for websockets
- ✅ Reduces API calls
- ⚠️ Anti-cheat: Validate on server later

---

## Phase 5: Migration Checklist

### Before Starting
- [ ] Backup current code
- [ ] Document current data structure
- [ ] Test current app thoroughly

### Mock API Setup
- [ ] Create `mockApi.ts` with all endpoints
- [ ] Create `apiClient.ts` wrapper
- [ ] Create dummy data generators
- [ ] Test mock responses

### Redux Changes
- [ ] Remove Redux Persist for game data
- [ ] Keep only auth token persisted
- [ ] Update all action creators to async API calls
- [ ] Add loading/error states

### Screen Updates
- [ ] Add data fetching on app start
- [ ] Update HuntScreen to use API
- [ ] Update BattleScreen to use API
- [ ] Update PetManagementScreen to use API
- [ ] Update AuctionScreen to use API
- [ ] Update ProfileScreen to use API

### Testing
- [ ] Test without internet (should show error)
- [ ] Test login flow
- [ ] Test all CRUD operations
- [ ] Test battle flow
- [ ] Test hunt flow
- [ ] Test auction flow

### Documentation
- [ ] API endpoint documentation
- [ ] Update README with new architecture
- [ ] Create backend API spec for future dev

---

## Phase 6: Future Backend Integration

When real backend is ready:

### Switch to Real API
```typescript
// src/services/api/config.ts
export const API_CONFIG = {
  useMock: false, // Change to false
  baseURL: process.env.API_BASE_URL,
  timeout: 10000
}
```

### Backend Tasks
- [ ] Implement authentication (JWT)
- [ ] Create database schema
- [ ] Implement all endpoints matching mock API
- [ ] Add input validation
- [ ] Add anti-cheat for battles
- [ ] Add rate limiting
- [ ] Add websockets for auctions (optional)

---

## Benefits of This Approach

### For Development
- ✅ Can develop without backend
- ✅ Frontend and backend can be developed in parallel
- ✅ Mock API serves as API specification
- ✅ Easy to test different scenarios

### For Production
- ✅ Data consistency across devices
- ✅ No cache issues
- ✅ Can add features without app updates
- ✅ Better security (server-side validation)
- ✅ Can track analytics
- ✅ Easier to debug issues

### For Users
- ✅ Progress saved in cloud
- ✅ Can switch devices
- ✅ Multiplayer features possible
- ✅ Always up-to-date game content

---

## Timeline Estimate

- **Week 1**: Mock API setup + Redux restructure
- **Week 2**: Update all screens to use API
- **Week 3**: Testing + bug fixes
- **Week 4**: Documentation + polish

**Total**: ~1 month for full migration

---

## Risk Mitigation

### Risks
- Breaking existing functionality
- Data loss during migration
- Performance issues with API calls

### Mitigations
- Work in feature branch
- Keep Redux Persist as fallback initially
- Add proper loading states
- Implement offline queue for failed requests
- Add retry logic for API calls
- Cache game content (regions, opponents) for session
