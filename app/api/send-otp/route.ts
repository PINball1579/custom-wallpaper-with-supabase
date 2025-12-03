import { NextRequest, NextResponse } from 'next/server';
import { createOTP } from '@/lib/db';
import { requestOTP } from '@/lib/smsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    console.log('📞 Received OTP request for:', phoneNumber);

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^0\d{9}$/; // Thai phone: 0XXXXXXXXX
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Should be 10 digits starting with 0' },
        { status: 400 }
      );
    }

    console.log('🔐 API Key:', process.env.THAIBULKSMS_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 Secret:', process.env.THAIBULKSMS_SECRET ? 'Present' : 'Missing');

    // Request OTP from ThaiBulkSMS
    const result = await requestOTP(phoneNumber);

    console.log('📨 OTP Result:', result);

    if (!result.success || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Failed to send OTP' },
        { status: 500 }
      );
    }

    // Save OTP token to database
    await createOTP(phoneNumber, result.token);

    console.log('✅ OTP sent successfully');

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      referenceCode: result.referenceCode || result.token.substring(0, 6).toUpperCase()
    });
  } catch (error) {
    console.error('❌ Error in send-otp:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}