import { NextRequest, NextResponse } from 'next/server';
import { getOTPByPhone, markOTPAsVerified } from '@/lib/db';
import { verifyOTP } from '@/lib/smsService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode } = await req.json();

    console.log('🔐 Verifying OTP for:', phoneNumber);

    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: 'Phone number and OTP code are required' },
        { status: 400 }
      );
    }

    // Validate OTP code format (should be 6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Should be 6 digits' },
        { status: 400 }
      );
    }

    // Get the OTP record from database
    let otpRecord;
    try {
      otpRecord = await getOTPByPhone(phoneNumber);
    } catch (dbError) {
      console.error('⚠️ Database error when fetching OTP:', dbError);
      return NextResponse.json(
        { error: 'Database error. Please try again' },
        { status: 500 }
      );
    }

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No OTP found or OTP expired. Please request a new OTP' },
        { status: 400 }
      );
    }

    console.log('📝 Found OTP record for phone:', phoneNumber);

    // Verify OTP with ThaiBulkSMS
    const verifyResult = await verifyOTP(otpRecord.otp_token, otpCode);

    console.log('✅ Verification result:', verifyResult);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.message || 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // Mark OTP as verified in database
    try {
      await markOTPAsVerified(otpRecord.id);
      console.log('✅ OTP marked as verified in database');
    } catch (dbError) {
      console.error('⚠️ Database error when marking OTP as verified:', dbError);
      // Still return success since OTP was verified with ThaiBulkSMS
    }

    console.log('✅ OTP verified successfully');

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('❌ Error in verify-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}