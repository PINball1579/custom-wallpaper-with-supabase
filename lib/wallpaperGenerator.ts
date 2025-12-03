import { createCanvas, loadImage, registerFont } from 'canvas';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface WallpaperConfig {
  wallpaperId: string;
  customText: string;
  fontSize: number;
  fontColor: string;
  textX: number;
  textY: number;
}

// Register font at module load time (not inside the function)
let fontRegistered = false;

async function ensureFontRegistered() {
  if (fontRegistered) return;
  
  try {
    const fontPath = join(process.cwd(), 'public', 'fonts', 'NotoSansThai-Bold.ttf');
    registerFont(fontPath, { family: 'NotoSansThai' });
    fontRegistered = true;
    console.log('✅ Custom font registered successfully');
  } catch (fontError) {
    console.warn('⚠️ Custom font not found, will use system fonts');
  }
}

export async function generateWallpaper(config: WallpaperConfig): Promise<Buffer> {
  try {
    // Ensure font is registered
    await ensureFontRegistered();
    
    // Load base wallpaper image from filesystem
    const wallpaperPath = join(process.cwd(), 'public', 'wallpapers', `${config.wallpaperId}.jpg`);
    
    console.log('📸 Loading wallpaper from:', wallpaperPath);
    
    // Read and load the image
    const imageBuffer = await readFile(wallpaperPath);
    const image = await loadImage(imageBuffer);
    
    // Create canvas with same dimensions as wallpaper
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw base wallpaper
    ctx.drawImage(image, 0, 0);

    // Configure text style with font that supports Thai
    ctx.font = `bold ${config.fontSize}px "NotoSansThai", "Sarabun", "Kanit", "Prompt", "Noto Sans", "DejaVu Sans", Arial, sans-serif`;
    ctx.fillStyle = config.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add text shadow for better visibility (optional)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw custom text
    ctx.fillText(config.customText, config.textX, config.textY);

    // Convert to buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  } catch (error: any) {
    console.error('Error generating wallpaper:', error);
    throw new Error(`Failed to generate wallpaper: ${error.message}`);
  }
}

// Predefined wallpaper configurations
export const WALLPAPER_CONFIGS = {
  wallpaper_1: {
    fontSize: 100,
    fontColor: '#586971',
    textX: 540, // Center of 1080px width (1080/2)
    textY: 1270, // Bottom third of 2400px height
  },
  wallpaper_2: {
    fontSize: 100,
    fontColor: '#07203e',
    textX: 540,
    textY: 1270,
  },
  wallpaper_3: {
    fontSize: 100,
    fontColor: '#85898a',
    textX: 540,
    textY: 1270,
  },
  wallpaper_4: {
    fontSize: 100,
    fontColor: '#60625f',
    textX: 540,
    textY: 1270,
  },
  wallpaper_5: {
    fontSize: 100,
    fontColor: '#000000',
    textX: 540,
    textY: 1270,
  },
};