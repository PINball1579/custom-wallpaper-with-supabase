import { createCanvas, loadImage, registerFont } from 'canvas';

export interface WallpaperConfig {
  wallpaperId: string;
  customText: string;
  fontSize: number;
  fontColor: string;
  textX: number;
  textY: number;
}

export async function generateWallpaper(config: WallpaperConfig): Promise<Buffer> {
  try {
    // Dynamic import of Node.js modules (only available at runtime)
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    
    // Register a font that supports Thai and English
    // Try to register custom font, but don't fail if not available
    let hasCustomFont = false;
    try {
      const fontPath = join(process.cwd(), 'public', 'fonts', 'NotoSansThai-Bold.ttf');
      const fontBuffer = await readFile(fontPath);
      registerFont(fontPath, { family: 'NotoSansThai' });
      hasCustomFont = true;
      console.log('✅ Custom font registered successfully');
    } catch (fontError) {
      console.warn('⚠️ Custom font not found, will use system fonts with Thai support');
    }
    
    // Load base wallpaper image from filesystem
    const wallpaperPath = join(process.cwd(), 'public', 'wallpapers', `${config.wallpaperId}.jpg`);
    
    console.log('📸 Loading wallpaper from:', wallpaperPath);
    
    // Check if file exists first
    try {
      const imageBuffer = await readFile(wallpaperPath);
      const image = await loadImage(imageBuffer);
      
      // Create canvas with same dimensions as wallpaper
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      // Draw base wallpaper
      ctx.drawImage(image, 0, 0);

      // Configure text style with font that supports Thai
      // Try custom font first, fall back to system fonts with Thai support
      ctx.font = `bold ${config.fontSize}px "NotoSansThai", "Sarabun", "Kanit", "Prompt", "Noto Sans", "DejaVu Sans", Arial, sans-serif`;
      ctx.fillStyle = config.fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw custom text
      ctx.fillText(config.customText, config.textX, config.textY);

      // Convert to buffer
      return canvas.toBuffer('image/jpeg', { quality: 0.95 });
    } catch (fileError: any) {
      console.error('❌ File not found:', wallpaperPath);
      throw new Error(`Wallpaper image not found: ${config.wallpaperId}.jpg. Please ensure the file exists in public/wallpapers/`);
    }
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    throw new Error('Failed to generate wallpaper');
  }
}

// Predefined wallpaper configurations
export const WALLPAPER_CONFIGS = {
  wallpaper_1: {
    fontSize: 100,
    fontColor: '#586971',
    textX: 560, // Center of 1080px width
    textY: 1270, // Bottom third of 2400px height
  },
  wallpaper_2: {
    fontSize: 100,
    fontColor: '#07203e',
    textX: 560,
    textY: 1270,
  },
  wallpaper_3: {
    fontSize: 100,
    fontColor: '#85898a',
    textX: 560,
    textY: 1270,
  },
  wallpaper_4: {
    fontSize: 100,
    fontColor: '#60625f',
    textX: 560,
    textY: 1270,
  },
  wallpaper_5: {
    fontSize: 100,
    fontColor: '#000000',
    textX: 560,
    textY: 1270,
  },
};