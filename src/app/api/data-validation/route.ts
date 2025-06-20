export async function POST(request: Request) {
  console.log('🚨 DATA VALIDATION API CALLED - POST request received!');
  console.log('Time:', new Date().toISOString());
  console.log('Ngrok URL: https://877b-178-235-179-3.ngrok-free.app');
  
  const requestData = await request.json();
  console.log('Request data:', JSON.stringify(requestData, null, 2));

  try {
    // Extract data from request - EXACTLY as shown in documentation
    const email = requestData.requestedInfo?.email;
    const physicalAddress = requestData.requestedInfo?.physicalAddress;
    const name = requestData.requestedInfo?.name;
    const phoneNumber = requestData.requestedInfo?.phoneNumber;
    
    console.log('Extracted profile data:');
    console.log('- Email:', email);
    console.log('- Name:', name);
    console.log('- Physical Address:', physicalAddress);
    console.log('- Phone:', phoneNumber);

    // Determine transaction type based on amount
    const calls = requestData.calls || [];
    let transactionType = 'unknown';
    let amount = '0';
    
    if (calls.length > 0 && calls[0].data) {
      // Simple heuristic: check if it's 0.01 USDC (giveaway) or 1 USDC (purchase)
      const callData = calls[0].data;
      if (callData.includes('2710')) { // 0.01 USDC in hex
        transactionType = 'giveaway';
        amount = '0.01 USDC';
      } else if (callData.includes('f4240')) { // 1 USDC in hex
        transactionType = 'purchase';
        amount = '1 USDC';
      }
    }
    
    console.log(`Transaction type: ${transactionType} (${amount})`);

    const errors: Record<string, any> = {};

    // Enhanced validation for both giveaway and purchase
    if (email) {
      // Reject obviously fake emails
      if (email.endsWith("@example.com") || email.endsWith("@test.com")) {
        errors.email = "Please provide a valid email address";
      }
      
      // Basic email format validation
      if (!email.includes("@") || !email.includes(".")) {
        errors.email = "Please provide a valid email format";
      }
    }

    // Validate name if present
    if (name) {
      if (!name.firstName || name.firstName.length < 1) {
        if (!errors.name) errors.name = {};
        errors.name.firstName = "First name is required";
      }
      if (!name.familyName || name.familyName.length < 1) {
        if (!errors.name) errors.name = {};
        errors.name.familyName = "Last name is required";
      }
    }

    // Validate physical address
    if (physicalAddress) {
      if (!physicalAddress.address1 || physicalAddress.address1.length < 5) {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.address1 = "Please provide a valid street address";
      }
      
      if (!physicalAddress.city || physicalAddress.city.length < 2) {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.city = "Please provide a valid city";
      }
      
      if (!physicalAddress.postalCode || physicalAddress.postalCode.length < 3) {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.postalCode = "Please provide a valid postal code";
      }
      
      if (!physicalAddress.countryCode || physicalAddress.countryCode.length !== 2) {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.countryCode = "Please provide a valid country code";
      }

      // Example: Don't allow certain test countries
      if (physicalAddress.countryCode === "XY" || physicalAddress.countryCode === "ZZ") {
        if (!errors.physicalAddress) errors.physicalAddress = {};
        errors.physicalAddress.countryCode = "We don't ship to this location";
      }
    }

    // Validate phone number if present
    if (phoneNumber) {
      if (!phoneNumber.number || phoneNumber.number.length < 7) {
        if (!errors.phoneNumber) errors.phoneNumber = {};
        errors.phoneNumber.number = "Please provide a valid phone number";
      }
    }

    // Return errors if any found
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation errors found:', errors);
      return Response.json({ errors });
    }

    // Success - store the data (in production, use a real database)
    const registrationData = {
      timestamp: new Date().toISOString(),
      transactionType,
      amount,
      userAddress: requestData.from || 'unknown',
      email,
      name: name ? `${name.firstName} ${name.familyName}` : undefined,
      physicalAddress,
      phoneNumber,
    };
    
    console.log('✅ Registration successful:', registrationData);

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

// Optional: GET endpoint to check API status
export async function GET() {
  return Response.json({
    status: "OK",
    message: "Data validation API is running",
    ngrokUrl: "https://877b-178-235-179-3.ngrok-free.app",
    endpoint: "/api/data-validation",
    timestamp: new Date().toISOString(),
    supportedMethods: ["GET", "POST", "OPTIONS"]
  });
} 