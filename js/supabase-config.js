/**
 * supabase-config.js — X-Fly Supabase Configuration
 * ═══════════════════════════════════════════════════
 *  ⚙️  ใส่ค่าจาก: Supabase Dashboard → Project Settings → API
 * ═══════════════════════════════════════════════════
 */

const SUPABASE_URL      = 'https://lcqabitvqdytuljhdkks.supabase.co';       // https://xxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcWFiaXR2cWR5dHVsamhka2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTA2MDIsImV4cCI6MjEwNDMyNjYwMn0.tYQaqFlPIQeL7JmD34DwVQCYRq9Dq-9PSYzwJ9QIvAQ';  // eyJhbGciOiJIUzI1NiIsInR5cCI6...

// สร้าง Supabase Client (ใช้ตัวแปร supabase จาก CDN)
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
