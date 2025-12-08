'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import UserInfoForm from '@/components/UserInfoForm';
import OTPVerification from '@/components/OTPVerification';
import ConnectedWithDior from '@/components/ConnectedWithDior';
import WallpaperDesigner from '@/components/WallpaperDesigner';

export default function Home() {
  const [step, setStep] = useState<'loading' | 'landing' | 'form' | 'otp' | 'connected' | 'design'>('loading');
  const [lineUserId, setLineUserId] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2008557685-ZXgMvAy9' });

        if (!mounted) return;

        // Check if opened in LINE
        if (!liff.isInClient()) {
          alert('กรุณาเปิดลิงค์จากแอป LINE เท่านั้น');
          window.location.href = 'https://line.me/R/ti/p/@809kdbpq';
          return;
        }

        // Check if user is logged in
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // Get user profile
        const profile = await liff.getProfile();

        if (mounted) {
          setLineUserId(profile.userId);
          
          // Check if user is already registered
          // await checkUserRegistration(profile.userId);
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

  // Check if user is already registered in the database
  // const checkUserRegistration = async (userId: string) => {
  //   try {
  //     console.log('🔍 Checking user registration status...');
      
  //     const response = await fetch('/api/check-user', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ lineUUID: userId })
  //     });

  //     const data = await response.json();

  //     if (response.ok && data.registered) {
  //       console.log('✅ User is already registered');
  //       setIsRegistered(true);
  //       setUserData(data.user);
  //       // Skip to connected page for registered users
  //       setStep('connected');
  //     } else {
  //       console.log('ℹ️ New user - show landing page');
  //       setIsRegistered(false);
  //       // Show landing page for new users
  //       setStep('landing');
  //     }
  //   } catch (error) {
  //     console.error('❌ Error checking user registration:', error);
  //     // If check fails, show landing page as fallback
  //     setStep('landing');
  //   }
  // };

  const handleStartClick = () => {
    setStep('form');
  };

  const handleFormSubmit = (data: any, refCode: string) => {
    // Store user data and reference code temporarily (don't save to DB yet)
    setUserData(data);
    setReferenceCode(refCode);
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

      // Mark as registered
      setIsRegistered(true);

      // Proceed to connected page
      setStep('connected');
    } catch (err) {
      console.error('Error saving user data:', err);
      setError('Failed to save user data. Please try again.');
    }
  };

  const handleContinueToDesign = () => {
    setStep('design');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <main className="min-h-screen bg-white">
      {step === 'landing' && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg px-6 text-center">
            <div className="flex justify-center pt-2 pb-4">
              <img 
                src="/Dior-Logo.png" 
                alt="DIOR" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-lg tracking-widest text-black mb-3">DESIGN YOUR WALLPAPER</p>
            
            {/* Wallpaper Preview Image */}
            <div className="aspect-[9/16] max-w-[200px] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="/example_wallpaper.jpg" 
                alt="Example Wallpaper" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-4 mt-4 text-sm text-gray-600 space-y-2 leading-relaxed">
              <p>เพื่อค้นพบประสบการณ์ใหม่แห่งการสร้างสรรค์ Wallpaper ในรูปแบบของคุณ พร้อมทั้งได้รับข้อมูลและบริการสุดพิเศษ</p>
              <p>เพียงอนุญาตให้ Dior เชื่อมโยงกับบัญชีไลน์และกรอกแบบสอบถามเพื่อยืนยันการเชื่อมต่อข้อมูลที่ถูกต้อง</p>
            </div>

            <button
              onClick={handleStartClick}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition text-lg font-medium cursor-pointer"
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
          referenceCode={referenceCode}
          onVerified={handleOTPVerified} 
        />
      )}

      {step === 'connected' && (
        <ConnectedWithDior onContinue={handleContinueToDesign} />
      )}

      {step === 'design' && (
        <WallpaperDesigner lineUserId={lineUserId} />
      )}
    </main>
  );
}