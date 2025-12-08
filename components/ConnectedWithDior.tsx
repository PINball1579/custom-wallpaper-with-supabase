'use client';

import React from 'react';

interface ConnectedWithDiorProps {
  onContinue: () => void;
}

export default function ConnectedWithDior({ onContinue }: ConnectedWithDiorProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between items-center text-center p-6">
      {/* Top section centered vertically */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-4">
        <h1 className="text-2xl font-light tracking-wide text-black">
          CONNECTED WITH
        </h1>

        <img
          src="/Dior-Logo.png"
          alt="DIOR"
          className="h-20 w-auto mt-2 object-contain"
        />
      </div>

      {/* Bottom section */}
      <div className="w-full space-y-6 pb-6">
        <p className="text-sm text-black leading-relaxed">
          ENJOY A UNIQUE EXPERIENCE WITH<br />
          OUR CAPTIVATING WALLPAPER DESIGNS
        </p>

        <button
          onClick={onContinue}
          className="w-full bg-black text-white py-3 rounded-xl text-lg tracking-wide hover:bg-gray-900 transition-colors"
        >
          DESIGN WALLPAPER
        </button>
      </div>
    </div>
  );
}
