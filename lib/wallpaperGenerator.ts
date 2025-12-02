import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import { existsSync } from 'fs';

// Register fonts on module load
try {
  // Try to register system fonts
  const fontsPath = path.join(process.cwd(), 'public', 'fonts');
  
  // Common font paths to try
  const fontPaths = [
    // Try custom fonts first
    { path: path.join(fontsPath, 'Arial.ttf'), family: 'CustomFont' },
    { path: path.join(fontsPath, 'Roboto-Bold.ttf'), family: 'CustomFont' },
    // Try system fonts (Linux/Unix)
    { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', family: 'CustomFont' },
    { path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', family: 'CustomFont' },
    { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', family: 'CustomFont' },
    { path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', family: 'CustomFont' },
  ];

  let fontRegistered = false;
  for (const font of fontPaths) {
    try {
      if (existsSync(font.path)) {
        registerFont(font.path, { family: font.family });
        console.log('✅ Font registered from:', font.path);
        fontRegistered = true;
        break;
      }
    } catch (e) {
      // Continue to next font
    }
  }

  if (!fontRegistered) {
    console.warn('⚠️ No custom font registered, using canvas default');
  }
} catch (error) {
  console.error('❌ Error registering fonts:', error);
}

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
    // Load base wallpaper image
    const wallpaperPath = path.join(process.cwd(), 'public', 'wallpapers', `${config.wallpaperId}.jpg`);
    const image = await loadImage(wallpaperPath);

    // Create canvas with same dimensions as wallpaper
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw base wallpaper
    ctx.drawImage(image, 0, 0);

    // Configure text style with fallback fonts
    // Use CustomFont if registered, otherwise fall back to sans-serif
    ctx.font = `bold ${config.fontSize}px CustomFont, "DejaVu Sans", "Liberation Sans", sans-serif`;
    ctx.fillStyle = config.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add stronger text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Draw custom text
    ctx.fillText(config.customText, config.textX, config.textY);

    // Draw text again without shadow for crispness (double rendering)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(config.customText, config.textX, config.textY);

    // Convert to buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
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