import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { users } from '../scan-id/route';

// Create the Prisma client
const prisma = new PrismaClient();

// Define a user type for in-memory storage
interface User {
  id: number;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  expiryDate?: string;
  address?: string;
  photoUrl?: string | null;
  createdAt: string;
}

// Import users from scan-id route
// const users: User[] = [];

export async function GET() {
  try {
    // Try to query the database first
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`Retrieved ${dbUsers.length} users from database`);
      return NextResponse.json(dbUsers);
    } catch (dbError) {
      console.error('Error fetching from database, falling back to in-memory storage:', dbError);
      
      // Fall back to in-memory users if database query fails
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
} 