import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    const {
      lineUUID,
      title,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      phoneNumber
    } = userData;

    // Validate required fields
    if (!lineUUID || !firstName || !lastName || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save user to database
    const user = await createUser({
      line_uuid: lineUUID,
      title,
      first_name: firstName,
      last_name: lastName,
      gender,
      date_of_birth: dateOfBirth,
      email,
      phone_number: phoneNumber
    });

    return NextResponse.json({
      success: true,
      message: 'User data saved successfully',
      user
    });
  } catch (error) {
    console.error('Error in save-user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}