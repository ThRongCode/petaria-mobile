# Mock API Logging System

## Overview

The mock API now includes comprehensive colored logging to help you track all database changes in real-time. You'll see exactly what's happening with your data when you interact with the app.

## What Gets Logged

### 📤 API Requests
Every API call shows:
- HTTP method and endpoint
- Request parameters
- Color: **Blue**

Example:
```
📤 [MOCK API] POST /hunt/start
   📋 Request: { regionId: 'forest-region-1', userId: 'user-001' }
```

### ✅ API Responses
Success responses show:
- Response data summary
- Color: **Green**

Example:
```
   ✅ Response Success
    { success: true, petCaught: {...}, updatedCoins: 9500 }
```

### ❌ Errors
Failed requests show:
- Error code and message
- Color: **Red**

Example:
```
   ❌ Error [INSUFFICIENT_FUNDS]: Insufficient coins
```

### 💾 Database Updates
All database modifications show:
- Entity type (User, Pet, Battle, Auction, etc.)
- Action performed
- Details of the change
- Color: **Orange**

Example:
```
   💾 [DB] User - Deducted hunting cost
    { region: 'Mystic Forest', cost: 100 }
```

### 📊 State Changes
Important state changes show before/after values:
- Coins gained/lost
- Pet level ups
- Battle stats
- Color: **Purple**

Example:
```
   📊 💰 Coins
      Before: 10000
      After:  9500
```

### 🎉 Highlights
Special events are highlighted:
- Pet caught
- Level up
- Battle victory
- Auction created
- Color: **Cyan**

Example:
```
   🎉 Caught Pikachu! (Level 3, Rare)
```

## Example Logs

### 1. Login Flow

```
📤 [MOCK API] POST /auth/login
   📋 Request: { email: 'test@test.com' }
   💾 [DB] Session - Created
    { userId: 'user-001', username: 'TrainerAsh' }
   🎉 Welcome back, TrainerAsh!
   ✅ Response Success
    { token: 'token-...', userId: 'user-001' }
```

### 2. Hunting Flow

```
📤 [MOCK API] POST /hunt/start
   📋 Request: { regionId: 'forest-region-1', userId: 'user-001' }
   📊 💰 Coins
      Before: 10000
      After:  9500
   💾 [DB] User - Deducted hunting cost
    { region: 'Mystic Forest', cost: 500 }
   🎉 Caught Pikachu! (Level 3, Common)
   💾 [DB] Pet - Added to collection
    { id: 'pet-123', name: 'Pikachu', level: 3, rarity: 'Common' }
   ✅ Response Success
```

### 3. Battle Flow (with Level Up!)

```
📤 [MOCK API] POST /battle/complete
   📋 Request: { battleId: 'battle-123', winner: 'player', petId: 'pet-001' }
   🎉 🎊 Victory against Charizard!
   📊 💰 Coins
      Before: 9500
      After:  10000
   📊 🏆 Battle Stats
      Before: { wins: 10, losses: 5 }
      After:  { wins: 11, losses: 5 }
   🎉 Sparky leveled up! 15 → 16
   📊 Sparky Stats
      Before: { level: 15, hp: 55, attack: 35 }
      After:  { level: 16, hp: 60, attack: 38 }
   💾 [DB] Battle - Recorded
    { id: 'battle-123', winner: 'player' }
   ✅ Response Success
```

### 4. Feed Pet Flow

```
📤 [MOCK API] POST /pets/feed
   📋 Request: { petId: 'pet-001' }
   📊 🍖 Sparky Mood
      Before: 80
      After:  90
   💾 [DB] Pet - Fed
    { name: 'Sparky', mood: 90 }
   ✅ Response Success
```

### 5. Auction Flow

```
📤 [MOCK API] POST /auction/create
   📋 Request: { itemType: 'pet', itemId: 'pet-001', startingBid: 1000 }
   🎉 🏪 Auction created for pet
   💾 [DB] Auction - Created
    { id: 'auction-123', startingBid: 1000, buyoutPrice: 5000 }
   ✅ Response Success

📤 [MOCK API] POST /auction/bid
   📋 Request: { auctionId: 'auction-123', amount: 1500 }
   🎉 💰 Bid placed!
   📊 Auction Bid
      Before: 1000
      After:  1500
   💾 [DB] Auction - Bid placed
    { auctionId: 'auction-123', bidder: 'TrainerAsh', amount: 1500 }
   ✅ Response Success
```

## Viewing Logs

### In React Native
1. Open your development tools
2. Check the **Console** tab
3. Logs appear in **color** with emojis

### In Expo
```bash
# Terminal logs
npx expo start

# Then press 'j' to open debugger
# Logs will appear in Chrome DevTools console
```

### Filtering Logs
In Chrome DevTools console, you can filter by:
- `[MOCK API]` - See only API calls
- `[DB]` - See only database updates
- `🎉` - See only highlights
- `❌` - See only errors

## Disabling Logs

Logs are automatically disabled in production. To disable in development:

```typescript
// In mockApi.ts
class MockApiLogger {
  private enabled = false // Change to false
  // ...
}
```

## Log Colors Reference

| Color | Purpose | Example |
|-------|---------|---------|
| 🔵 Blue | API Requests | `POST /hunt/start` |
| 🟢 Green | Success Responses | `Response Success` |
| 🔴 Red | Errors | `Error [INSUFFICIENT_FUNDS]` |
| 🟠 Orange | Database Updates | `[DB] User - Updated` |
| 🟣 Purple | State Changes | `Coins: 1000 → 900` |
| 🔷 Cyan | Highlights | `Level up!` |

## Benefits

### 1. **Transparency**
See exactly what's happening with your data

### 2. **Debugging**
Quickly identify issues with state changes

### 3. **Learning**
Understand how API calls affect the database

### 4. **Testing**
Verify that actions produce expected results

### 5. **Development**
Track data flow during feature development

## What You'll Notice

When you:

✅ **Hunt**: See coins deducted, pets added
✅ **Battle**: See XP gains, level ups, coins earned
✅ **Feed Pet**: See mood increases
✅ **Create Auction**: See auction records created
✅ **Place Bid**: See bid amounts update

All in **real-time** with **color-coded** logs! 🎨

## Production

Logs are automatically disabled in production builds:
- No performance impact
- No console clutter
- Controlled by `__DEV__` flag

## Summary

The mock API logging system gives you **full visibility** into:
- 📤 Every API request
- 💾 Every database change
- 📊 Every state transition
- 🎉 Every important event

**Now you can see your mock backend working in real-time!**
