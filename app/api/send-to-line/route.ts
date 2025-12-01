import { NextRequest, NextResponse } from 'next/server';
import { sendImageUrlToLine } from '@/lib/lineService';

export async function POST(req: NextRequest) {
  try {
    const { lineUserId, imageUrl } = await req.json();

    if (!lineUserId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send image to LINE chat
    const sent = await sendImageUrlToLine(lineUserId, imageUrl, imageUrl);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send image to LINE' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image sent to LINE successfully'
    });
  } catch (error) {
    console.error('Error in send-to-line:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}