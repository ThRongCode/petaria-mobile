# Frontend API Migration Guide

## Overview
This document explains the migration from mock API to real backend API integration.

## What Was Implemented

### 1. Real API Client (`realApiClient.ts`)
- Axios-based HTTP client with singleton pattern
- Request interceptor: Auto-injects JWT Bearer token
- Response interceptor: Handles 401 errors and API error transformation
- Token management with AsyncStorage persistence
- Error handling with custom `ApiError` class

### 2. API Service Modules
All backend endpoints are now accessible through modular service files:

#### `authApi.ts`
- `login(credentials)` - User login with email/password
- `register(userData)` - New user registration
- `validateToken(token)` - Token validation via profile fetch
- `logout()` - Clear token from storage

#### `userApi.ts`
- `getProfile()` - Get user profile with tickets and counts
- `updateProfile(data)` - Update username
- `getInventory()` - Get user inventory with items
- `getStats()` - Get battle/hunt statistics
- `checkTickets()` - Manual daily ticket reset check

#### `petApi.ts`
- `getUserPets()` - Get all user's pets
- `getPetDetails(petId)` - Get specific pet details
- `updatePet(petId, data)` - Update pet nickname/sale status
- `feedPet(petId)` - Feed pet to increase mood
- `healPet(petId, itemId)` - Heal pet using item
- `releasePet(petId)` - Release pet

#### `huntApi.ts`
- `getRegions()` - Get available hunt regions
- `startHunt(regionId)` - Start hunt session (costs 1 ticket)
- `getSession()` - Get current hunt session
- `attemptCatch(sessionId, encounterId, ballType)` - Catch pet (costs ball)
- `flee(sessionId)` - Flee from hunt
- `cancelSession(sessionId)` - Cancel hunt session
- `completeSession(sessionId)` - Complete hunt

#### `battleApi.ts`
- `listOpponents()` - Get available opponents
- `getOpponent(opponentId)` - Get opponent details
- `startBattle(opponentId, petId)` - Start battle (costs 1 ticket)
- `completeBattle(battleId, victory, petId)` - Complete battle with rewards
- `getBattleHistory()` - Get battle history

#### `itemApi.ts`
- `getCatalog()` - Get item shop catalog
- `getItem(itemId)` - Get item details
- `buyItem(itemId, quantity)` - Buy items (checks 500 item limit)
- `useItem(itemId, petId)` - Use item on pet

### 3. Client Router (`client.ts`)
Updated `realRequest()` method to route requests to appropriate API services:
- Maps old endpoint format to new service calls
- Handles backward compatibility with existing code
- Transforms responses to match expected format
- Provides graceful error handling

### 4. Type Updates
**`src/stores/types/game.ts`:**
- Added `huntTickets`, `battleTickets`, `lastTicketReset` to `UserProfile`
- Added `petCount`, `itemCount` for inventory tracking
- Removed old energy-based system

**`src/services/api/types.ts`:**
- Updated `AuthResponse` to include full user object with ticket fields

## Backend Changes Summary

### Ticket System
- **Hunt Tickets:** 5 per day, resets at midnight UTC
- **Battle Tickets:** 20 per day, resets at midnight UTC
- Daily reset happens automatically on login or can be triggered manually

### Game Mechanics Updates
- **Hunt Sessions:** No expiration time (resume anytime)
- **Catch Attempts:** Ball consumed BEFORE catch attempt (not after)
- **Pet Stats:** Random 5-10% growth per stat on level up (not fixed +2)
- **Inventory Limits:** 500 items max, 100 pets max enforced at API level

### Database Changes
**User Model:**
- Removed: `energy`, `maxEnergy`, `lastHealTime`
- Added: `huntTickets`, `battleTickets`, `lastTicketReset`, `petCount`, `itemCount`

**HuntSession Model:**
- Removed: `expiresAt` (sessions never expire)

## How to Switch to Real API

### Step 1: Ensure Backend is Running
```bash
cd backend
npm run start:dev
```

Backend runs on `http://localhost:3000/api`

### Step 2: Update API Configuration
In `src/services/api/config.ts`:
```typescript
export const API_CONFIG = {
  useMock: false,  // Change from true to false
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
}
```

