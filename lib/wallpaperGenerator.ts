import { createCanvas, loadImage } from 'canvas';

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

      // Configure text style (using system fonts, no registerFont needed)
      ctx.font = `bold ${config.fontSize}px Arial, sans-serif`;
      ctx.fillStyle = config.fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

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