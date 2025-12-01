import axios from 'axios';

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

/**
 * Send image to LINE using external image URL
 * Note: LINE requires images to be publicly accessible via HTTPS
 */
export async function sendImageUrlToLine(userId: string, imageUrl: string, previewUrl?: string): Promise<boolean> {
  try {
    console.log('📤 Sending image to LINE:', { userId, imageUrl });

    // Validate inputs
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not configured');
      return false;
    }

    if (!imageUrl.startsWith('https://')) {
      console.error('❌ Image URL must be HTTPS:', imageUrl);
      return false;
    }

    const message = {
      to: userId,
      messages: [
        {
          type: 'image',
          originalContentUrl: imageUrl,
          previewImageUrl: previewUrl || imageUrl
        }
      ]
    };

    console.log('📨 Sending LINE message:', JSON.stringify(message, null, 2));

    const response = await axios.post(LINE_MESSAGING_API, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ LINE API Response:', response.status, response.statusText);
    return response.status === 200;
  } catch (error: any) {
    console.error('❌ Error sending image URL to LINE:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Log specific LINE API errors
    if (error.response?.data) {
      console.error('LINE API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

/**
 * Send text message to LINE with wallpaper ready notification
 */
export async function sendWallpaperNotification(userId: string, imageUrl?: string): Promise<boolean> {
  try {
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      console.error('❌ LINE_CHANNEL_ACCESS_TOKEN not configured');
      return false;
    }

    const message = {
      to: userId,
      messages: [
        {
          type: 'text',
          text: imageUrl 
            ? `🎨 Your custom DIOR wallpaper is ready!\n\n${imageUrl}`
            : '🎨 Your custom wallpaper is ready! You can download it from the browser.'
        }
      ]
    };

    const response = await axios.post(LINE_MESSAGING_API, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      timeout: 30000
    });

    return response.status === 200;
  } catch (error: any) {
    console.error('❌ Error sending notification to LINE:', error.response?.data || error.message);
    return false;
  }
}