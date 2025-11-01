import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...')

    // Check if test user already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'test@vnpet.com' },
    })

    if (existing) {
      console.log('✅ Test user already exists!')
      console.log('📧 Email: test@vnpet.com')
      console.log('🔑 Password: password123')
      console.log('👤 Username:', existing.username)
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@vnpet.com',
        username: 'testtrainer',
        passwordHash,
        huntTickets: 5,
        battleTickets: 20,
        petCount: 0,
        itemCount: 0,
        coins: 1000,
        gems: 50,
      },
    })

    console.log('✅ Test user created successfully!')
    console.log('')
    console.log('📋 Test Account Details:')
    console.log('─────────────────────────────────')
    console.log('📧 Email:          test@vnpet.com')
    console.log('🔑 Password:       password123')
    console.log('👤 Username:       testtrainer')
    console.log('🎫 Hunt Tickets:   5')
    console.log('⚔️  Battle Tickets: 20')
    console.log('💰 Coins:          1000')
    console.log('💎 Gems:           50')
    console.log('─────────────────────────────────')
    console.log('')
    console.log('🎮 You can now sign in with these credentials!')
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
