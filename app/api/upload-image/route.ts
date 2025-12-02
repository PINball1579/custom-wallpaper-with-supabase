import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

/**
 * Upload generated wallpaper using Vercel Blob Storage
 * This works with Vercel serverless functions (no filesystem access needed)
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { imageBuffer, lineUserId } = await req.json();

    if (!imageBuffer || !lineUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `wallpaper_${lineUserId}_${timestamp}.jpg`;

    // Convert base64 to buffer
    const buffer = Buffer.from(imageBuffer, 'base64');

    // Upload to Vercel Blob Storage
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log('✅ Image uploaded to Vercel Blob:', blob.url);

    return NextResponse.json({
      success: true,
      imageUrl: blob.url
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}