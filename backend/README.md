# VnPeteria Backend API

Pokemon-inspired mobile game backend built with NestJS, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (already installed and running)
- npm or yarn

### Setup Instructions

The backend has been initialized! Here's what's ready:

✅ **PostgreSQL Database**  
- Running in Docker as `vnpeteria-db`
- Port: 5433 (to avoid conflicts)
- Database name: `vnpeteria`
- Credentials: postgres/postgres

✅ **Database Schema Created**  
All 15 tables are set up:
- Users & authentication
- Pets & pet moves
- Items & user inventory
- Hunting regions & spawns
- Battle opponents & sessions
- Hunt sessions & history

✅ **Development Ready**
```bash
# Start the NestJS server
npm run start:dev

# The API will be at http://localhost:3000
```

### Docker Commands

```bash
# View running containers
docker ps

# Stop the database
docker-compose down

# Start the database
docker-compose up -d

# View database logs
docker logs vnpeteria-db
```

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Create a new migration
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vnpeteria?schema=public" npx prisma migrate dev --name description_here

# Reset database (⚠️  deletes all data)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vnpeteria?schema=public" npx prisma migrate reset
```

## 📊 Database Schema

### Core Models
- **User** - Player accounts with stats, coins, gems, energy
- **Pet** - Collected creatures with stats, levels, moves
- **Item** - Static catalog of consumables, boosts, evolution items
- **UserItem** - Player inventory (junction table)

### Hunting System
- **Region** - Hunting areas with unlock levels and costs
- **RegionSpawn** - Spawn rates for pets in each region
- **HuntSession** - Active hunting sessions
- **Hunt** - Completed hunt history

### Battle System
- **Opponent** - Static AI opponents with difficulty levels
- **BattleSession** - Active battle instances
- **Battle** - Completed battle history

### Moves System
- **Move** - Static movepool (attacks, abilities)
- **PetMove** - Pet's learned moves (PP tracking)
- **OpponentMove** - Opponent's moveset

## 🔑 Environment Variables

Copy `.env.example` to `.env` and update:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vnpeteria?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"
```

## 🚧 Next Steps

1. **Create seed file** - Populate database with static game data (items, moves, regions, opponents)
2. **Build Auth module** - JWT authentication (register, login)
3. **Build User module** - Profile management, stats
4. **Build Pet module** - CRUD operations for pets
5. **Build Hunt module** - Multi-step hunting flow
6. **Build Battle module** - Battle result validation

## 📝 Notes

- Database uses port **5433** (not 5432) to avoid conflicts
- Always prefix Prisma commands with the DATABASE_URL
- Docker container name: `vnpeteria-db`
- Volume name: `vnpeteria_db_data` (persists data)
