'use client';

import { useState } from 'react';

interface UserInfoFormProps {
  lineUserId: string;
  onSubmit: (userData: any, referenceCode: string) => void;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  required: boolean;
  options?: { value: string; label: string }[];
}

const FORM_FIELDS: FormField[] = [
  {
    name: 'title',
    label: 'TITLES',
    type: 'select',
    required: true,
    options: [
      { value: '', label: '' },
      { value: 'Mr.', label: 'Mr.' },
      { value: 'Mrs.', label: 'Mrs.' },
      { value: 'Ms.', label: 'Ms.' },
    ],
  },
  {
    name: 'firstName',
    label: 'FIRST NAME (EN)',
    type: 'text',
    required: true,
  },
  {
    name: 'lastName',
    label: 'LAST NAME (EN)',
    type: 'text',
    required: true,
  },
  {
    name: 'gender',
    label: 'GENDER',
    type: 'select',
    required: true,
    options: [
      { value: '', label: '' },
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'dateOfBirth',
    label: 'DATE OF BIRTH',
    type: 'date',
    required: true,
  },
  {
    name: 'email',
    label: 'EMAIL',
    type: 'email',
    required: true,
  },
  {
    name: 'phoneNumber',
    label: 'PHONE NUMBER',
    type: 'tel',
    required: true,
  },
];

export default function UserInfoForm({ lineUserId, onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.consent) {
        setError('Please consent to data collection');
        setLoading(false);
        return;
      }

      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      const otpData = await otpResponse.json();

      if (!otpResponse.ok) {
        throw new Error(otpData.error || 'Failed to send OTP');
      }

      onSubmit(
        {
          ...formData,
          lineUserId,
        },
        otpData.referenceCode || ''
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

const renderField = (field: FormField) => {
    const inputClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black text-md';
    const selectClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black appearance-none bg-white pr-10 text-md';
    const dateClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black text-black border-black appearance-none bg-white pr-10 text-md';

    return (
      <div key={field.name}>
        <label className="block text-sm mb-1 text-black">
          {field.label}
          {field.required && <span className="text-red-600 ml-1">*</span>}
        </label>
        {field.type === 'select' ? (
          <div className="relative">
            <select
              name={field.name}
              value={formData[field.name] as string}
              onChange={handleChange}
              className={selectClasses}
              required={field.required}
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <img 
              src="/chevron.png" 
              alt="dropdown" 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            />
          </div>
        ) : field.type === 'date' ? (
          <div className="relative">
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] as string}
              onChange={handleChange}
              max={getTodayDate()}
              className={dateClasses}
              required={field.required}
            />
            <img 
              src="/chevron.png" 
              alt="calendar" 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            />
          </div>
        ) : (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] as string}
            onChange={handleChange}
            className={inputClasses}
            required={field.required}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg px-6">
        <div className="text-center">
          <div className="flex justify-center pt-2 pb-4">
            <img src="/Dior-Logo.png" alt="DIOR" className="h-12 w-auto object-contain" />
          </div>
        </div>
        <p className="text-md text-black mb-4">REQUIRED INFORMATION<span className="text-red-600 ml-1">*</span></p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {FORM_FIELDS.map(renderField)}

          <div className="h-[1px] w-full bg-black mb-1" />
          <p className="leading-1 text-sm">
            Please take a moment to review our privacy policy and terms of conditions and indicate
            your consent by checking the respective boxes provided on the form.
          </p>

          <div className="flex items-start mt-6">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent as boolean}
              onChange={handleChange}
              className="mt-1 mr-2"
              required
            />
            <label className="text-sm text-black">
              <p>
                I agree to the Dior's{' '}
                <span className="underline cursor-pointer">terms and conditions</span> and{' '}
                <span className="underline cursor-pointer">privacy policy</span>
              </p>
            </label>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-64 bg-black text-lg text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading ? 'Sending OTP...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}