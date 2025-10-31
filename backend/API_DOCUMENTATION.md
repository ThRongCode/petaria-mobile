# VnPeteria Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT authentication.
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Auth Module

### Register
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "player123",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player123",
    "level": 1,
    "coins": 1000,
    "gems": 50
  },
  "access_token": "jwt_token_here"
}
```

### Login
**POST** `/auth/login`

Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": { ... },
  "access_token": "jwt_token_here"
}
```

### Get Current User
**GET** `/auth/me`

Get authenticated user info.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "player123",
  "level": 5,
  "xp": 450,
  "coins": 2500,
  "gems": 150,
  "energy": 80,
  "maxEnergy": 100
}
```

---

## 👤 User Module

### Get Profile
**GET** `/user/profile`

Get detailed user profile with statistics.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "player123",
  "level": 5,
  "xp": 450,
  "coins": 2500,
  "gems": 150,
  "energy": 80,
  "maxEnergy": 100,
  "battlesWon": 12,
  "lastHealTime": "2024-10-31T10:30:00Z",
  "createdAt": "2024-10-01T08:00:00Z",
  "updatedAt": "2024-10-31T12:00:00Z"
}
```

### Get Inventory
**GET** `/user/inventory`

Get user's item inventory.

**Response:**
```json
[
  {
    "itemId": "potion",
    "quantity": 5,
    "item": {
      "id": "potion",
      "name": "Potion",
      "description": "Restores 50 HP",
      "type": "Consumable",
      "rarity": "common",
      "effectHp": 50,
      "priceCoins": 100,
      "imageUrl": "/items/potion.png"
    }
  }
]
```

### Heal Energy
**PATCH** `/user/energy`

Regenerate energy (1 energy per 5 minutes since last heal).

**Response:**
```json
{
  "id": "uuid",
  "energy": 95,
  "maxEnergy": 100,
  "lastHealTime": "2024-10-31T12:00:00Z",
  "energyAdded": 15
}
```

### Get Statistics
**GET** `/user/stats`

Get user's game statistics.

**Response:**
```json
{
  "battlesWon": 12,
  "totalBattles": 20,
  "winRate": 60,
  "petsOwned": 8
}
```

---

## 🐾 Pet Module

### List All Pets
**GET** `/pet`

Get all pets owned by the user.

**Response:**
```json
[
  {
    "id": "uuid",
    "species": "Flamekit",
    "nickname": "Blaze",
    "rarity": "rare",
    "level": 10,
    "xp": 450,
    "hp": 120,
    "maxHp": 150,
    "attack": 45,
    "defense": 35,
    "speed": 40,
    "evolutionStage": 1,
    "mood": 85,
    "lastFed": "2024-10-31T10:00:00Z",
    "moves": [
      {
        "move": {
          "id": "ember",
          "name": "Ember",
          "type": "Special",
          "element": "Fire",
          "power": 40,
          "accuracy": 100
        }
      }
    ]
  }
]
```

### Get Pet Details
**GET** `/pet/:id`

Get details of a specific pet.

**Response:** Same as individual pet object above.

### Update Pet (Rename)
**PATCH** `/pet/:id`

Rename a pet.

**Request Body:**
```json
{
  "nickname": "Inferno"
}
```

**Response:** Updated pet object.

### Release Pet
**DELETE** `/pet/:id`

Release a pet (permanent deletion).

**Response:**
```json
{
  "message": "Pet released successfully"
}
```

### Feed Pet
**PATCH** `/pet/:id/feed`

Feed pet to increase mood (+20, max 100).

**Response:**
```json
{
  "id": "uuid",
  "mood": 100,
  "lastFed": "2024-10-31T12:00:00Z",
  "moodIncreased": 20
}
```

### Heal Pet
**PATCH** `/pet/:id/heal`

Use an item to heal pet.

**Request Body:**
```json
{
  "itemId": "potion"
}
```

**Response:**
```json
{
  "pet": { ... },
  "healAmount": 50,
  "itemUsed": "Potion"
}
```

