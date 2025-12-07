'use client';

import { useState } from 'react';

interface UserInfoFormProps {
  lineUserId: string;
  onSubmit: (userData: any, referenceCode: string) => void;
}

export default function UserInfoForm({ lineUserId, onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    consent: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.consent) {
        setError('Please consent to data collection');
        setLoading(false);
        return;
      }

      // Send OTP (don't save user data yet)
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber })
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Failed to send OTP');
      }

      // Pass form data and reference code to parent (will be saved after OTP verification)
      // Include lineUserId in the data
      onSubmit({
        ...formData,
        lineUserId
      }, otpData.referenceCode || '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center">
              <img 
                src="/Dior-Logo.png" 
                alt="DIOR" 
                className="h-20 w-auto object-contain"
              />
          </div>
        </div>
          <p className="text-sm text-black mb-4">REQUIRED INFORMATION</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-black">TITLES<span className="text-red-600 ml-1">*</span></label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            >
              <option value=""></option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">FIRST NAME (EN)<span className="text-red-600 ml-1">*</span></label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">LAST NAME (EN)<span className="text-red-600 ml-1">*</span></label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">GENDER<span className="text-red-600 ml-1">*</span></label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            >
              <option value=""></option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">DATE OF BIRTH<span className="text-red-600 ml-1">*</span></label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">EMAIL<span className="text-red-600 ml-1">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">PHONE NUMBER<span className="text-red-600 ml-1">*</span></label>
            
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black"
              required
            />
          </div>
            <div className="h-[1px] w-full bg-black mb-1"/>
            <p className='leading-1 text-sm'>Please take a moment to review our privacy policy and terms of conditions and indicate your consent by checking the respective boxes provided on the form.</p>

          <div className="flex items-start mt-6">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="mt-1 mr-2"
              required
            />

            <label className="text-sm text-black">
              <p>I agree to the Dior's <span className="underline cursor-pointer">terms and conditions</span> and <span className="underline cursor-pointer">privacy policy</span></p>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {loading ? 'Sending OTP...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
}