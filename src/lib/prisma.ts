import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting the database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn', 'info'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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