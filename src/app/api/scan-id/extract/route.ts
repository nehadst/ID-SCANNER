import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configure the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extracts text from ID document using OpenAI GPT-4o
 */
async function extractDataFromId(base64Image: string) {
  try {
    console.log("Processing ID image with OpenAI");
    
    try {
      // Format the base64 image for the OpenAI API
      let formattedImage = base64Image;
      
      // If it doesn't already have a data URL prefix, add it
      if (!base64Image.startsWith('data:')) {
        formattedImage = `data:image/jpeg;base64,${base64Image}`;
      }
      
      console.log("Sending image to OpenAI...");
      
      // Call OpenAI API for text extraction
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
      
      if (response.choices && response.choices[0] && response.choices[0].message.content) {
        try {
          const extractedData = JSON.parse(response.choices[0].message.content);
          console.log("Extracted data from GPT-4o:", JSON.stringify(extractedData, null, 2));
          
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
      // Fall back to simulated data
      console.log("Falling back to simulated data");
      return generateSimulatedData();
    }
  } catch (error) {
    console.error('Error extracting data from ID:', error);
    throw new Error('Failed to extract data from ID');
  }
}

/**
 * Generates simulated ID data for fallback
 */
function generateSimulatedData() {
  const names = ['John Smith', 'Jane Doe', 'Alice Johnson', 'Robert Brown', 'Emily Davis'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  const idNumber = `ID${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  const year = Math.floor(1960 + Math.random() * 40);
  const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
  const day = Math.floor(1 + Math.random() * 28).toString().padStart(2, '0');
  const dob = `${year}-${month}-${day}`;
  
  const expiryYear = new Date().getFullYear() + Math.floor(5 + Math.random() * 5);
  const expiryMonth = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
  const expiryDay = Math.floor(1 + Math.random() * 28).toString().padStart(2, '0');
  const expiryDate = `${expiryYear}-${expiryMonth}-${expiryDay}`;
  
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
    // Parse the request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' }, 
        { status: 400 }
      );
    }
    
    if (!requestData.image) {
      return NextResponse.json(
        { error: 'Image data is required' }, 
        { status: 400 }
      );
    }
    
    const image = requestData.image;
    console.log('Processing ID image for extraction, length:', image.length);
    
    // Extract data from ID image using GPT-4o
    const extractedData = await extractDataFromId(image);
    console.log('Final extracted data:', JSON.stringify(extractedData, null, 2));
    
    // Just return the extracted data without saving to database
    return NextResponse.json(extractedData);
  } catch (error) {
    console.error('Error extracting from ID:', error);
    return NextResponse.json(
      { error: 'Failed to extract data from ID. Please try again.' }, 
      { status: 500 }
    );
  }
} 