import { NextResponse } from 'next/server';
import { pool, testConnection } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic query
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    
    // Test connection function
    const connectionOk = await testConnection();
    
    return NextResponse.json({ 
      success: true, 
      connected: connectionOk,
      userCount: result.rows[0].user_count,
      timestamp: new Date().toISOString(),
      database: process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'DATABASE_URL',
      message: '✅ Database connection successful'
    });
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({ 
      success: false,
      connected: false,
      error: error.message,
      details: error.code || 'Unknown error',
      timestamp: new Date().toISOString(),
      message: '❌ Database connection failed'
    }, { status: 500 });
  }
}