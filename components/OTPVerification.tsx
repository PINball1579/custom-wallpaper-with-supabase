'use client';

import { useState, useEffect, useRef } from 'react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
}

export default function OTPVerification({ phoneNumber, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  // Create refs for each input
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Handle paste or autocomplete with full OTP
    if (value.length > 1) {
      // Extract only digits
      const digits = value.replace(/\D/g, '');
      
      if (digits.length === 6) {
        // Full OTP pasted or autocompleted
        const newOtp = digits.split('').slice(0, 6);
        setOtp(newOtp);
        
        // Focus the last input
        inputRefs.current[5]?.focus();
        return;
      } else if (digits.length > 0) {
        // Partial paste - fill from current position
        const newOtp = [...otp];
        const digitsArray = digits.split('');
        
        for (let i = 0; i < digitsArray.length && index + i < 6; i++) {
          newOtp[index + i] = digitsArray[i];
        }
        
        setOtp(newOtp);
        
        // Focus next empty input or last input
        const nextIndex = Math.min(index + digitsArray.length, 5);
        inputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    // Single digit input
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // If current box has value, just clear it
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '');
    
    if (digits.length === 6) {
      const newOtp = digits.split('').slice(0, 6);
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      // Reset form state
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
      // Show success message
      alert('New OTP has been sent to your phone');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center">
              <img 
                src="/Dior-Logo.png" 
                alt="DIOR" 
                className="h-20 w-auto object-contain"
              />
          </div>
          <p className="text-gray-600 mb-4">PHONE NUMBER VERIFICATION</p>
          <p className="text-sm text-gray-500">
            We have sent a verification code to<br />
            <strong>{phoneNumber}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className="w-12 h-12 text-center text-2xl border-2 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                OTP expires in <strong>{formatTime(timer)}</strong>
              </p>
            ) : (
              <p className="text-sm text-red-600">OTP expired</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition mb-3"
          >
            {loading ? 'Verifying...' : 'SUBMIT'}
          </button>

          {canResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full border border-black text-black py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Resend OTP
            </button>
          )}
        </form>
      </div>
    </div>
  );
}