import { PrismaClient } from '@prisma/client'

// Global is used here to maintain a single instance of Prisma Client across hot reloads during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to PostgreSQL database')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    return false
  }
}

// Database disconnect helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error)
  }
}

export default prisma
