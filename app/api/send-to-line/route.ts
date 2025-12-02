import { NextRequest, NextResponse } from 'next/server';
import { sendImageUrlToLine } from '@/lib/lineService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { lineUserId, imageUrl } = await req.json();

    console.log('📨 Sending to LINE:', { lineUserId, imageUrl });

    if (!lineUserId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate imageUrl is HTTPS
    if (!imageUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Image URL must be HTTPS for LINE' },
        { status: 400 }
      );
    }

    // Send image to LINE chat
    const sent = await sendImageUrlToLine(lineUserId, imageUrl, imageUrl);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send image to LINE. Please check LINE channel access token.' },
        { status: 500 }
      );
    }

    console.log('✅ Image sent to LINE successfully');

    return NextResponse.json({
      success: true,
      message: 'Image sent to LINE successfully'
    });
  } catch (error: any) {
    console.error('❌ Error in send-to-line:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}