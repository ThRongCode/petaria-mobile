# VnPeteria API - Quick Test Guide

## Base URL
```
http://localhost:3000/api
```

## ✅ Working Endpoints (Ready to Test)

### 1. Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "player1@test.com",
  "username": "player1",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "player1@test.com",
    "username": "player1",
    "level": 1,
    "xp": 0,
    "coins": 1000,
    "gems": 50,
    "energy": 100,
    "maxEnergy": 100
  }
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@test.com",
  "password": "password123"
}
```

**Response:** Same as register

### 3. Get Current User Profile (Protected)
```bash
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Response:**
```json
{
  "id": "uuid",
  "email": "player1@test.com",
  "username": "player1",
  "level": 1,
  "xp": 0,
  "coins": 1000,
  "gems": 50,
  "energy": 100,
  "maxEnergy": 100
}
```

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "mypassword"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "mypassword"
  }'
```

### Get Profile (Protected)
```bash
# Save your token from login response first
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Testing with Postman/Insomnia

1. **Create a new request collection** called "VnPeteria API"

2. **Set up environment variables:**
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: (will be set after login)

3. **Register Request:**
   - Method: POST
   - URL: `{{baseUrl}}/auth/register`
   - Body: JSON
   ```json
   {
     "email": "user@test.com",
     "username": "testuser",
     "password": "password123"
   }
   ```

4. **Login Request:**
   - Method: POST
   - URL: `{{baseUrl}}/auth/login`
   - Body: JSON
   - **Script** (to auto-save token):
   ```javascript
   // Postman: In "Tests" tab
   pm.environment.set("token", pm.response.json().accessToken);
   
   // Insomnia: Not needed, use response references
   ```

5. **Protected Requests:**
   - Add header: `Authorization: Bearer {{token}}`
   - Or use Postman/Insomnia's "Auth" tab → "Bearer Token"

## 📊 Database Exploration

View seeded data in Prisma Studio:
```bash
cd /Users/hiep/VnPeteria/VnPet/backend
npm run prisma:studio
```

Opens at: `http://localhost:5555`

**Tables to Explore:**
- **items** - 10 game items (potions, boosts, etc.)
- **moves** - 19 battle moves
- **regions** - 5 hunting areas
- **region_spawns** - 36 pet spawn configurations
- **opponents** - 5 battle opponents
- **opponent_moves** - Opponent movesets

## ❌ Expected Errors (Good for Testing)

### Invalid Email Format
```bash
POST /api/auth/register
{
  "email": "notanemail",
  "username": "user1",
  "password": "pass123"
}
```
**Response:** 400 Bad Request - "email must be an email"

### Short Password
```bash
POST /api/auth/register
{
  "email": "user@test.com",
  "username": "user1",
  "password": "123"
}
```
**Response:** 400 Bad Request - "password must be longer than or equal to 6 characters"

### Invalid Username Characters
```bash
POST /api/auth/register
{
  "email": "user@test.com",
  "username": "user@123",
  "password": "password"
}
```
**Response:** 400 Bad Request - "Username can only contain letters, numbers, hyphens, and underscores"

### Duplicate Email
```bash
# Register same email twice
POST /api/auth/register (twice with same email)
```
**Response:** 409 Conflict - "Email already registered"

### Invalid Credentials
```bash
POST /api/auth/login
{
  "email": "user@test.com",
  "password": "wrongpassword"
}
```
**Response:** 401 Unauthorized - "Invalid credentials"

### Missing Auth Token
```bash
GET /api/auth/me
# Without Authorization header
```
**Response:** 401 Unauthorized

### Invalid/Expired Token
```bash
GET /api/auth/me
Authorization: Bearer invalid_token_here
```
**Response:** 401 Unauthorized

## 🎯 Success Indicators

✅ **Registration works** if you get back:
- A valid JWT token
- User object with id, email, username
- Default starter values (1000 coins, 50 gems, 100 energy)

✅ **Login works** if you can:
- Login with registered credentials
- Get a new JWT token
- Token format: `eyJ...` (3 parts separated by dots)

✅ **Protected routes work** if:
- `/api/auth/me` returns 401 without token
- `/api/auth/me` returns user data with valid token
- Token must start with "Bearer " in Authorization header

## 🔍 Debugging Tips

**Server not responding?**
```bash
# Check if server is running
curl http://localhost:3000/api

# Should return: {"statusCode":404,"message":"Cannot GET /api"}
# (This is good - means server is up!)
```

**Database connection issues?**
```bash
# Check if Docker container is running
docker ps | grep vnpeteria-db

# Should show container on port 5433
```

**JWT token issues?**
```bash
# Decode token at: https://jwt.io
# Should show:
# - Header: {"alg":"HS256","typ":"JWT"}
# - Payload: {"sub":"user-id","email":"...","username":"...","iat":...,"exp":...}
```

## 📝 Next Steps After Testing

Once you've verified auth works:
1. ✅ You have a working user system
2. ✅ You can create accounts and login
3. ✅ You can protect routes with JWT
4. ⏭️ Ready to implement remaining modules (User, Pet, Item, Hunt, Battle, Region)

Each new module will follow the same pattern:
- Protected routes requiring `@UseGuards(JwtAuthGuard)`
- Access to current user via `@CurrentUser()` decorator
- Database operations via Prisma
- Request validation via DTOs with class-validator

**The foundation is solid!** 🎉