### Step 3: Test Authentication Flow
1. Register new account
2. Login with credentials
3. Verify token is saved to AsyncStorage
4. Check profile loads with ticket fields

### Step 4: Test Game Flows

#### Hunt Flow
1. Check huntTickets count in profile
2. Start hunt session (should deduct 1 ticket)
3. Attempt to catch pet with ball (ball deducted before attempt)
4. Check petCount incremented if successful
5. Complete or cancel session

#### Battle Flow
1. Check battleTickets count in profile
2. Start battle (should deduct 1 ticket)
3. Complete battle with victory/defeat
4. Check random stat growth (5-10% per stat if level up)
5. Verify XP and coin rewards

#### Item Flow
1. Buy item from catalog
2. Check itemCount incremented
3. Use item on pet
4. Check itemCount decremented (consumable only)
5. Verify 500 item limit enforcement

## Redux Integration Notes

### Sagas That Need Updates
The following Redux sagas interact with the API and should handle new response formats:

1. **`authSaga.ts`** - Handle ticket fields in login/register responses
2. **`userSaga.ts`** - Update profile state with tickets and counts
3. **`huntSaga.ts`** - Handle ticket consumption in hunt start
4. **`battleSaga.ts`** - Handle ticket consumption and new stat growth format
5. **`petSaga.ts`** - Handle petCount updates on catch/release

### State Shape Changes
Update Redux state to include:
```typescript
user: {
  profile: {
    // ... existing fields
    huntTickets: number
    battleTickets: number
    lastTicketReset: string
    petCount: number
    itemCount: number
  }
}
```

### UI Components That Need Updates
Components that display energy should be updated to show tickets:
- Hunt screen: Show `huntTickets` instead of energy
- Battle screen: Show `battleTickets` instead of energy
- Profile screen: Display both ticket counts
- Add ticket reset countdown (midnight UTC)

## Error Handling

### Common Error Codes
- `INSUFFICIENT_TICKETS` - Not enough hunt/battle tickets
- `INVENTORY_LIMIT` - Hit 500 item or 100 pet limit
- `ITEM_NOT_FOUND` - Ball item not in inventory
- `UNAUTHORIZED` - Token expired or invalid
- `SESSION_NOT_FOUND` - Hunt session expired or doesn't exist

### Token Expiration
When token expires (401 error):
1. realApiClient intercepts 401 response
2. Clears token from AsyncStorage
3. Redirects to login screen (implement in app)
4. User must login again

## Testing Checklist

- [ ] Register new account
- [ ] Login with credentials
- [ ] Profile shows ticket fields
- [ ] Start hunt costs 1 hunt ticket
- [ ] Catch attempt costs ball item
- [ ] Pet count increments on catch
- [ ] Hunt session persists (no expiration)
- [ ] Start battle costs 1 battle ticket
- [ ] Battle completion gives random stat growth (5-10%)
- [ ] Buy item increments item count
- [ ] Use item decrements item count
- [ ] 500 item limit enforced
- [ ] 100 pet limit enforced
- [ ] Daily ticket reset works
- [ ] Token persists across app restarts
- [ ] 401 error clears token and redirects

## Known Limitations

1. **Auction System:** Not implemented in backend yet
2. **Heal Center:** Not implemented in backend (would need batch pet update)
3. **Real-time Battle:** Battle completion is simplified, no turn-by-turn simulation yet

## Next Steps

1. ✅ Create all API service modules
2. ✅ Update client.ts routing
3. ✅ Update TypeScript types
4. ⚠️ Update Redux sagas for new response formats
5. ⚠️ Update UI components to display tickets
6. ⚠️ Test complete game flow with real API
7. ⚠️ Handle token expiration in app navigation
8. ⚠️ Add loading states and error messages
9. ⚠️ Implement ticket reset countdown UI

## Support

If you encounter issues:
1. Check backend logs: `backend/` terminal
2. Check React Native logs: `npx react-native log-ios` or `log-android`
3. Check AsyncStorage for token: Use React Native Debugger
4. Verify API endpoint in Postman or curl
5. Check database state in Prisma Studio: `cd backend && npx prisma studio`

## Backend API Documentation

Full backend API documentation is available in the backend README:
`backend/README.md`

All endpoints are documented with request/response examples.
