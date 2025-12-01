import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Upload generated wallpaper to public directory
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

    // Create generated directory if it doesn't exist
    const generatedDir = path.join(process.cwd(), 'public', 'generated');
    if (!existsSync(generatedDir)) {
      await mkdir(generatedDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `wallpaper_${lineUserId}_${timestamp}.jpg`;
    const filepath = path.join(generatedDir, filename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(imageBuffer, 'base64');
    await writeFile(filepath, buffer);

    // Generate public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
    const publicUrl = `${baseUrl}/generated/${filename}`;

    console.log('✅ Image saved to:', filepath);
    console.log('🔗 Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl
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