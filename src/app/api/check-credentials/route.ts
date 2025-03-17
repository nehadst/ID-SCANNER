import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Google Vision API is no longer used in this application.',
    status: 'ok'
  });
} 