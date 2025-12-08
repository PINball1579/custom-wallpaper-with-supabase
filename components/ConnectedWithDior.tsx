'use client';

interface ConnectedWithDiorProps {
  onContinue: () => void;
}

export default function ConnectedWithDior({ onContinue }: ConnectedWithDiorProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Connected Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-light tracking-wide text-black">
            CONNECTED WITH
          </h1>
          <div className="flex justify-center">
            <img 
              src="/Dior-Logo.png" 
              alt="DIOR" 
              className="h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* Description Text */}
        <div className="py-8">
          <p className="text-sm text-black leading-relaxed">
            ENJOY A UNIQUE EXPERIENCE WITH<br />
            OUR CAPTIVATING WALLPAPER DESIGNS
          </p>
        </div>

        {/* Design Wallpaper Button */}
        <button
          onClick={onContinue}
          className="w-full bg-black text-white py-2 rounded-lg text-xl tracking-wider hover:bg-gray-900 transition-colors"
        >
          DESIGN WALLPAPER
        </button>
      </div>
    </div>
  );
}