import { createCanvas, loadImage } from 'canvas';
import path from 'path';

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
    console.log('🎨 Generating wallpaper with text:', config.customText);

    // Load base wallpaper image
    const wallpaperPath = path.join(process.cwd(), 'public', 'wallpapers', `${config.wallpaperId}.jpg`);
    const image = await loadImage(wallpaperPath);

    console.log('📐 Canvas size:', image.width, 'x', image.height);

    // Create canvas with same dimensions as wallpaper
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw base wallpaper
    ctx.drawImage(image, 0, 0);

    // Configure text style - use bold font for better visibility
    ctx.font = `bold ${config.fontSize}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = config.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add stronger text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Draw text outline for even better visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(config.customText, config.textX, config.textY);

    // Draw filled text
    ctx.fillText(config.customText, config.textX, config.textY);

    console.log('✅ Text drawn:', config.customText, 'at', config.textX, config.textY);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    console.log('✅ Buffer created, size:', buffer.length, 'bytes');

    return buffer;
  } catch (error) {
    console.error('❌ Error generating wallpaper:', error);
    throw new Error('Failed to generate wallpaper');
  }
}

// Predefined wallpaper configurations
export const WALLPAPER_CONFIGS = {
  wallpaper_1: {
    fontSize: 80,
    fontColor: '#FFFFFF',
    textX: 540, // Center of 1080px width
    textY: 1920, // Bottom third of 2400px height
  },
  wallpaper_2: {
    fontSize: 70,
    fontColor: '#000000',
    textX: 540,
    textY: 800,
  },
  wallpaper_3: {
    fontSize: 90,
    fontColor: '#FFD700',
    textX: 540,
    textY: 1200,
  },
  wallpaper_4: {
    fontSize: 75,
    fontColor: '#FFFFFF',
    textX: 540,
    textY: 1500,
  },
  wallpaper_5: {
    fontSize: 85,
    fontColor: '#FF69B4',
    textX: 540,
    textY: 1000,
  },
};