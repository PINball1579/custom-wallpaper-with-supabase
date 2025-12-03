import axios from 'axios';

const OTP_API_BASE_URL = 'https://otp.thaibulksms.com/v2/otp';

interface OTPRequestResponse {
  status: string;
  token: string;
  refno?: string; // Reference number from API
}

interface OTPVerifyResponse {
  status: string;
  message: string;
}

/**
 * Request OTP from ThaiBulkSMS
 * Returns a token and reference code that will be used for verification
 */
export async function requestOTP(phoneNumber: string): Promise<{ 
  success: boolean; 
  token?: string; 
  referenceCode?: string;
  error?: string 
}> {
  try {
    console.log('📞 Requesting OTP for phone:', phoneNumber);

    const apiKey = process.env.THAIBULKSMS_API_KEY;
    const secret = process.env.THAIBULKSMS_SECRET;

    if (!apiKey || !secret) {
      console.error('❌ Missing ThaiBulkSMS credentials');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    // Create form-encoded parameters
    const params = new URLSearchParams();
    params.set('msisdn', phoneNumber);
    params.set('key', apiKey);
    params.set('secret', secret);

    const response = await axios.post<OTPRequestResponse>(
      `${OTP_API_BASE_URL}/request`,
      params.toString(),
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('📨 ThaiBulkSMS Response:', response.data);

    if (response.data && response.data.token) {
      return {
        success: true,
        token: response.data.token,
        referenceCode: response.data.refno || response.data.token.substring(0, 6).toUpperCase()
      };
    }

    return {
      success: false,
      error: 'Failed to generate OTP token'
    };
  } catch (error: any) {
    console.error('❌ Error requesting OTP:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error?.message 
      || error.message
      || 'Failed to send OTP';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verify OTP with ThaiBulkSMS
 */
export async function verifyOTP(token: string, pin: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log('🔐 Verifying OTP with token');

    const apiKey = process.env.THAIBULKSMS_API_KEY;
    const secret = process.env.THAIBULKSMS_SECRET;

    if (!apiKey || !secret) {
      console.error('❌ Missing ThaiBulkSMS credentials');
      return {
        success: false,
        message: 'SMS service not configured'
      };
    }

    // Create form-encoded parameters
    const params = new URLSearchParams();
    params.set('token', token);
    params.set('pin', pin);
    params.set('key', apiKey);
    params.set('secret', secret);

    const response = await axios.post<OTPVerifyResponse>(
      `${OTP_API_BASE_URL}/verify`,
      params.toString(),
      {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('✅ Verify Response:', response.data);

    if (response.data && response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully'
      };
    }

    return {
      success: false,
      message: response.data?.message || 'Invalid OTP code'
    };
  } catch (error: any) {
    console.error('❌ Error verifying OTP:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error?.message 
      || error.message
      || 'OTP verification failed';
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Export alias for backward compatibility
export const verifyOTPWithThaiBulk = verifyOTP;