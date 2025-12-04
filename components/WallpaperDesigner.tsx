'use client';

import { useState } from 'react';
import { WALLPAPER_CONFIGS } from '@/lib/wallpaperGenerator';

interface WallpaperDesignerProps {
  lineUserId: string;
}

export default function WallpaperDesigner({ lineUserId }: WallpaperDesignerProps) {
  const [step, setStep] = useState<'select' | 'customize'>('select');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const wallpapers = Object.keys(WALLPAPER_CONFIGS);
  const currentIndex = wallpapers.indexOf(selectedWallpaper);

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

  const handlePrevWallpaper = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : wallpapers.length - 1;
    setSelectedWallpaper(wallpapers[newIndex]);
  };

  const handleNextWallpaper = () => {
    const newIndex = currentIndex < wallpapers.length - 1 ? currentIndex + 1 : 0;
    setSelectedWallpaper(wallpapers[newIndex]);
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

      setSuccessMessage('Wallpaper sent to your LINE chat successfully!');
    } catch (err: any) {
      console.error('Error sending to LINE:', err);
      setError(err.message || 'Failed to send to LINE. Please try downloading instead.');
    } finally {
      setIsSending(false);
    }
  };

  // Wallpaper Selection Step
  if (step === 'select') {
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
        <div className="flex justify-center items-center gap-2 mb-8">
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

        {/* Main Wallpaper Display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-full max-w-sm">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevWallpaper}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition"
              aria-label="Previous wallpaper"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNextWallpaper}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition"
              aria-label="Next wallpaper"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Main Wallpaper */}
            <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-2xl">
              <img
                src={selectedWallpaper ? `/wallpapers/${selectedWallpaper}.jpg` : '/wallpapers/wallpaper_1.jpg'}
                alt="Selected wallpaper"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1080 2400'%3E%3Crect fill='%23f3f4f6' width='1080' height='2400'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%23000' text-anchor='middle' dominant-baseline='middle'%3EDIOR%3C/text%3E%3C/svg%3E`;
                }}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="px-6 py-6">
          <div className="flex justify-center gap-3 mb-6 overflow-x-auto pb-2">
            {wallpapers.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedWallpaper(id)}
                className={`flex-shrink-0 w-20 aspect-[9/16] rounded-lg overflow-hidden border-2 transition ${
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

          {/* Next Button */}
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
      <div className="flex justify-center items-center gap-2 mb-8">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Wallpaper Preview */}
        <div className="relative w-full max-w-sm mb-6">
          <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-2xl">
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated wallpaper"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={`/wallpapers/${selectedWallpaper}.jpg`}
                  alt="Selected wallpaper"
                  className="w-full h-full object-cover"
                />
                {customText && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4">
                      <p className="text-4xl font-bold text-gray-700" style={{ 
                        fontFamily: '"NotoSansThai", "Sarabun", "Kanit", sans-serif'
                      }}>
                        {customText}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">CUSTOM NAME</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        {!generatedImage && (
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
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="w-full max-w-sm mt-4 p-3 bg-red-50 border border-red-200 rounded text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="w-full max-w-sm mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 space-y-3">
        {!generatedImage ? (
          <>
            <button
              onClick={handleBack}
              className="w-full border border-black text-black py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-100 transition"
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
          </>
        ) : (
          <button
            onClick={() => {
              setGeneratedImage('');
              setCustomText('');
              setError('');
              setSuccessMessage('');
            }}
            className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 transition"
          >
            CREATE ANOTHER
          </button>
        )}
      </div>
    </div>
  );
}