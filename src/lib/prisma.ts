import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Setup
 * 
 * I created this file to properly manage my database connections using Prisma ORM.
 * The key goals of this setup are:
 * 1. Create a singleton PrismaClient instance to prevent connection exhaustion
 * 2. Support initial database seeding for testing
 * 3. Handle proper connection cleanup
 * 
 * The database connection uses the DATABASE_URL from environment variables,
 * which points to either a local SQLite database (dev.db) or a PostgreSQL 
 * database in Google Cloud (currently configured).
 */

// PrismaClient is attached to the `global` object in development to prevent
// exhausting database connection limit during hot reloads.
// See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// I'm creating a singleton instance of PrismaClient to avoid connection issues
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

// In development, I save the instance to the global object to reuse between reloads
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * I wrote this function to set up the database with initial data for testing
 * This is useful during development or when deploying to a new environment
 */
export async function seedDatabase() {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("Connected to database.");

  // I check if there are any existing users before seeding
  const userCount = await prisma.user.count();
  console.log(`Found ${userCount} existing users in database.`);

  // Only add test data if the database is empty
  if (userCount === 0) {
    console.log("Seeding database with test user...");
    
    // I create a test user with sample data
    const testUser = await prisma.user.create({
      data: {
        fullName: "Test User",
        idNumber: "TEST12345",
        dateOfBirth: "1990-01-01",
        expiryDate: "2030-01-01",
        address: "123 Test Street, Test City, TC 12345"
      }
    });
    
    console.log(`Created test user with ID: ${testUser.id}`);
  } else {
    console.log("Database already has users, skipping seed.");
  }

  // I clean up any test users from previous runs to avoid clutter
  await prisma.user.delete({
    where: {
      idNumber: "DELETE_ME_TEST"
    }
  }).catch(() => {
    // Ignore errors if the user doesn't exist
    console.log("No test user to clean up.");
  });

  console.log("Database setup complete.");
}

// Test database connection and permissions
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL (redacted):', process.env.DATABASE_URL?.replace(/:(.*?)@/, ':****@'));
    
    // Test basic connectivity
    await prisma.$connect();
    console.log('Database connection established');
    
    // Test read access
    const userCount = await prisma.user.count();
    console.log(`Database read access confirmed. User count: ${userCount}`);
    
    // Test write access with a temporary record
    const testId = `TEST-${Date.now()}`;
    console.log(`Testing write access with ID: ${testId}`);
    
    const testUser = await prisma.user.create({
      data: {
        fullName: 'TEST USER - DELETE ME',
        idNumber: testId,
        dateOfBirth: '2000-01-01',
        expiryDate: null,
        address: null,
        photoUrl: null
      }
    });
    
    console.log(`Write test successful. Created test user with ID: ${testUser.id}`);
    console.log(`Test user data:`, JSON.stringify(testUser, null, 2));
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('Delete test successful. Database connection fully verified.');
    
    return true;
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error);
    return false;
  }
}

// Run the test in development
if (process.env.NODE_ENV !== 'production') {
  testDatabaseConnection()
    .then(result => {
      if (!result) {
        console.error('DATABASE CONNECTION TEST FAILED! Check your connection settings.');
      } else {
        console.log('Database connection verified successfully.');
      }
    })
    .catch(err => {
      console.error('Failed to run database test:', err);
    });
} 