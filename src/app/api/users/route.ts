import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a fresh connection
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('USERS API: Fetching all users');
    
    // Get all users, ordered by most recent first
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`USERS API: Found ${users.length} users`);
    
    return NextResponse.json({ 
      users,
      count: users.length
    });
    
  } catch (error: any) {
    console.error('USERS API ERROR:', error);
    
    return NextResponse.json({
      error: error.message || 'Failed to fetch users',
      users: []
    }, { 
      status: 500 
    });
    
  } finally {
    await prisma.$disconnect();
  }
} 