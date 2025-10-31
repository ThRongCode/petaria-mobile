# VnPeteria Backend - Quick Start Guide

## 🚀 Running the Backend

### 1. Start Database
```bash
cd /Users/hiep/VnPeteria/VnPet/backend
docker-compose up -d
```

### 2. Start Server
```bash
npm run start:dev
```

**Server will be available at:** `http://localhost:3000/api`

---

## 🧪 Quick Testing

### Test 1: Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@vnpet.com",
    "username": "coolplayer",
    "password": "SecurePass123!"
  }'
```

**Save the `access_token` from response!**

### Test 2: Get Profile
```bash
# Replace YOUR_TOKEN with the token from step 1
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: List Regions
```bash
curl http://localhost:3000/api/region \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Start Hunt
```bash
curl -X POST http://localhost:3000/api/hunt/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regionId": "meadow-valley"}'
```

### Test 5: Catch a Pet
```bash
# Use sessionId and encounterId from step 4 response
curl -X POST http://localhost:3000/api/hunt/catch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_ID_HERE",
    "encounterId": "ENCOUNTER_ID_HERE",
    "ballType": "pokeball"
  }'
```

### Test 6: List Your Pets
```bash
curl http://localhost:3000/api/pet \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 7: Start Battle
```bash
# Use petId from step 6
curl -X POST http://localhost:3000/api/battle/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "YOUR_PET_ID",
    "opponentId": "rookie-trainer"
  }'
```

---

## 📁 File Locations

### Code
- **Modules:** `/Users/hiep/VnPeteria/VnPet/backend/src/`
  - `auth/` - Authentication
  - `user/` - User management
  - `pet/` - Pet CRUD
  - `item/` - Items & shop
  - `region/` - Hunting regions
  - `hunt/` - Hunting system
  - `battle/` - Battle system

### Configuration
- **Environment:** `/Users/hiep/VnPeteria/VnPet/backend/.env`
- **Database Schema:** `/Users/hiep/VnPeteria/VnPet/backend/prisma/schema.prisma`
- **Seed Data:** `/Users/hiep/VnPeteria/VnPet/backend/prisma/seed.ts`

### Documentation
- **API Reference:** `/Users/hiep/VnPeteria/VnPet/backend/API_DOCUMENTATION.md`
- **Complete Summary:** `/Users/hiep/VnPeteria/VnPet/backend/BACKEND_COMPLETE.md`
- **This Guide:** `/Users/hiep/VnPeteria/VnPet/backend/QUICK_START.md`

---

## 🛠️ Common Commands

```bash
# Development
npm run start:dev       # Start with hot reload
npm run build          # Compile TypeScript
npm run start:prod     # Production mode

# Database
docker-compose up -d    # Start PostgreSQL
docker-compose down     # Stop PostgreSQL
npx prisma studio      # Open database GUI
npm run seed           # Re-seed database

# Prisma
npx prisma generate    # Update Prisma Client
npx prisma migrate dev # Create new migration
npx prisma migrate deploy # Apply migrations

# Debugging
docker ps              # Check if database is running
npm run start:dev      # Check server logs
curl http://localhost:3000/api/auth/me # Test server
```

---

## 📊 Available Data (Seeded)

### Items (10 total)
- `potion` - Restores 50 HP (100 coins)
- `super-potion` - Restores 100 HP (200 coins)
- `hyper-potion` - Restores 150 HP (500 coins)
- `protein` - +5 Attack (1000 coins)
- `iron` - +5 Defense (1000 coins)
- `carbos` - +5 Speed (1000 coins)
- `hp-up` - +10 Max HP (1500 coins)
- `rare-candy` - +10 XP Boost (50 gems)
- `evolution-stone` - Evolution trigger (100 gems)
- `revive` - Revive fainted pet (300 coins)

### Regions (5 total)
1. `meadow-valley` - Level 1+ (Leafpup, Flamekit common)
2. `forest-grove` - Level 5+ (Aquafin uncommon)
3. `volcanic-peak` - Level 10+ (Flamekit, Boltpup rare)
4. `crystal-lake` - Level 15+ (Aquafin rare, Frostling)
5. `thunder-plains` - Level 20+ (Boltpup epic, Stoneclaw)

### Opponents (5 total)
1. `rookie-trainer` - Level 3, Easy (50 XP, 100 coins)
2. `amateur-battler` - Level 7, Medium (100 XP, 250 coins)
3. `veteran-trainer` - Level 12, Hard (200 XP, 500 coins)
4. `expert-master` - Level 18, Expert (350 XP, 1000 coins)
5. `elite-champion` - Level 25, Champion (500 XP, 2000 coins)

### Moves (19 total)
- **Normal:** Tackle, Scratch, Quick Attack
- **Fire:** Ember, Flame Burst, Flamethrower
- **Water:** Water Gun, Bubble Beam, Hydro Pump
- **Grass:** Vine Whip, Razor Leaf, Solar Beam
- **Electric:** Thunder Shock, Spark, Thunderbolt

---

## 🎮 Game Flow Example

1. **Register** → Get token
2. **Check profile** → See starting resources (1000 coins, 50 gems, 100 energy)
3. **Browse regions** → See Meadow Valley (unlocked at level 1)
4. **Start hunt** → Costs 10 energy + 50 coins → Get 3 encounters
5. **Catch pets** → Use pokeball on encounters → Success adds to inventory
6. **List pets** → See your new pets with stats
7. **Feed pet** → Increase mood
8. **Buy items** → Get potions from shop
9. **Heal pet** → Use potion on pet
10. **List opponents** → See Rookie Trainer
11. **Start battle** → Choose pet vs opponent
12. **Complete battle** → Submit results → Get XP + coins
13. **Level up** → Unlock new regions/opponents
14. **Repeat!**

---

## ⚠️ Important Notes

### Energy System
- Starts at 100
- Hunt costs 10 energy
- Regenerates 1 per 5 minutes
- Call `PATCH /user/energy` to heal based on time

### Hunt Sessions
- Expire after 30 minutes
- Only one active session at a time
- Must complete or flee to start new hunt

### Battle Sessions
- No expiry (but should complete)
- Results validated to prevent cheating

### Currency
- **Coins:** Earned from battles, used for hunting & items
- **Gems:** Premium, used for rare items
- Starting balance: 1000 coins, 50 gems

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Database connection error
```bash
# Check if Docker container is running
docker ps | grep vnpeteria-db

# Restart container
docker-compose restart
```

### "Table does not exist" error
```bash
# Run migrations
npx prisma migrate deploy

# Re-seed
npm run seed
```

### JWT errors
- Check `.env` has `JWT_SECRET` set
- Token might be expired (7-day lifetime)
- Re-login to get new token

---

## 🔗 Full Documentation

For complete API reference with all endpoints, request/response formats, and game mechanics, see:

**📘 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

For detailed implementation status and technical details, see:

**📗 [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md)**

---

## ✅ Health Check

```bash
# Quick server test
curl http://localhost:3000/api/auth/me

# Should return: {"statusCode":401,"message":"Unauthorized"}
# This means server is UP and auth is working!
```

---

**Backend is ready! Start building your mobile app! 🚀**
