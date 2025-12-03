import { NextRequest, NextResponse } from 'next/server';
import { getUserByUUID } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { lineUUID } = await req.json();

    console.log('🔍 Checking user registration:', lineUUID);

    if (!lineUUID) {
      return NextResponse.json(
        { error: 'LINE UUID is required' },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const user = await getUserByUUID(lineUUID);

    if (user) {
      console.log('✅ User found:', user.email);
      return NextResponse.json({
        registered: true,
        user: {
          lineUUID: user.line_uuid,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        }
      });
    }

    console.log('ℹ️ User not found - new registration needed');
    return NextResponse.json({
      registered: false
    });
  } catch (error) {
    console.error('❌ Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}