---

## 🎒 Item Module

### Get Catalog
**GET** `/item/catalog`

Get all available items in the game.

**Response:**
```json
[
  {
    "id": "potion",
    "name": "Potion",
    "description": "Restores 50 HP",
    "type": "Consumable",
    "rarity": "common",
    "effectHp": 50,
    "priceCoins": 100,
    "imageUrl": "/items/potion.png"
  }
]
```

### Get Item Details
**GET** `/item/:id`

Get details of a specific item.

**Response:** Single item object.

### Buy Item
**POST** `/item/buy`

Purchase an item with coins or gems.

**Request Body:**
```json
{
  "itemId": "potion",
  "quantity": 3
}
```

**Response:**
```json
{
  "message": "Item purchased successfully",
  "item": "Potion",
  "quantity": 3,
  "totalCost": 300,
  "currency": "coin",
  "remainingCoins": 2200,
  "remainingGems": 150
}
```

### Use Item
**POST** `/item/use`

Use an item (on a pet or self).

**Request Body:**
```json
{
  "itemId": "potion",
  "petId": "uuid"  // Optional, required for pet items
}
```

**Response:**
```json
{
  "message": "Used Potion",
  "itemUsed": "Potion",
  "healAmount": 50,
  "pet": { ... }
}
```

---

## 🗺️ Region Module

### List Regions
**GET** `/region`

Get all regions unlocked for user's level.

**Response:**
```json
[
  {
    "id": "meadow-valley",
    "name": "Meadow Valley",
    "description": "A peaceful grassland...",
    "unlockLevel": 1,
    "energyCost": 10,
    "huntCost": 50,
    "imageUrl": "/regions/meadow.png"
  }
]
```

### Get Region Details
**GET** `/region/:id`

Get detailed information about a region.

**Response:**
```json
{
  "id": "meadow-valley",
  "name": "Meadow Valley",
  "description": "...",
  "unlockLevel": 1,
  "locked": false,
  "spawns": [
    {
      "id": "uuid",
      "species": "Leafpup",
      "rarity": "common",
      "spawnRate": 0.3,
      "minLevel": 1,
      "maxLevel": 5
    }
  ]
}
```

### Get Spawns
**GET** `/region/:id/spawns`

Get spawn rates for a region.

**Response:** Array of spawn objects.

---

## 🏹 Hunt Module

### Start Hunt Session
**POST** `/hunt/start`

Start a new hunting session (costs 10 energy + 50 coins).

**Request Body:**
```json
{
  "regionId": "meadow-valley"
}
```

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "regionId": "meadow-valley",
    "expiresAt": "2024-10-31T12:30:00Z"
  },
  "encounters": [
    {
      "id": "encounter_1",
      "species": "Leafpup",
      "rarity": "common",
      "level": 3,
      "hp": 35,
      "maxHp": 35,
      "attack": 11,
      "defense": 11,
      "speed": 11,
      "caught": false
    }
  ],
  "message": "Hunt session started! You have 30 minutes to complete it."
}
```

### Get Active Session
**GET** `/hunt/session`

Get current active hunting session.

**Response:** Same as start hunt response.

### Attempt Catch
**POST** `/hunt/catch`

Try to catch an encountered pet.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "encounterId": "encounter_1",
  "ballType": "pokeball"  // pokeball, greatball, ultraball
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Congratulations! You caught Leafpup!",
  "pet": { ... }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Leafpup broke free!"
}
```

### Flee Hunt
**POST** `/hunt/flee/:sessionId`

Abandon current hunt session.

**Response:**
```json
{
  "message": "You fled from the hunt."
}
```

### Complete Hunt
**POST** `/hunt/complete/:sessionId`

Complete the hunt session and save results.

**Response:**
```json
{
  "message": "Hunt completed!",
  "region": "Meadow Valley",
  "petsCaught": 2,
  "totalEncounters": 3
}
```

---

## ⚔️ Battle Module

### List Opponents
**GET** `/battle/opponents`

Get all opponents unlocked for user's level.

