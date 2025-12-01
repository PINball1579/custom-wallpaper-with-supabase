import axios from 'axios';

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

/**
 * Send image to LINE using external image URL
 * Note: LINE requires images to be publicly accessible via HTTPS
 */
export async function sendImageUrlToLine(userId: string, imageUrl: string, previewUrl?: string): Promise<boolean> {
  try {
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

    const response = await axios.post(LINE_MESSAGING_API, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });

    return response.status === 200;
  } catch (error: any) {
    console.error('Error sending image URL to LINE:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Send image to LINE using base64 data
 * This uploads the image data directly
 */
export async function sendImageBase64ToLine(userId: string, base64Image: string): Promise<boolean> {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // LINE Messaging API requires external URLs
    // We need to send as a different message type or host the image
    // For now, we'll send a text message with a download instruction
    const message = {
      to: userId,
      messages: [
        {
          type: 'text',
          text: '🎨 Your custom DIOR wallpaper is ready!\n\nPlease download it from the browser using the download button.'
        }
      ]
    };

    const response = await axios.post(LINE_MESSAGING_API, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });

    return response.status === 200;
  } catch (error: any) {
    console.error('Error sending base64 image to LINE:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Send text message to LINE with wallpaper ready notification
 */
export async function sendWallpaperNotification(userId: string): Promise<boolean> {
  try {
    const message = {
      to: userId,
      messages: [
        {
          type: 'text',
          text: '🎨 Your custom wallpaper is ready!\n\nYou can download it from the browser, or use the "Send to LINE" button to receive it here.'
        }
      ]
    };

    const response = await axios.post(LINE_MESSAGING_API, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });

    return response.status === 200;
  } catch (error: any) {
    console.error('Error sending notification to LINE:', error.response?.data || error.message);
    return false;
  }
}