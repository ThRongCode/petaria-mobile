# API Service

Complete mock API infrastructure for VnPeteria app, designed for seamless migration to a real backend.

## 📁 Structure

```
src/services/api/
├── config.ts          # API configuration (toggle mock/real)
├── types.ts           # TypeScript types for all requests/responses
├── mockDatabase.ts    # In-memory database simulation
├── mockApi.ts         # Mock API service (19 endpoints)
├── client.ts          # Unified API client
├── index.ts           # Export module
└── __tests__/
    └── api.test.ts    # API integration tests
```

## 🚀 Quick Start

### 1. Login
```typescript
import { apiClient } from '@/services/api'

const response = await apiClient.login('test@test.com', 'password')
if (response.success) {
  console.log('Logged in!', response.data.token)
}
```

### 2. Fetch Data
```typescript
// Get user's pets
const pets = await apiClient.getPets()

// Get hunting regions
const regions = await apiClient.getRegions()

// Get battle opponents
const opponents = await apiClient.getOpponents()
```

### 3. Perform Actions
```typescript
// Start hunting
const hunt = await apiClient.startHunt('forest-region-1')
if (hunt.success && hunt.data.petCaught) {
  console.log('Caught:', hunt.data.petCaught.name)
}

// Complete battle
const battle = await apiClient.completeBattle(
  'battle-123',
  'player', // winner
  [...battleLog],
  'pet-1',
  'opponent-1'
)

// Create auction
const auction = await apiClient.createAuction(
  'pet',
  'pet-1',
  1000, // starting bid
  24, // duration hours
  5000 // buyout price
)
```

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Create new account
- `GET /auth/validate` - Validate auth token

### Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Pets
- `GET /pets` - Get all user's pets
- `GET /pets/:id` - Get specific pet
- `PUT /pets/:id` - Update pet
- `POST /pets/feed/:id` - Feed pet

### Hunting
- `GET /regions` - Get all hunting regions
- `POST /hunt` - Start hunt in a region

### Battles
- `GET /opponents` - Get battle opponents
- `POST /battle/complete` - Save battle result
- `GET /battle/history` - Get battle history

### Items
- `GET /items` - Get items catalog

### Auctions
- `GET /auctions` - Get active auctions
- `POST /auctions` - Create new auction
- `POST /auction/bid` - Place bid

## 🔧 Configuration

Edit `/src/services/api/config.ts`:

```typescript
export const API_CONFIG = {
  useMock: true,  // Set to false for real API
  baseURL: 'https://api.vnpeteria.com',  // Real backend URL
  timeout: 10000,
  mockDelay: { min: 300, max: 800 },  // Realistic delays
  retry: { attempts: 3, delay: 1000 }
}
```

## 🧪 Testing

Run all tests:
```typescript
import { runAllTests } from '@/services/api/__tests__/api.test'

await runAllTests()
```

Or individual tests:
```typescript
import { testAuthFlow, testHuntFlow, testBattleFlow } from '@/services/api/__tests__/api.test'

await testAuthFlow()
await testHuntFlow()
await testBattleFlow()
```

## 📦 Response Format

All API responses follow this structure:

```typescript
{
  success: boolean
  data?: T  // Response data (if successful)
  message?: string  // Optional message
  error?: {
    code: string
    message: string
    details?: any
  }
}
```

### Success Example
```typescript
{
  success: true,
  data: {
    token: 'abc123...',
    userId: 'user-1',
    username: 'admin'
  }
}
```

### Error Example
```typescript
{
  success: false,
  error: {
    code: 'AUTH_INVALID',
    message: 'Invalid email or password'
  }
}
```

## 🔐 Authentication

The apiClient automatically manages auth tokens:

```typescript
// Login (token stored automatically)
await apiClient.login('test@test.com', 'password')

// All subsequent requests include the token
await apiClient.getPets()  // Auth token sent automatically

// Logout (token cleared)
await apiClient.logout()
```

## 🎯 Mock Database

Default test account:
- **Email**: test@test.com
- **Password**: password
- **Coins**: 10000
- **Pets**: Pikachu (level 15), Charizard (level 18)

Reset database:
```typescript
import { mockDB } from '@/services/api'

mockDB.reset()
```

## 🔄 Switching to Real API

When your backend is ready:

1. Update `config.ts`:
```typescript
export const API_CONFIG = {
  useMock: false,  // Switch to real API
  baseURL: 'https://api.vnpeteria.com',
  // ... rest of config
}
```

2. That's it! No code changes needed in your app.

## 🏗️ Architecture

```
App Component
    ↓
apiClient.login()
    ↓
API_CONFIG.useMock?
    ↓
├─ true → mockApi.login() → mockDB
│
└─ false → fetch(baseURL + '/auth/login')
```

## 📚 Type Safety

All API calls are fully typed:

```typescript
// TypeScript knows the response structure
const response: ApiResponse<Pet[]> = await apiClient.getPets()

if (response.success) {
  // TypeScript knows data is Pet[]
  response.data.forEach(pet => {
    console.log(pet.name)  // Autocomplete works!
  })
}
```

## 🐛 Error Handling

```typescript
const response = await apiClient.login(email, password)

if (!response.success) {
  switch (response.error?.code) {
    case 'AUTH_INVALID':
      Alert.alert('Error', 'Invalid credentials')
      break
    case 'NETWORK_ERROR':
      Alert.alert('Error', 'Check your internet connection')
      break
    case 'TIMEOUT':
      Alert.alert('Error', 'Request timeout, please try again')
      break
    default:
      Alert.alert('Error', response.error?.message || 'Unknown error')
  }
  return
}

// Success - use response.data
console.log('Welcome', response.data.username)
```

## 📖 Documentation

- **Full API Plan**: `/docs/api-migration-plan.md`
- **Implementation Complete**: `/docs/api-implementation-complete.md`
- **Type Definitions**: `/src/services/api/types.ts`

## 🤝 Contributing

When adding new endpoints:

1. Add types to `types.ts`
2. Add mock implementation to `mockApi.ts`
3. Add public method to `client.ts`
4. Add test to `__tests__/api.test.ts`
5. Update this README

## ✅ Status

- ✅ 19 endpoints implemented
- ✅ Full TypeScript coverage
- ✅ Mock database with sample data
- ✅ Realistic API delays
- ✅ Error handling
- ✅ Token management
- ✅ Test suite
- ✅ Documentation

**Ready for Redux integration!**
