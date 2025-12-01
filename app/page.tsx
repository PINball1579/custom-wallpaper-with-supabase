'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import UserInfoForm from '@/components/UserInfoForm';
import OTPVerification from '@/components/OTPVerification';
import WallpaperDesigner from '@/components/WallpaperDesigner';

export default function Home() {
  const [step, setStep] = useState<'loading' | 'landing' | 'form' | 'otp' | 'design'>('loading');
  const [lineUserId, setLineUserId] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2008557685-ZXgMvAy9' });

        if (!mounted) return;

        // Check if opened in LINE
        // if (!liff.isInClient()) {
        //   alert('กรุณาเปิดลิงค์จากแอป LINE เท่านั้นเท่านั้น');
        //   window.location.href = 'https://line.me/R/ti/p/@809kdbpq';
        //   return;
        // }

        // Check if user is logged in
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // Get user profile
        const profile = await liff.getProfile();

        if (mounted) {
          setLineUserId(profile.userId);
          setStep('landing');
        }
      } catch (error) {
        console.error('LIFF initialization failed', error);
        if (mounted) {
          setError('Failed to initialize. Please try again.');
        }
      }
    };

    initializeLiff();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStartClick = () => {
    setStep('form');
  };

  const handleFormSubmit = (data: any) => {
    // Store user data temporarily (don't save to DB yet)
    setUserData(data);
    setStep('otp');
  };

  const handleOTPVerified = async () => {
    try {
      // Now save user data to database after OTP is verified
      const response = await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUUID: lineUserId,
          ...userData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user data');
      }

      // Proceed to design page
      setStep('design');
    } catch (err) {
      console.error('Error saving user data:', err);
      setError('Failed to save user data. Please try again.');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {step === 'landing' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-black">DIOR</h1>
            <p className="text-xl mb-6 text-black">DESIGN YOUR WALLPAPER</p>
            
            {/* Wallpaper Preview Image */}
            <div className="my-8 bg-gray-100 p-4 rounded-lg">
              <div className="aspect-[9/16] max-w-xs mx-auto bg-white rounded-lg shadow-md flex items-center justify-center">
                <p className="text-gray-400">Wallpaper Preview</p>
              </div>
              <p className="mt-4 text-sm font-medium">CUSTOM NAME</p>
            </div>

            <div className="mb-8 text-sm text-gray-600 space-y-2">
              <p>เพื่อให้เกมการออกแบบวอลเปเปอร์ในแบบของคุณสำเร็จ</p>
              <p>Wallpaper ในรูปแบบของคุณ</p>
              <p>กรุณาให้ข้อมูลแก่ผู้จัดงานเพื่อเก็บ</p>
              <p>เพื่อแจกภาพให้ Dior เมื่อสร้างสิ้นของที่คุณ</p>
              <p>และการติดตามผลของงานนี้ในอนาคต</p>
              <p>กรุณาตรวจสอบให้แน่ใจก่อนกดส่ง</p>
            </div>

            <button
              onClick={handleStartClick}
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition text-lg font-medium cursor-pointer"
            >
              CLICK TO START
            </button>
          </div>
        </div>
      )}
      
      {step === 'form' && (
        <UserInfoForm lineUserId={lineUserId} onSubmit={handleFormSubmit} />
      )}
      
      {step === 'otp' && userData && (
        <OTPVerification 
          phoneNumber={userData.phoneNumber} 
          onVerified={handleOTPVerified} 
        />
      )}

      {step === 'design' && (
        <WallpaperDesigner lineUserId={lineUserId} />
      )}
    </main>
  );
}