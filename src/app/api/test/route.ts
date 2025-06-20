import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Test endpoint is working!",
    ngrokUrl: "https://877b-178-235-179-3.ngrok-free.app",
    endpoints: {
      test: "/api/test",
      dataValidation: "/api/data-validation",
      profileVerification: "/api/profile-verification"
    },
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    status: "OK",
    message: "POST request received successfully!",
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 