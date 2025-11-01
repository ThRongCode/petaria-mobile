# API Services Quick Reference

## Import
```typescript
import { authApi, userApi, petApi, huntApi, battleApi, itemApi } from '@/services/api'
```

## Authentication API

### Login
```typescript
const result = await authApi.login({ 
  email: 'user@example.com', 
  password: 'password123' 
})
// Returns: { success, data: { token, userId, username, email, user } }
```

### Register
```typescript
const result = await authApi.register({
  email: 'user@example.com',
  password: 'password123',
  username: 'CoolTrainer'
})
// Returns: { success, data: { token, userId, username, email, user } }
```

### Validate Token
```typescript
const result = await authApi.validateToken('jwt-token-here')
// Returns: { success, data: { valid: true, userId } }
```

### Logout
```typescript
await authApi.logout()
// Clears token from AsyncStorage
```

---

## User API

### Get Profile
```typescript
const result = await userApi.getProfile()
// Returns user with: huntTickets, battleTickets, petCount, itemCount
```

### Update Profile
```typescript
const result = await userApi.updateProfile({ username: 'NewName' })
```

### Get Inventory
```typescript
const result = await userApi.getInventory()
// Returns: Array of { itemId, quantity, item: {...} }
```

### Get Stats
```typescript
const result = await userApi.getStats()
// Returns: { battlesWon, battlesLost, huntsCompleted, ... }
```

### Check Tickets (Manual Reset)
```typescript
const result = await userApi.checkTickets()
// Triggers daily reset if past midnight UTC
```

---

## Pet API

### Get All Pets
```typescript
const result = await petApi.getUserPets()
// Returns: Array of pets with moves, stats, etc.
```

### Get Pet Details
```typescript
const result = await petApi.getPetDetails('pet-id')
```

### Update Pet
```typescript
const result = await petApi.updatePet('pet-id', {
  nickname: 'Fluffy',
  isForSale: true
})
```

### Feed Pet
```typescript
const result = await petApi.feedPet('pet-id')
// Returns: { mood, lastFed, moodIncreased }
```

### Heal Pet
```typescript
const result = await petApi.healPet('pet-id', 'item-id')
// Returns: { hp, healAmount }
```

### Release Pet
```typescript
const result = await petApi.releasePet('pet-id')
// Deletes pet, decrements petCount
```

---

## Hunt API

### Get Regions
```typescript
const result = await huntApi.getRegions()
// Returns: Array of hunt regions with difficulty, costs, etc.
```

### Start Hunt
```typescript
const result = await huntApi.startHunt('region-id')
// Costs 1 hunt ticket
// Returns: { session, encounters, message }
```

### Get Current Session
```typescript
const result = await huntApi.getSession()
// Returns: { session, encounters } or null if no active session
```

### Attempt Catch
```typescript
const result = await huntApi.attemptCatch(
  'session-id',
  'encounter-id',
  'pokeball' // ball type
)
// Costs 1 ball BEFORE attempt
// Returns: { success, message, pet? }
```

### Flee Hunt
```typescript
const result = await huntApi.flee('session-id')
```

### Cancel Session
```typescript
const result = await huntApi.cancelSession('session-id')
// Removes session without completing
```

### Complete Session
```typescript
const result = await huntApi.completeSession('session-id')
// Returns: { region, petsCaught, totalEncounters }
```

---

## Battle API

### List Opponents
```typescript
const result = await battleApi.listOpponents()
// Returns: Array of opponents with pets, rewards, unlock level
```

### Get Opponent
```typescript
const result = await battleApi.getOpponent('opponent-id')
```

### Start Battle
```typescript
const result = await battleApi.startBattle('opponent-id', 'pet-id')
// Costs 1 battle ticket
// Returns: { battle, opponent, pet, message }
```

### Complete Battle
```typescript
const result = await battleApi.completeBattle(
  'battle-id',
  true, // victory: true/false
  'pet-id'
)
// Returns: { battle, rewards?, levelUp?, newStats?, statChanges? }
// If level up: statChanges shows random 5-10% growth per stat
```

### Get Battle History
```typescript
const result = await battleApi.getBattleHistory()
// Returns: Array of past battles
```

---

## Item API

### Get Catalog
```typescript
const result = await itemApi.getCatalog()
// Returns: Array of all purchasable items
```

### Get Item
```typescript
const result = await itemApi.getItem('item-id')
```

### Buy Item
```typescript
const result = await itemApi.buyItem('item-id', 5) // quantity
// Checks 500 item limit
// Returns: { totalCost, newBalance, inventoryItem }
```

### Use Item
```typescript
const result = await itemApi.useItem('item-id', 'pet-id')
// Decrements itemCount if consumable
// Returns: { effect, pet }
```

---

## Response Format

All API methods return:
```typescript
{
  success: boolean
  data?: T
  message?: string
  error?: { code: string; message: string }
}
```

## Error Codes

- `INSUFFICIENT_TICKETS` - Need more hunt/battle tickets
- `INVENTORY_LIMIT` - Hit 500 items or 100 pets limit
- `ITEM_NOT_FOUND` - Ball or item not in inventory
- `UNAUTHORIZED` - Token expired (401)
- `SESSION_NOT_FOUND` - Hunt session doesn't exist
- `INSUFFICIENT_FUNDS` - Not enough coins/gems
- `NETWORK_ERROR` - Connection issue
- `TIMEOUT` - Request timed out

## Automatic Features

### Token Injection
JWT token automatically added to all requests via interceptor.

### 401 Handling
Expired tokens automatically cleared, app should redirect to login.

### Error Transformation
All errors converted to consistent format with error codes.

### Token Persistence
Tokens saved to AsyncStorage, persist across app restarts.

## Configuration

Switch between mock and real API in `src/services/api/config.ts`:
```typescript
export const API_CONFIG = {
  useMock: false, // true = mock, false = real backend
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
}
```

## Usage in Redux Sagas

```typescript
import { authApi } from '@/services/api'

function* loginSaga(action) {
  try {
    const result = yield call(authApi.login, {
      email: action.payload.email,
      password: action.payload.password,
    })
    
    if (result.success) {
      yield put(loginSuccess(result.data))
    } else {
      yield put(loginFailure(result.error))
    }
  } catch (error) {
    yield put(loginFailure({ code: 'UNKNOWN', message: error.message }))
  }
}
```

## Ticket System

### Daily Limits
- Hunt tickets: 5 per day
- Battle tickets: 20 per day
- Reset: Midnight UTC

### Auto-Reset
Tickets automatically reset on:
- User login
- Manual `checkTickets()` call

### Checking Tickets
```typescript
const profile = await userApi.getProfile()
console.log(`Hunt tickets: ${profile.data.huntTickets}/5`)
console.log(`Battle tickets: ${profile.data.battleTickets}/20`)
```

## Inventory Limits

### Hard Limits
- Items: 500 max
- Pets: 100 max

### Checking Counts
```typescript
const profile = await userApi.getProfile()
console.log(`Pets: ${profile.data.petCount}/100`)
console.log(`Items: ${profile.data.itemCount}/500`)
```

### Limit Enforcement
Backend automatically checks limits before:
- Buying items
- Catching pets
- Operations fail with `INVENTORY_LIMIT` error

## Backend API Base URL

Development: `http://localhost:3000/api`

All endpoints prefixed with `/api`:
- `POST /api/auth/login`
- `GET /api/user/profile`
- `POST /api/hunt/start`
- etc.
