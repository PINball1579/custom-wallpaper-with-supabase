import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

/**
 * Upload generated wallpaper to Vercel Blob Storage
 * This makes it accessible via HTTPS URL for LINE
 */
export async function POST(req: NextRequest) {
  try {
    const { imageBuffer, lineUserId } = await req.json();

    if (!imageBuffer || !lineUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading image for user:', lineUserId);

    // Convert base64 to buffer
    const buffer = Buffer.from(imageBuffer, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `wallpaper_${lineUserId}_${timestamp}.jpg`;

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log('✅ Image uploaded to:', blob.url);

    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}