import { NextRequest, NextResponse } from 'next/server';
import { validateCustomText } from '@/lib/profanityFilter';
import { incrementWallpaperDownload } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { wallpaperId, customText, lineUserId } = await req.json();

    console.log('🎨 Generating wallpaper:', { wallpaperId, customText, lineUserId });

    // Validate input
    if (!wallpaperId || !customText || !lineUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate custom text
    const validation = validateCustomText(customText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Dynamic import to ensure it only runs on server
    const { generateWallpaper, WALLPAPER_CONFIGS } = await import('@/lib/wallpaperGenerator');

    // Check if wallpaper config exists
    const wallpaperConfig = WALLPAPER_CONFIGS[wallpaperId as keyof typeof WALLPAPER_CONFIGS];
    if (!wallpaperConfig) {
      return NextResponse.json(
        { error: 'Invalid wallpaper ID' },
        { status: 400 }
      );
    }

    // Generate wallpaper
    const imageBuffer = await generateWallpaper({
      wallpaperId,
      customText,
      ...wallpaperConfig
    });

    console.log('✅ Wallpaper generated, size:', imageBuffer.length, 'bytes');

    // Increment download counter
    await incrementWallpaperDownload(wallpaperId);

    // Convert buffer to base64 for response
    const base64Image = imageBuffer.toString('base64');

    // Return the image data
    // The frontend will handle sending to LINE
    return NextResponse.json({
      success: true,
      message: 'Wallpaper generated successfully',
      image: `data:image/jpeg;base64,${base64Image}`,
      imageBuffer: base64Image // Send as base64 for LINE API
    });
  } catch (error: any) {
    console.error('Error in generate-wallpaper:', error);
    return NextResponse.json(
      { error: 'Failed to generate wallpaper', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST method' }, { status: 405 });
}