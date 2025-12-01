import pg from 'pg';

// Create PostgreSQL connection pool optimized for Supabase
const connectionString = process.env.POSTGRES_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log connection config (without sensitive data) on startup
console.log('🔧 Database Config:', {
  usingConnectionString: !!process.env.POSTGRES_URL,
  host: process.env.DB_HOST || 'from connection string',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'from connection string',
  hasPassword: !!process.env.DB_PASSWORD || !!process.env.POSTGRES_URL,
  connectionString: connectionString.replace(/:[^:@]+@/, ':****@'), // Hide password in logs
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Test connection function with better error handling
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful:', result.rows[0]);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection test failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
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
  const query = `
    INSERT INTO users (line_uuid, title, first_name, last_name, gender, date_of_birth, email, phone_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (line_uuid) 
    DO UPDATE SET 
      title = $2,
      first_name = $3,
      last_name = $4,
      gender = $5,
      date_of_birth = $6,
      email = $7,
      phone_number = $8,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const values = [
    user.line_uuid,
    user.title,
    user.first_name,
    user.last_name,
    user.gender,
    user.date_of_birth,
    user.email,
    user.phone_number
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getUserByUUID(lineUUID: string): Promise<any> {
  const query = 'SELECT * FROM users WHERE line_uuid = $1';
  const result = await pool.query(query, [lineUUID]);
  return result.rows[0] || null;
}

// OTP operations
export async function createOTP(phoneNumber: string, otpToken: string): Promise<any> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  const query = `
    INSERT INTO otp_verifications (phone_number, otp_token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  
  const result = await pool.query(query, [phoneNumber, otpToken, expiresAt]);
  return result.rows[0];
}

export async function getOTPByPhone(phoneNumber: string): Promise<any> {
  const query = `
    SELECT * FROM otp_verifications 
    WHERE phone_number = $1 
    AND expires_at > NOW()
    AND verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  const result = await pool.query(query, [phoneNumber]);
  return result.rows[0] || null;
}

export async function markOTPAsVerified(id: number): Promise<void> {
  const query = 'UPDATE otp_verifications SET verified = TRUE WHERE id = $1';
  await pool.query(query, [id]);
}

// Wallpaper download tracking
export async function incrementWallpaperDownload(wallpaperId: string): Promise<any> {
  const query = `
    INSERT INTO wallpaper_downloads (wallpaper_id, download_count)
    VALUES ($1, 1)
    ON CONFLICT (wallpaper_id) 
    DO UPDATE SET 
      download_count = wallpaper_downloads.download_count + 1,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const result = await pool.query(query, [wallpaperId]);
  return result.rows[0];
}

export async function getWallpaperStats(): Promise<any[]> {
  const query = `
    SELECT wallpaper_id, download_count 
    FROM wallpaper_downloads 
    ORDER BY wallpaper_id
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

// Export pool for custom queries if needed
export { pool };