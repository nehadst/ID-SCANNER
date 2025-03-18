import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create a fresh connection
const prisma = new PrismaClient();

// Simple GET endpoint that creates a user from query parameters
export async function GET(request: NextRequest) {
  try {
    console.log('MINIMAL-SAVE-FORM: Starting');
    
    // Get query parameters
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
    
    // Validate required fields
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
              .card {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 24px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 24px;
              }
              .error {
                background: rgba(220, 38, 38, 0.2);
                border: 1px solid rgba(220, 38, 38, 0.3);
                padding: 16px;
                border-radius: 6px;
                margin-bottom: 20px;
              }
              a {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
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
              <div class="card">
                <div class="error">
                  <p>Please fill in all required fields:</p>
                  <ul>
                    ${!name ? '<li>Full Name is required</li>' : ''}
                    ${!id ? '<li>ID Number is required</li>' : ''}
                    ${!dob ? '<li>Date of Birth is required</li>' : ''}
                  </ul>
                </div>
                <p>Please go back and complete all required fields before submitting.</p>
                <a href="/scan">Back to Scan Page</a>
              </div>
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
    
    // Check if ID already exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        idNumber: id
      }
    });
    
    if (existingUser) {
      console.log('MINIMAL-SAVE-FORM: Duplicate ID found:', id);
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Duplicate ID Error</title>
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
              .card {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 24px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin-bottom: 24px;
              }
              .error {
                background: rgba(220, 38, 38, 0.2);
                border: 1px solid rgba(220, 38, 38, 0.3);
                padding: 16px;
                border-radius: 6px;
                margin-bottom: 20px;
              }
              .data-item {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding: 8px 0;
                display: flex;
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
                border-radius: 4px;
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
              <h1>Duplicate ID Error</h1>
              <div class="card">
                <div class="error">
                  <p>The ID number <strong>${id}</strong> already exists in the database.</p>
                  <p>Please go back and use a different ID number.</p>
                </div>
                
                <h3>Existing Record Details:</h3>
                <div class="data-item">
                  <div class="data-label">Name:</div>
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
    
    // Prepare data for database
    const userData = {
      fullName: name,
      idNumber: id,
      dateOfBirth: dob,
      expiryDate: expiry || null,
      address: address || null,
      photoUrl: null
    };
    
    console.log('MINIMAL-SAVE-FORM: Data to save:', userData);
    
    // Direct save to database
    const result = await prisma.user.create({
      data: userData
    });
    
    console.log('MINIMAL-SAVE-FORM: Save successful, ID:', result.id);
    
    // Get latest records
    const records = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // Return HTML with styling matching the main application
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
            .btn-primary {
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;
              flex: 1;
              text-align: center;
            }
            .btn-primary:hover {
              background: #2563eb;
            }
            .btn-outline {
              background: transparent;
              color: #e2e8f0;
              border: 1px solid rgba(255, 255, 255, 0.3);
              padding: 12px 24px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;
              flex: 1;
              text-align: center;
            }
            .btn-outline:hover {
              background: rgba(255, 255, 255, 0.1);
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
                  <h3 style="margin:0 0 4px 0;">Success!</h3>
                  <p style="margin:0;">Your ID information has been saved to the database.</p>
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
              <div class="data-item">
                <div class="data-label">Expiry Date:</div>
                <div>${result.expiryDate || 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Address:</div>
                <div>${result.address || 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Database ID:</div>
                <div>${result.id}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Date Created:</div>
                <div>${new Date(result.createdAt).toLocaleString()}</div>
              </div>
              
              <div class="buttons">
                <a href="/scan" class="btn-primary">Scan Another ID</a>
                <a href="/dashboard" class="btn-outline">View All Records</a>
              </div>
            </div>
            
            <h2>Recent Records</h2>
            <div class="card">
              <div class="recent-records">
                ${records.map(record => `
                  <div class="record">
                    <div class="record-header">
                      <div class="record-name">${record.fullName}</div>
                      <div class="record-date">${new Date(record.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="record-id">ID Number: ${record.idNumber}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
  } catch (error: any) {
    console.error('MINIMAL-SAVE-FORM ERROR:', error);
    
    // Return HTML error page
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
            .card {
              background: rgba(30, 41, 59, 0.7);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 8px;
              padding: 24px;
              backdrop-filter: blur(10px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              margin-bottom: 24px;
            }
            .error {
              background: rgba(220, 38, 38, 0.2);
              border: 1px solid rgba(220, 38, 38, 0.3);
              padding: 16px;
              border-radius: 6px;
              margin-bottom: 20px;
            }
            .error-details {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              padding: 12px;
              font-family: monospace;
              white-space: pre-wrap;
              margin-top: 16px;
              font-size: 14px;
              max-height: 200px;
              overflow-y: auto;
            }
            a {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
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
            <div class="card">
              <div class="error">
                <p>An error occurred while saving the ID information:</p>
                <p><strong>${error.message || 'Unknown error'}</strong></p>
                <div class="error-details">${JSON.stringify(error, null, 2)}</div>
              </div>
              <p>Please try again or contact support if the issue persists.</p>
              <a href="/scan">Back to Scan Page</a>
            </div>
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
    await prisma.$disconnect();
  }
} 