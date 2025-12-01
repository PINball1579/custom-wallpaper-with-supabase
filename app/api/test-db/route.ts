import { NextResponse } from 'next/server';
import { supabase, testConnection } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic query - count users
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // Test connection function
    const connectionOk = await testConnection();
    
    return NextResponse.json({ 
      success: true, 
      connected: connectionOk,
      userCount: count || 0,
      timestamp: new Date().toISOString(),
      database: 'Supabase',
      supabaseUrl: process.env.SUPABASE_URL,
      message: '✅ Supabase connection successful'
    });
  } catch (error: any) {
    console.error('❌ Supabase test failed:', error);
    
    return NextResponse.json({ 
      success: false,
      connected: false,
      error: error.message,
      details: error.details || error.hint || 'Unknown error',
      code: error.code,
      timestamp: new Date().toISOString(),
      message: '❌ Supabase connection failed'
    }, { status: 500 });
  }
}