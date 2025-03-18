import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Minimal Save Form API Route (/api/minimal-save-form)
 * 
 * I created this API endpoint to handle form submissions from the ID Scanner application.
 * It's designed to:
 * 1. Receive ID information via URL query parameters
 * 2. Check for duplicate ID numbers in the database
 * 3. Save valid data to the PostgreSQL database
 * 4. Return an appropriate HTML response page (success or error)
 * 
 * I chose to use URL parameters instead of a request body because it allows
 * for a simpler implementation with direct browser navigation, without 
 * requiring a separate fetch API call.
 */

// I'm creating a new PrismaClient instance to interact with the database
const prisma = new PrismaClient();

/**
 * I implemented a GET handler that processes form submissions via URL parameters
 * This approach allows for simpler implementation with direct browser navigation
 */
export async function GET(request: NextRequest) {
  try {
    console.log('MINIMAL-SAVE-FORM: Starting');
    
    // I extract the form data from URL query parameters
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';
    const id = url.searchParams.get('id') || '';
    const dob = url.searchParams.get('dob') || '';
    const expiry = url.searchParams.get('expiry') || null;
    const address = url.searchParams.get('address') || '';
    
    console.log('MINIMAL-SAVE-FORM: Received parameters:');
    console.log('  - name:', name);
    console.log('  - id:', id);
    console.log('  - dob:', dob);
    console.log('  - expiry:', expiry);
    console.log('  - address:', address);
    
    // I validate that all required fields are provided
    if (!name || !id || !dob) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error: Missing Required Fields</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                min-height: 100vh;
                background: linear-gradient(to bottom, #1e293b, #0f172a);
                color: #f1f5f9;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              h1 { 
                color: #f43f5e; 
                font-size: 28px;
                margin-bottom: 20px;
              }
              .error-container {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                padding: 24px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .missing-fields {
                margin-top: 20px;
                padding-left: 20px;
              }
              a {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin-top: 20px;
              }
              a:hover {
                background: #2563eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error: Missing Required Fields</h1>
              <div class="error-container">
                <p>Please fill in all required fields:</p>
                <ul class="missing-fields">
                  ${!name ? '<li>Full Name</li>' : ''}
                  ${!id ? '<li>ID Number</li>' : ''}
                  ${!dob ? '<li>Date of Birth</li>' : ''}
                </ul>
              </div>
              <a href="/scan">Back to Scan Page</a>
            </div>
          </body>
        </html>
      `, {
        status: 400,
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
    
    // I check if a user with this ID number already exists in the database
    // This prevents duplicate entries and provides appropriate feedback
    const existingUser = await prisma.user.findFirst({
      where: { idNumber: id }
    });
    
    // If a duplicate ID is found, I return an error page with details about the existing record
    if (existingUser) {
      console.log('MINIMAL-SAVE-FORM: Duplicate ID found:', existingUser.idNumber);
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Duplicate ID Number</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                min-height: 100vh;
                background: linear-gradient(to bottom, #1e293b, #0f172a);
                color: #f1f5f9;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              h1 { 
                color: #f43f5e; 
                font-size: 28px;
                margin-bottom: 20px;
              }
              .duplicate-container {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                padding: 24px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .data-item {
                display: flex;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 12px 0;
              }
              .data-label {
                font-weight: bold;
                width: 140px;
                color: #94a3b8;
              }
              a {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin-top: 20px;
              }
              a:hover {
                background: #2563eb;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Duplicate ID Number Detected</h1>
              <div class="duplicate-container">
                <p>A record with this ID number already exists in the database:</p>
                
                <div class="data-item">
                  <div class="data-label">Full Name:</div>
                  <div>${existingUser.fullName}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">ID Number:</div>
                  <div>${existingUser.idNumber}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Date of Birth:</div>
                  <div>${existingUser.dateOfBirth}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">Record ID:</div>
                  <div>${existingUser.id}</div>
                </div>
                
                <a href="/scan">Back to Scan Page</a>
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 409,
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
    
    // I prepare the user data object for database insertion
    const userData = {
      fullName: name,
      idNumber: id,
      dateOfBirth: dob,
      expiryDate: expiry || null,
      address: address || null,
      photoUrl: null
    };
    
    console.log('MINIMAL-SAVE-FORM: Data to save:', userData);
    
    // I save the new user record to the database using Prisma
    const result = await prisma.user.create({
      data: userData
    });
    
    console.log('MINIMAL-SAVE-FORM: Save successful, ID:', result.id);
    
    // I fetch the 5 most recent records to display on the success page
    const records = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // I return a styled HTML success page with the saved information
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Information Saved</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              min-height: 100vh;
              background: linear-gradient(to bottom, #1e293b, #0f172a);
              color: #f1f5f9;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 { 
              color: #38bdf8; 
              font-size: 28px;
              margin-bottom: 20px;
            }
            h2 {
              color: #e2e8f0;
              font-size: 22px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .card {
              background: rgba(30, 41, 59, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 24px;
              backdrop-filter: blur(10px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-bottom: 24px;
            }
            .success-banner {
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid rgba(16, 185, 129, 0.3);
              color: #d1fae5;
              padding: 16px;
              border-radius: 6px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .success-icon {
              width: 32px;
              height: 32px;
              background: rgba(16, 185, 129, 0.3);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
            }
            .data-item {
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              padding: 12px 0;
              display: flex;
            }
            .data-label {
              font-weight: bold;
              width: 140px;
              color: #94a3b8;
            }
            .recent-records {
              margin-top: 30px;
              background: rgba(15, 23, 42, 0.7);
              border-radius: 6px;
              padding: 16px;
            }
            .record {
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              padding: 10px 0;
            }
            .record:last-child {
              border-bottom: none;
            }
            .record-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
            }
            .record-name {
              font-weight: bold;
              color: #e2e8f0;
            }
            .record-date {
              color: #94a3b8;
              font-size: 0.9em;
            }
            .record-id {
              color: #94a3b8;
              font-size: 0.9em;
            }
            .buttons {
              display: flex;
              gap: 12px;
              margin-top: 24px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              text-align: center;
            }
            .button-primary {
              background: #3b82f6;
              color: white;
            }
            .button-primary:hover {
              background: #2563eb;
            }
            .button-secondary {
              background: rgba(255, 255, 255, 0.1);
              color: #e2e8f0;
            }
            .button-secondary:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>ID Information Saved</h1>
            
            <div class="card">
              <div class="success-banner">
                <div class="success-icon">✓</div>
                <div>
                  <strong>Success!</strong> The ID information has been saved to the database.
                </div>
              </div>
              
              <h2>Saved Information</h2>
              
              <div class="data-item">
                <div class="data-label">Full Name:</div>
                <div>${result.fullName}</div>
              </div>
              
              <div class="data-item">
                <div class="data-label">ID Number:</div>
                <div>${result.idNumber}</div>
              </div>
              
              <div class="data-item">
                <div class="data-label">Date of Birth:</div>
                <div>${result.dateOfBirth}</div>
              </div>
              
              ${result.expiryDate ? `
              <div class="data-item">
                <div class="data-label">Expiry Date:</div>
                <div>${result.expiryDate}</div>
              </div>
              ` : ''}
              
              ${result.address ? `
              <div class="data-item">
                <div class="data-label">Address:</div>
                <div>${result.address}</div>
              </div>
              ` : ''}
              
              <div class="data-item">
                <div class="data-label">Record ID:</div>
                <div>${result.id}</div>
              </div>
              
              <div class="buttons">
                <a href="/scan" class="button button-primary">Scan Another ID</a>
                <a href="/dashboard" class="button button-secondary">View All Records</a>
              </div>
            </div>
            
            <h2>Recent Records</h2>
            <div class="recent-records">
              ${records.map(record => `
                <div class="record">
                  <div class="record-header">
                    <div class="record-name">${record.fullName}</div>
                    <div class="record-date">${new Date(record.createdAt).toLocaleString()}</div>
                  </div>
                  <div class="record-id">ID: ${record.idNumber}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
  } catch (error: any) {
    console.error('MINIMAL-SAVE-FORM ERROR:', error);
    
    // I return an error page if something goes wrong
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Saving ID Information</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              min-height: 100vh;
              background: linear-gradient(to bottom, #1e293b, #0f172a);
              color: #f1f5f9;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 { 
              color: #f43f5e; 
              font-size: 28px;
              margin-bottom: 20px;
            }
            .error-container {
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              padding: 24px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .error-message {
              margin-top: 16px;
              padding: 12px;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              font-family: monospace;
              white-space: pre-wrap;
              word-break: break-all;
            }
            a {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              margin-top: 20px;
            }
            a:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error Saving ID Information</h1>
            <div class="error-container">
              <p>There was an error saving the ID information to the database.</p>
              <div class="error-message">${error.message || 'Unknown error'}</div>
            </div>
            <a href="/scan">Back to Scan Page</a>
          </div>
        </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html'
      }
    });
  } finally {
    // I make sure to disconnect from the database to prevent connection leaks
    await prisma.$disconnect();
  }
} 