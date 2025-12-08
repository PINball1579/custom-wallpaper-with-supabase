'use client';

import { useState } from 'react';
import { WALLPAPER_CONFIGS } from '@/lib/wallpaperGenerator';
import liff from '@line/liff';

interface WallpaperDesignerProps {
  lineUserId: string;
}

export default function WallpaperDesigner({ lineUserId }: WallpaperDesignerProps) {
  const [step, setStep] = useState<'select' | 'customize' | 'generating' | 'complete'>('select');
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleCloseComplete = () => {
    // Reset all states and go back to select
    setStep('select');
    setSelectedWallpaper('');
    setCustomText('');
    setGeneratedImage('');
    setError('');
    setSuccessMessage('');
    setStartIndex(0);
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
    setStep('generating');

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
      setStep('customize');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendToLine = async (imageBuffer?: string) => {
    try {
      const bufferToSend = imageBuffer || generatedImage.replace(/^data:image\/\w+;base64,/, '');

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
    }
  };

  // Step 1: Wallpaper Selection
  if (step === 'select') {
    const visibleWallpapers = getVisibleWallpapers();

    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header with DIOR logo */}
        <div className="flex justify-center pt-2 pb-4">
          <img
            src="/Dior-Logo.png"
            alt="DIOR"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="text-lg tracking-widest text-black">
            CHOOSE A WALLPAPER PATTERN
          </h2>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-base font-medium">
            1
          </div>
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-300 flex items-center justify-center text-base font-medium">
            2
          </div>
        </div>

        {/* Single large preview wallpaper */}
        <div className="px-6 mb-6">
          <div className="max-w-[200px] mx-auto">
            <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg">
              <img
                src={`/wallpapers/${selectedWallpaper || wallpapers[0]}.jpg`}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* DESIGN WALLPAPER button */}
        <div className="px-6 mb-8">
          <button className="w-full bg-black text-white py-2 text-lg font-medium tracking-widest">
            DESIGN WALLPAPER
          </button>
        </div>

        {/* Wallpaper carousel with 4 options */}
        <div className="px-6 mb-8">
          <div className="relative flex items-center justify-center gap-4">
            {/* Left Arrow */}
            <button
              onClick={handlePrevWallpapers}
              className="flex-shrink-0"
            >
              <img
                src="/chevron.png"
                alt="Previous"
                className="w-8 h-8 rotate-90"
              />
            </button>

            {/* 4 Wallpapers Grid */}
            <div className="grid grid-cols-4 gap-2 max-w-md">
              {visibleWallpapers.map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedWallpaper(id)}
                  className={`aspect-[9/16] rounded overflow-hidden border transition ${selectedWallpaper === id
                    ? 'border-2 border-black'
                    : 'border border-gray-300'
                    }`}
                >
                  <img
                    src={`/wallpapers/${id}.jpg`}
                    alt={`Wallpaper ${id}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleNextWallpapers}
              className="flex-shrink-0"
            >
              <img
                src="/chevron.png"
                alt="Next"
                className="w-8 h-8 -rotate-90"
              />
            </button>
          </div>
        </div>

        {/* NEXT Button */}
        <div className="px-6 pb-8 mt-auto flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedWallpaper}
            className="flex items-center gap-2 rounded-lg bg-black text-white px-16 py-2 text-xl tracking-widest disabled:bg-gray-400"
          >
            NEXT
            <img
              src="/chevron.png"
              alt="Next"
              className="w-6 h-6 -rotate-90 invert"
            />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Customize with Name
  if (step === 'customize') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex justify-center pt-2 pb-4">
          <img
            src="/Dior-Logo.png"
            alt="DIOR"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h2 className="text-lg tracking-widest text-black">
            ADD YOUR NAME
          </h2>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-300 flex items-center justify-center text-base font-medium">
            1
          </div>
          <div className="flex items-center gap-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-base font-medium">
            2
          </div>
        </div>

{/* Single large preview wallpaper WITH custom text overlay */}
        <div className="px-6 mb-6">
          <div className="max-w-[200px] mx-auto">
            <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg relative">
              <img
                src={`/wallpapers/${selectedWallpaper}.jpg`}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Text overlay preview */}
              {customText && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    color: WALLPAPER_CONFIGS[selectedWallpaper as keyof typeof WALLPAPER_CONFIGS].fontColor,
                    fontSize: `${WALLPAPER_CONFIGS[selectedWallpaper as keyof typeof WALLPAPER_CONFIGS].fontSize / 7}px`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    top: `${((WALLPAPER_CONFIGS[selectedWallpaper as keyof typeof WALLPAPER_CONFIGS].textY / 2400) * 100)-3}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  {customText}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ADD YOUR NAME button */}
        <div className="px-6 mb-8">
          <button className="w-full bg-black text-white py-2 text-lg font-medium tracking-widest">
            ADD YOUR NAME
          </button>
        </div>

        {/* Input field */}
        <div className="px-6 mb-8">
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 10) {
                setCustomText(value);
              }
            }}
            placeholder="* MAXIMUM 10 CHARACTERS"
            className="w-full px-4 py-2 border border-gray-300 text-center text-base placeholder-gray-400 focus:outline-none focus:border-black"
            style={{ fontSize: '16px' }}
            maxLength={10}
          />
        </div>

        {error && (
          <div className="px-6 mb-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-8 mt-auto flex flex-col items-center gap-4">
          <button
            onClick={handleBack}
            className="w-64 flex items-center justify-center gap-2 rounded-lg bg-black text-white py-2 text-xl tracking-widest hover:bg-gray-800 transition"
          >
            <img
              src="/chevron.png"
              alt="Back"
              className="w-6 h-6 rotate-90 invert"
            />
            <span>BACK</span>
          </button>
          <button
            onClick={handleGenerate}
            disabled={!customText.trim()}
            className="w-64 flex items-center justify-center gap-2 rounded-lg bg-black text-white py-2 text-xl tracking-widest hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            SUBMIT
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Generating (Loading state)
  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* Dior Logo at the Top */}
        <div className="pt-6 pb-20 flex justify-center w-full">
          <img
            src="/Dior-Logo.png"
            alt="DIOR"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Middle Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center -mt-20">
          {/* IN PROGRESS TEXT */}
          <h2 className="text-lg tracking-widest text-black mb-10">
            IN PROGRESS.......
          </h2>

          {/* Loading Spinner */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0">
              <div className="w-full h-full border-4 border-gray-200 rounded-full"></div>
            </div>
            <div className="absolute inset-0 animate-spin">
              <div className="w-full h-full border-4 border-transparent border-t-black rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-center pt-2 mb-8">
          <img
            src="/Dior-Logo.png"
            alt="DIOR"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* White box container */}
        <div className="bg-white rounded-2xl p-6 mb-6 flex flex-col" style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.15)' }}>
          {/* Close button - first row, right aligned */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleCloseComplete}
              className="w-8 h-8 flex items-center justify-center text-black hover:text-gray-600 transition"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Title - second row, center aligned */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-normal tracking-widest text-black">
              YOUR WALLPAPER IS READY
            </h2>
          </div>

          {/* Final wallpaper preview */}
          <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-md">
            <img
              src={generatedImage}
              alt="Final wallpaper"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* GO TO THE CHAT WINDOW TO DOWNLOAD Button */}
        <button
          onClick={() => liff.closeWindow()}
          className="w-full bg-black text-white py-4 rounded-lg text-sm font-medium tracking-widest hover:bg-gray-900 transition"
        >
          GO TO THE CHAT WINDOW TO DOWNLOAD
        </button>
      </div>
    </div>
  );
}