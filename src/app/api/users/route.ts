import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Users API Route (/api/users)
 * 
 * I created this API endpoint to provide access to all saved ID records.
 * It's primarily used by the Dashboard page to display all records in a table.
 * 
 * The endpoint:
 * 1. Connects to the PostgreSQL database using Prisma
 * 2. Retrieves all user records, sorted by most recent first
 * 3. Returns the data as JSON for client-side rendering
 */

// I'm creating a new PrismaClient instance to interact with the database
const prisma = new PrismaClient();

/**
 * I implemented a GET handler to fetch all user records from the database
 * This provides the data needed for the dashboard table view
 */
export async function GET(request: NextRequest) {
  try {
    console.log('USERS API: Fetching all users');
    
    // I retrieve all users, ordered by most recent first for better UX
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`USERS API: Found ${users.length} users`);
    
    // I return the users array along with a count for easier client-side processing
    return NextResponse.json({ 
      users,
      count: users.length
    });
    
  } catch (error: any) {
    console.error('USERS API ERROR:', error);
    
    // I return an error response with an empty users array to prevent client-side errors
    return NextResponse.json({
      error: error.message || 'Failed to fetch users',
      users: []
    }, { 
      status: 500 
    });
    
  } finally {
    // I make sure to disconnect from the database to prevent connection leaks
    await prisma.$disconnect();
  }
} 