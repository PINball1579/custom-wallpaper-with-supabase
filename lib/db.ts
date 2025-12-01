import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Log connection config (without sensitive data) on startup
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
});

// Test database connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection test failed:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return false;
  }
}

export interface User {
  id?: number;
  line_uuid: string;
  title?: string;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  email: string;
  phone_number: string;
}

export interface OTPVerification {
  id?: number;
  phone_number: string;
  otp_token: string;
  expires_at: Date;
  verified: boolean;
}

export interface WallpaperDownload {
  id?: number;
  wallpaper_id: string;
  download_count: number;
}

// User operations
export async function createUser(user: User): Promise<any> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      line_uuid: user.line_uuid,
      title: user.title,
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      email: user.email,
      phone_number: user.phone_number,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'line_uuid',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByUUID(lineUUID: string): Promise<any> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('line_uuid', lineUUID)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

// OTP operations
export async function createOTP(phoneNumber: string, otpToken: string): Promise<any> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  const { data, error } = await supabase
    .from('otp_verifications')
    .insert({
      phone_number: phoneNumber,
      otp_token: otpToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOTPByPhone(phoneNumber: string): Promise<any> {
  const { data, error } = await supabase
    .from('otp_verifications')
    .select('*')
    .eq('phone_number', phoneNumber)
    .gt('expires_at', new Date().toISOString())
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function markOTPAsVerified(id: number): Promise<void> {
  const { error } = await supabase
    .from('otp_verifications')
    .update({ verified: true })
    .eq('id', id);

  if (error) throw error;
}

// Wallpaper download tracking
export async function incrementWallpaperDownload(wallpaperId: string): Promise<any> {
  // First, try to get existing record
  const { data: existing } = await supabase
    .from('wallpaper_downloads')
    .select('*')
    .eq('wallpaper_id', wallpaperId)
    .single();

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('wallpaper_downloads')
      .update({
        download_count: existing.download_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('wallpaper_id', wallpaperId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('wallpaper_downloads')
      .insert({
        wallpaper_id: wallpaperId,
        download_count: 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getWallpaperStats(): Promise<any[]> {
  const { data, error } = await supabase
    .from('wallpaper_downloads')
    .select('wallpaper_id, download_count')
    .order('wallpaper_id');

  if (error) throw error;
  return data || [];
}