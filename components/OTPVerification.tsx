'use client';

import { useState, useEffect, useRef } from 'react';

interface OTPVerificationProps {
  phoneNumber: string;
  referenceCode: string;
  onVerified: () => void;
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[-\s]/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} - ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function OTPVerification({ phoneNumber, referenceCode, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [currentReferenceCode, setCurrentReferenceCode] = useState(referenceCode);

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
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '');
      if (digits.length === 6) {
        const newOtp = digits.split('').slice(0, 6);
        setOtp(newOtp);
        inputRefs.current[5]?.focus();
        return;
      } else if (digits.length > 0) {
        const newOtp = [...otp];
        const digitsArray = digits.split('');
        for (let i = 0; i < digitsArray.length && index + i < 6; i++) {
          newOtp[index + i] = digitsArray[i];
        }
        setOtp(newOtp);
        const nextIndex = Math.min(index + digitsArray.length, 5);
        inputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
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

      if (data.referenceCode) {
        setCurrentReferenceCode(data.referenceCode);
      }

      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* DIOR Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/Dior-Logo.png"
            alt="DIOR"
            className="h-16 w-auto object-contain"
          />
        </div>

        <div className="text-center space-y-6">
          {/* Title */}
          <h1 className="text-xl font-light tracking-wide text-black">
            PHONE NUMBER VERIFICATION
          </h1>

          {/* Description */}
          <div className="space-y-1 text-sm text-black">
            <p>An OTP was sent to verify</p>
            <p>your phone number.</p>
          </div>

          {/* Phone Number */}
          <p className="text-base font-semibold text-black">
            {formatPhoneNumber(phoneNumber)}
          </p>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* OTP Input Label */}
          <p className="text-sm font-medium text-black pt-4">PLEASE ENTER OTP</p>

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Boxes */}
            <div className="flex justify-center gap-2">
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
                  className="w-12 h-14 text-center text-2xl font-medium border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black text-black"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Reference Code */}
            <div className="text-sm text-gray-600">
              REFERENCE CODE : <span className="font-semibold text-black">{currentReferenceCode}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-black text-white py-4 rounded-none text-sm font-medium tracking-wider hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'VERIFYING...' : 'SUBMIT'}
            </button>

            {/* Timer */}
            <div className="text-sm">
              {timer > 0 ? (
                <p className="text-gray-500">
                  RESEND OTP IN <span className="font-semibold text-black">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-red-600 font-medium">OTP EXPIRED</p>
              )}
            </div>

            {/* Resend Button */}
            {canResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-black underline hover:text-gray-700 transition disabled:text-gray-400"
              >
                RESEND OTP
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}