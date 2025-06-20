import { NextRequest, NextResponse } from 'next/server';
import { numberToHex } from 'viem';

// In-memory storage for demo purposes - use a real database in production
const registrations = new Map<string, any>();

export async function POST(request: NextRequest) {
  console.log('🚨 PROFILE VERIFICATION API CALLED - POST request received!');
  console.log('Time:', new Date().toISOString());
  console.log('New ngrok URL: https://877b-178-235-179-3.ngrok-free.app');

  try {
    console.log('📥 Parsing request body...');
    const requestData = await request.json();
    
    console.log('=== 🔍 PROFILE VERIFICATION REQUEST ===');
    console.log('Full request body:', JSON.stringify(requestData, null, 2));
    
    // Extract data from request - EXACTLY as shown in documentation
    const email = requestData.requestedInfo?.email;
    const physicalAddress = requestData.requestedInfo?.physicalAddress;
    const name = requestData.requestedInfo?.name;
    const phoneNumber = requestData.requestedInfo?.phoneNumber;
    
    console.log('Extracted data:');
    console.log('- Email:', email);
    console.log('- Name:', name);
    console.log('- Physical Address:', physicalAddress);
    console.log('- Phone:', phoneNumber);

    const errors: Record<string, any> = {};

    // Example: Reject example.com emails
    if (email && email.endsWith("@example.com")) {
      errors.email = "Example.com emails are not allowed";
    }

    // Example: Validate physical address
    if (physicalAddress) {
      if (physicalAddress.postalCode && physicalAddress.postalCode.length < 5) {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.postalCode = "Invalid postal code";
      }

      if (physicalAddress.countryCode === "XY") {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.countryCode = "We don't ship to this country";
      }
    }

    // Validate name if present
    if (name) {
      if (!name.firstName || name.firstName.length < 1) {
        if (!errors.name) errors.name = {};
        errors.name.firstName = "First name is required";
      }
    }

    // Return errors if any found
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation errors found:', errors);
      return Response.json({ errors });
    }

    // Success - store the registration data
    const userAddress = requestData.from || 'unknown';
    const registrationData = {
      userAddress,
      timestamp: new Date().toISOString(),
      email,
      name,
      physicalAddress,
      phoneNumber,
    };

    registrations.set(userAddress, registrationData);
    console.log(`✅ Registration stored for address: ${userAddress}`);
    console.log(`Total registrations: ${registrations.size}`);

    // Success - EXACT format from documentation
    const response = {
      request: {
        calls: requestData.calls,
        chainId: requestData.chainId,
        version: requestData.version,
      },
    };
    
    console.log('=== ✅ SUCCESS RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
    
    return Response.json(response);

  } catch (error) {
    console.error('❌ ERROR in API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return Response.json({
      errors: { 
        server: "Server error validating data",
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// Handle OPTIONS request for CORS
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

// Optional: GET endpoint to check registrations
export async function GET() {
  return Response.json({
    status: "OK",
    message: "Profile verification API is running",
    totalRegistrations: registrations.size,
    endpoint: "/api/profile-verification",
    timestamp: new Date().toISOString()
  });
} 