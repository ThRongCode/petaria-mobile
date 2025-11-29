# 🚀 VnPeteria - Local Development Startup Guide

## Prerequisites
- ✅ Docker Desktop installed and running
- ✅ Node.js 16+ installed
- ✅ Yarn installed
- ✅ Expo Go app on your phone (for mobile testing)

---

## 🎯 Quick Start (Every Time You Develop)

### 1️⃣ Start Backend Server

```bash
# Terminal 1 - Start Backend
cd /Users/hito/PetProject/VnPet/backend
npm run start:dev
```

**✅ Success when you see:**
```
🚀 VnPeteria API running on http://localhost:3000/api
```

---

### 2️⃣ Start Mobile App (Frontend)

```bash
# Terminal 2 - Start Expo
cd /Users/hito/PetProject/VnPet
npx expo start
# or
yarn start
```

**✅ Success when you see:**
- QR code displayed in terminal
- Options for running on iOS/Android/Web

---

### 3️⃣ Run on Device

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app on your phone
2. Scan the QR code from terminal
3. App will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
yarn ios
```

**Option C: Android Emulator**
```bash
yarn android
```

---

## 🔧 Database Management

### Check if Database is Running
```bash
docker ps
# Should show: vnpeteria-db container
```

### Start Database (if stopped)
```bash
cd /Users/hito/PetProject/VnPet/backend
docker-compose up -d
```

### Stop Database
```bash
cd /Users/hito/PetProject/VnPet/backend
docker-compose down
```

### View Database in GUI
```bash
cd /Users/hito/PetProject/VnPet/backend
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🔑 Test Account

Use this account to login in the app:
```
Email: test@vnpet.com
Password: password123
```

---

## 🛑 Stop Everything

```bash
# Stop Backend
# Press Ctrl+C in Terminal 1 (backend)

# Stop Frontend
# Press Ctrl+C in Terminal 2 (expo)

# Stop Database
cd /Users/hito/PetProject/VnPet/backend
docker-compose down
```

---

## 📱 Mobile App Configuration

The app is currently set to use **REAL API** mode (not mock).

Location: `src/services/api/config.ts`
```typescript
useMock: false,  // Using real backend
baseURL: 'http://localhost:3000/api'
```

### Important for Physical Devices
If testing on a physical phone, you need to:
1. Make sure phone and computer are on same WiFi
2. Replace `localhost` with your computer's local IP address
3. Update `src/services/api/config.ts`:
   ```typescript
   baseURL: 'http://192.168.X.X:3000/api'  // Use your IP
   ```

To find your IP:
```bash
# Mac
ifconfig | grep "inet "

# Should see something like: inet 192.168.1.XXX
```

---

## 🔍 Verify Everything is Working

### 1. Check Backend
```bash
curl http://localhost:3000/api
# Should return: Hello World!
```

### 2. Test Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vnpet.com","password":"password123"}'
# Should return JWT token
```

### 3. Check Database
```bash
docker exec vnpeteria-db psql -U postgres -d vnpeteria -c "SELECT COUNT(*) FROM users;"
# Should show: 1 user
```

---

## 🎮 Development Workflow

### Typical Day:
1. **Start Docker Desktop** (if not auto-starting)
2. **Open 2 terminals**
3. **Terminal 1**: `cd backend && npm run start:dev`
4. **Terminal 2**: `cd .. && yarn start`
5. **Scan QR** with Expo Go app
6. **Start coding!** 🚀

### Hot Reload:
- **Backend**: Auto-reloads on file save (watch mode)
- **Frontend**: Auto-reloads on save (Fast Refresh)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if database is running
docker ps

# Check if port 3000 is in use
lsof -ti:3000

# Kill process on port 3000
kill -9 $(lsof -ti:3000)
```

### Database connection error
```bash
# Restart database
cd backend
docker-compose down
docker-compose up -d

# Wait 5 seconds, then restart backend
npm run start:dev
```

### Expo won't start
```bash
# Clear cache
npx expo start -c

# Or clear node_modules
rm -rf node_modules
yarn install
```

### Can't connect from phone
1. Check same WiFi network
2. Update API baseURL to computer's IP
3. Restart Expo server
4. Make sure firewall allows port 3000

---

## 📚 Useful Commands

```bash
# Backend
npm run start:dev        # Start dev server
npm run build           # Build for production
npm run prisma:studio   # Open database GUI
npm run prisma:seed     # Re-seed database

# Frontend
yarn start              # Start Expo
yarn android           # Run on Android
yarn ios               # Run on iOS
yarn test              # Run tests
yarn lint              # Check code style

# Database
docker-compose up -d    # Start database
docker-compose down     # Stop database
docker-compose logs     # View logs
docker ps               # List containers
```

---

## 🎯 Next Steps After Setup

1. ✅ Login with test account
2. ✅ Explore the home screen
3. ✅ Try hunting in a region
4. ✅ Catch some Pokemon
5. ✅ Battle an opponent
6. ✅ Check your collection

Happy Gaming! 🎮✨