**Response:**
```json
[
  {
    "id": "rookie-trainer",
    "name": "Rookie Trainer",
    "species": "Leafpup",
    "level": 3,
    "difficulty": "Easy",
    "hp": 35,
    "maxHp": 35,
    "attack": 12,
    "defense": 10,
    "speed": 11,
    "rewardXp": 50,
    "rewardCoins": 100,
    "unlockLevel": 1,
    "moves": [
      {
        "move": {
          "id": "tackle",
          "name": "Tackle",
          "type": "Physical",
          "element": "Normal",
          "power": 40,
          "accuracy": 100
        }
      }
    ]
  }
]
```

### Get Opponent Details
**GET** `/battle/opponents/:id`

Get detailed information about an opponent.

**Response:** Single opponent object with moves.

### Start Battle
**POST** `/battle/start`

Start a battle session.

**Request Body:**
```json
{
  "petId": "uuid",
  "opponentId": "rookie-trainer"
}
```

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "petId": "uuid",
    "opponentId": "rookie-trainer",
    "battleType": "exp"
  },
  "pet": { ... },
  "opponent": { ... },
  "message": "Battle started!"
}
```

### Complete Battle
**POST** `/battle/complete`

Submit battle results (called by client after battle).

**Request Body:**
```json
{
  "sessionId": "uuid",
  "won": true,
  "damageDealt": 120,
  "damageTaken": 35
}
```

**Response:**
```json
{
  "won": true,
  "xpReward": 50,
  "coinReward": 100,
  "pet": {
    "leveledUp": true,
    "newLevel": 11,
    "currentHp": 85
  },
  "user": {
    "leveledUp": false,
    "newLevel": 5
  },
  "message": "Victory! You earned 50 XP and 100 coins!"
}
```

### Get Battle History
**GET** `/battle/history?limit=10`

Get user's battle history.

**Response:**
```json
[
  {
    "id": "uuid",
    "battleType": "exp",
    "result": "victory",
    "xpEarned": 50,
    "coinsEarned": 100,
    "turnsTaken": 5,
    "createdAt": "2024-10-31T11:00:00Z",
    "opponent": {
      "name": "Rookie Trainer",
      "species": "Leafpup"
    },
    "pet": {
      "species": "Flamekit",
      "nickname": "Blaze"
    }
  }
]
```

---

## 📊 Game Mechanics

### Energy System
- Maximum energy: 100
- Hunt cost: 10 energy
- Regeneration: 1 energy per 5 minutes
- Call `PATCH /user/energy` to regenerate based on time elapsed

### Currency
- **Coins**: Earned from battles, used to buy common items and start hunts
- **Gems**: Premium currency, used for rare items

### Level System
- **Pets**: Gain XP from battles, level up increases stats
  - XP per level: `level * 100`
  - Stat gains: +5 HP, +2 Attack, +2 Defense, +2 Speed
  
- **Users**: Gain XP from battles, unlock new regions/opponents
  - XP per level: `level * 200`
  - Leveling up unlocks new content

### Catch Mechanics
- **Pokeball**: 40% base catch rate
- **Greatball**: 60% base catch rate  
- **Ultraball**: 80% base catch rate
- Modified by rarity:
  - Common: ×1.2
  - Uncommon: ×1.0
  - Rare: ×0.7
  - Epic: ×0.5
  - Legendary: ×0.3

### Battle Rewards
- **Victory**: Full XP and coins
- **Defeat**: 30% of XP and coins

---

## 🔧 Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation failed, insufficient resources)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 📝 Testing with cURL

### Register & Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testplayer","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Using Protected Endpoints
```bash
# Get profile
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Start hunt
curl -X POST http://localhost:3000/api/hunt/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"regionId":"meadow-valley"}'
```

---

## 🚀 Development Notes

- Server runs on `http://localhost:3000`
- API prefix: `/api`
- Database: PostgreSQL on port 5433
- Hot reload enabled in development
- CORS enabled for all origins

For more information, see the implementation status documentation.
