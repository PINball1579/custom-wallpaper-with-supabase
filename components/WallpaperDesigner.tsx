'use client';

import { useState } from 'react';
import { WALLPAPER_CONFIGS } from '@/lib/wallpaperGenerator';

interface WallpaperDesignerProps {
  lineUserId: string;
}

export default function WallpaperDesigner({ lineUserId }: WallpaperDesignerProps) {
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('wallpaper_1');
  const [customText, setCustomText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const wallpapers = Object.keys(WALLPAPER_CONFIGS);

  const handleImageError = (wallpaperId: string) => {
    setImageErrors(prev => new Set([...prev, wallpaperId]));
  };

  const handleGenerate = async () => {
    if (!customText.trim()) {
      setError('Please enter your custom text');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/generate-wallpaper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallpaperId: selectedWallpaper,
          customText: customText.trim(),
          lineUserId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate wallpaper');
      }

      setGeneratedImage(data.image);
      
      // Automatically try to send to LINE
      await sendToLine(data.imageBuffer);
      
    } catch (err: any) {
      console.error('Error generating wallpaper:', err);
      setError(err.message || 'Failed to generate wallpaper');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendToLine = async (imageBuffer?: string) => {
    setIsSending(true);
    setError('');
    setSuccessMessage('');

    try {
      // Use the imageBuffer from generate or the current generatedImage
      const bufferToSend = imageBuffer || generatedImage.replace(/^data:image\/\w+;base64,/, '');

      // First, upload image to get public URL
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBuffer: bufferToSend,
          lineUserId
        })
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      // Then send the public URL to LINE
      const sendResponse = await fetch('/api/send-to-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId,
          imageUrl: uploadData.imageUrl
        })
      });

      const sendData = await sendResponse.json();

      if (!sendResponse.ok) {
        throw new Error(sendData.error || 'Failed to send to LINE');
      }

      setSuccessMessage('✅ Wallpaper sent to your LINE chat successfully!');
    } catch (err: any) {
      console.error('Error sending to LINE:', err);
      setError(err.message || 'Failed to send to LINE. Please try downloading instead.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `dior-wallpaper-${customText.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createPlaceholderImage = (id: string) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 2400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23064e3b;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23022c22;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1080' height='2400'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='%23d4af37' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EDIOR%3C/text%3E%3Ctext x='50%25' y='55%25' font-size='32' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif'%3E${id}%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Design Your Wallpaper</h1>

        {/* Wallpaper Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Select Wallpaper</label>
          <div className="grid grid-cols-3 gap-4">
            {wallpapers.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedWallpaper(id)}
                className={`relative aspect-[9/16] rounded-lg overflow-hidden border-4 transition ${
                  selectedWallpaper === id
                    ? 'border-black'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={imageErrors.has(id) ? createPlaceholderImage(id) : `/wallpapers/${id}.jpg`}
                  alt={id}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(id)}
                />
                {selectedWallpaper === id && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {imageErrors.size > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Some wallpaper images are missing. Placeholders shown. Upload images to public/wallpapers/
            </p>
          )}
        </div>

        {/* Custom Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Custom Text</label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter your name or text"
            maxLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">{customText.length}/20 characters</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !customText.trim()}
          className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Wallpaper'
          )}
        </button>

        {/* Generated Wallpaper Preview */}
        {generatedImage && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Your Wallpaper</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <img
                src={generatedImage}
                alt="Generated wallpaper"
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => sendToLine()}
                disabled={isSending}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending to LINE...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z"/>
                    </svg>
                    Send to LINE Chat
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Wallpaper
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}