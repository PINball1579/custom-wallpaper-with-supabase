'use client';

import { useState } from 'react';
import { WALLPAPER_CONFIGS } from '@/lib/wallpaperGenerator';

interface WallpaperDesignerProps {
  lineUserId: string;
}

export default function WallpaperDesigner({ lineUserId }: WallpaperDesignerProps) {
  const [step, setStep] = useState<'select' | 'customize' | 'complete'>('select');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [startIndex, setStartIndex] = useState<number>(0);

  const wallpapers = Object.keys(WALLPAPER_CONFIGS);

  const handleNext = () => {
    if (selectedWallpaper) {
      setStep('customize');
    }
  };

  const handleBack = () => {
    setStep('select');
    setCustomText('');
    setGeneratedImage('');
    setError('');
    setSuccessMessage('');
  };

  const handlePrevWallpapers = () => {
    setStartIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? wallpapers.length - 1 : newIndex;
    });
  };

  const handleNextWallpapers = () => {
    setStartIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= wallpapers.length ? 0 : newIndex;
    });
  };

  const getVisibleWallpapers = () => {
    const visible = [];
    for (let i = 0; i < 4; i++) {
      const index = (startIndex + i) % wallpapers.length;
      visible.push(wallpapers[index]);
    }
    return visible;
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
      
      // Move to complete step
      setStep('complete');
      
    } catch (err: any) {
      console.error('Error generating wallpaper:', err);
      setError(err.message || 'Failed to generate wallpaper');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendToLine = async (imageBuffer?: string) => {
    setIsSending(true);

    try {
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

      setSuccessMessage('Wallpaper sent to your LINE chat!');
    } catch (err: any) {
      console.error('Error sending to LINE:', err);
      setError(err.message || 'Failed to send to LINE');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateAnother = () => {
    setStep('select');
    setSelectedWallpaper('');
    setCustomText('');
    setGeneratedImage('');
    setError('');
    setSuccessMessage('');
  };

  // Wallpaper Selection Step
  if (step === 'select') {
    const visibleWallpapers = getVisibleWallpapers();

    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex justify-center pt-8 pb-6">
          <img 
            src="/Dior-Logo.png" 
            alt="DIOR" 
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="w-16 border-t-2 border-dotted border-gray-300"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-medium">
            2
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-light tracking-wide text-black">
            CHOOSE A WALLPAPER PATTERN
          </h2>
        </div>

        {/* Banner Image */}
        <div className="px-6 mb-6">
          <img 
            src="/wallpapers/banner.jpg" 
            alt="Design Wallpaper" 
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Crect fill='%2318274d' width='1200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='serif'%3EDESIGN WALLPAPER%3C/text%3E%3C/svg%3E`;
            }}
          />
        </div>

        {/* Wallpaper Grid with Navigation */}
        <div className="flex-1 px-6">
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={handlePrevWallpapers}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition"
              aria-label="Previous wallpapers"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNextWallpapers}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition"
              aria-label="Next wallpapers"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 4 Wallpapers Grid */}
            <div className="grid grid-cols-4 gap-3">
              {visibleWallpapers.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedWallpaper(id)}
                  className={`aspect-[9/16] rounded-lg overflow-hidden border-2 transition ${
                    selectedWallpaper === id
                      ? 'border-black ring-2 ring-black'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={`/wallpapers/${id}.jpg`}
                    alt={`Wallpaper ${id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 2400'%3E%3Crect fill='%23f3f4f6' width='1080' height='2400'/%3E%3C/svg%3E`;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="px-6 py-6">
          <button
            onClick={handleNext}
            disabled={!selectedWallpaper}
            className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            NEXT &gt;
          </button>
        </div>
      </div>
    );
  }

  // Customize Step
  if (step === 'customize') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex justify-center pt-8 pb-6">
          <img 
            src="/Dior-Logo.png" 
            alt="DIOR" 
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-medium">
            1
          </div>
          <div className="w-16 border-t-2 border-dotted border-gray-300"></div>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
            2
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-light tracking-wide text-black">
            ADD YOUR NAME
          </h2>
        </div>

        {/* Banner Image */}
        <div className="px-6 mb-6">
          <img 
            src="/wallpapers/banner.jpg" 
            alt="Add Your Name" 
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Crect fill='%2318274d' width='1200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='serif'%3EADD YOUR NAME%3C/text%3E%3C/svg%3E`;
            }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Wallpaper Preview */}
          <div className="relative w-full max-w-sm mb-6">
            <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-2xl">
              <div className="relative w-full h-full">
                <img
                  src={`/wallpapers/${selectedWallpaper}.jpg`}
                  alt="Selected wallpaper"
                  className="w-full h-full object-cover"
                />
                {customText && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-4xl font-bold text-gray-700" style={{ 
                      fontFamily: '"NotoSansThai", "Sarabun", "Kanit", sans-serif'
                    }}>
                      {customText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={customText}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 10) {
                  setCustomText(value);
                }
              }}
              placeholder="*MAXIMUM 10 CHARACTERS"
              className="w-full px-4 py-3 border border-black rounded-none text-center text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              {customText.length}/10 characters
            </p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="w-full max-w-sm mt-4 p-3 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-6 space-y-3">
          <button
            onClick={handleBack}
            className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 transition"
          >
            &lt; BACK
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !customText.trim()}
            className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'GENERATING...' : 'SUBMIT'}
          </button>
        </div>
      </div>
    );
  }

  // Complete Step
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-center pt-8 pb-6">
        <img 
          src="/Dior-Logo.png" 
          alt="DIOR" 
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-light tracking-wide text-black">
          YOUR WALLPAPER IS READY
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Wallpaper Preview */}
        <div className="relative w-full max-w-sm mb-6">
          <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-2xl">
            <img
              src={generatedImage}
              alt="Generated wallpaper"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="w-full max-w-sm mb-4 p-3 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-sm mb-4 p-3 bg-red-50 border border-red-200 rounded text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 space-y-3">
        <button
          onClick={() => window.open('https://line.me/R/', '_blank')}
          className="w-full bg-green-600 text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-green-700 transition flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23z"/>
          </svg>
          GO TO CHAT WINDOW TO DOWNLOAD
        </button>
        
        <button
          onClick={handleCreateAnother}
          className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 transition"
        >
          CREATE ANOTHER
        </button>
      </div>
    </div>
  );
}