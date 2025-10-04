import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    // Test database connection by performing a simple query
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful' 
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
