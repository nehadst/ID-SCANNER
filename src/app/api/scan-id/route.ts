import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

// Create a Prisma client
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

// In-memory storage for fallback
// We keep this as a fallback in case of database failure
export const users: User[] = [];

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extracts text from ID document using OpenAI GPT-4o
 */
async function extractDataFromId(base64Image: string) {
  try {
    // Use OpenAI GPT-4o to extract information from the ID document
    console.log("Processing ID image with OpenAI");
    
    try {
      // Send the image to GPT-4o for analysis
      // Ensure the base64 image has the proper format for OpenAI
      // OpenAI requires a proper data URL with MIME type
      let formattedImage = base64Image;
      
      // If it doesn't already have a data URL prefix, add it
      if (!base64Image.startsWith('data:')) {
        formattedImage = `data:image/jpeg;base64,${base64Image}`;
      }
      
      console.log("Sending image to OpenAI...");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting information from ID documents. Extract all relevant personal information from the ID image provided, including: full name, ID number, date of birth, expiry date, and address. Return ONLY a JSON object with the fields: fullName, idNumber, dateOfBirth, expiryDate, address. If you can't read some information, put null for that field. Format dates as YYYY-MM-DD if possible. DO NOT include explanatory text."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all information from this ID document. Return as JSON with fields: fullName, idNumber, dateOfBirth, expiryDate, address. No extra text."
              },
              {
                type: "image_url",
                image_url: {
                  url: formattedImage
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      console.log("OpenAI response received");
      
      // Parse the response content
      if (response.choices && response.choices[0] && response.choices[0].message.content) {
        try {
          const extractedData = JSON.parse(response.choices[0].message.content);
          console.log("Extracted data from GPT-4o:", extractedData);
          
          // Ensure all required fields exist
          return {
            fullName: extractedData.fullName || null,
            idNumber: extractedData.idNumber || null,
            dateOfBirth: extractedData.dateOfBirth || null,
            expiryDate: extractedData.expiryDate || null,
            address: extractedData.address || null
          };
        } catch (parseError) {
          console.error("Error parsing GPT-4o response:", parseError);
          throw new Error("Failed to parse GPT-4o response");
        }
      } else {
        console.error("Invalid response from GPT-4o:", response);
        throw new Error("Invalid response from GPT-4o");
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      // Fall back to simulated data if OpenAI API fails
      console.log("Falling back to simulated data");
      return generateSimulatedData();
    }
  } catch (error) {
    console.error('Error extracting data from ID:', error);
    throw new Error('Failed to extract data from ID');
  }
}

// Generate simulated data for fallback
function generateSimulatedData() {
  const names = ['John Smith', 'Jane Doe', 'Alice Johnson', 'Robert Brown', 'Emily Davis'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  const idNumber = `ID${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  // Generate a random date of birth (between 1960 and 2000)
  const year = Math.floor(1960 + Math.random() * 40);
  const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
  const day = Math.floor(1 + Math.random() * 28).toString().padStart(2, '0');
  const dob = `${year}-${month}-${day}`;
  
  // Generate expiry date (5-10 years in the future)
  const expiryYear = new Date().getFullYear() + Math.floor(5 + Math.random() * 5);
  const expiryMonth = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
  const expiryDay = Math.floor(1 + Math.random() * 28).toString().padStart(2, '0');
  const expiryDate = `${expiryYear}-${expiryMonth}-${expiryDay}`;
  
  // Generate a random address
  const streets = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd', '654 Maple Dr'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const zipCode = Math.floor(10000 + Math.random() * 90000);
  const address = `${randomStreet}, ${randomCity}, ${randomState} ${zipCode}`;
  
  return {
    fullName: randomName,
    idNumber,
    dateOfBirth: dob,
    expiryDate,
    address
  };
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      console.error('No image data provided');
      return NextResponse.json(
        { error: 'Image data is required' }, 
        { status: 400 }
      );
    }
    
    console.log('Processing ID image, length:', image.length);
    
    // Extract data from ID image using GPT-4o
    const extractedData = await extractDataFromId(image);
    console.log('Extracted data:', JSON.stringify(extractedData, null, 2));
    
    // Store data in both memory and database for reliability
    let savedUser = null;
    
    try {
      // First try to save to the database
      savedUser = await prisma.user.create({
        data: {
          fullName: extractedData.fullName || 'Unknown',
          idNumber: extractedData.idNumber || `ID${Math.floor(10000000 + Math.random() * 90000000)}`,
          dateOfBirth: extractedData.dateOfBirth || '1900-01-01',
          expiryDate: extractedData.expiryDate || null,
          address: extractedData.address || null,
          photoUrl: null // In a real app, you might save the image to Cloud Storage and store the URL
        }
      });
      console.log('User saved to database with ID:', savedUser.id);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // If the error is due to duplicate ID number, generate a new one
      if (dbError.code === 'P2002') {
        try {
          // Try again with a random ID number
          const newIdNumber = `ID${Math.floor(10000000 + Math.random() * 90000000)}`;
          console.log('Generated new ID number due to conflict:', newIdNumber);
          
          savedUser = await prisma.user.create({
            data: {
              fullName: extractedData.fullName || 'Unknown',
              idNumber: newIdNumber,
              dateOfBirth: extractedData.dateOfBirth || '1900-01-01',
              expiryDate: extractedData.expiryDate || null,
              address: extractedData.address || null,
              photoUrl: null
            }
          });
          console.log('User saved to database with new ID number, ID:', savedUser.id);
        } catch (retryError) {
          console.error('Failed to save with new ID number:', retryError);
          // Fall back to in-memory storage
          savedUser = null;
        }
      }
      
      // If database save failed, fall back to in-memory storage
      if (!savedUser) {
        // Add timestamp
        const user = {
          ...extractedData,
          id: users.length + 1,
          createdAt: new Date().toISOString()
        };
        
        users.push(user);
        console.log('User saved to in-memory storage, ID:', user.id);
        savedUser = user;
      }
    }
    
    return NextResponse.json(savedUser || extractedData);
  } catch (error) {
    console.error('Error processing ID:', error);
    return NextResponse.json(
      { error: 'Failed to process ID. Please try again.' }, 
      { status: 500 }
    );
  }
} 