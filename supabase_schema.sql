-- ═══════════════════════════════════════════════════════════════
-- ✈️ Xfly-Anyway Airlines — Complete Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════
-- วิธีใช้งาน:
-- 1. เข้าสู่ระบบ Supabase Dashboard (https://supabase.com/dashboard)
-- 2. ไปที่โปรเจคของคุณ -> เมนูด้านซ้ายเลือก "SQL Editor"
-- 3. คลิก "+ New query" แล้ววางโค้ด SQL ทั้งหมดในไฟล์นี้ลงไป
-- 4. กดปุ่ม "Run" เพื่อสร้างตาราง, อัพเดทฟิลด์, RLS Policies และข้อมูลเริ่มต้น
-- ═══════════════════════════════════════════════════════════════

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 2. AIRPORTS TABLE (ข้อมูลสนามบิน)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.airports (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Airports (สนามบินมาตรฐานในไทยและต่างประเทศ)
INSERT INTO public.airports (code, name, city, country, active) VALUES
('BKK', 'Suvarnabhumi International Airport', 'Bangkok', 'Thailand', true),
('DMK', 'Don Mueang International Airport', 'Bangkok', 'Thailand', true),
('CNX', 'Chiang Mai International Airport', 'Chiang Mai', 'Thailand', true),
('HKT', 'Phuket International Airport', 'Phuket', 'Thailand', true),
('USM', 'Samui International Airport', 'Koh Samui', 'Thailand', true),
('KBV', 'Krabi International Airport', 'Krabi', 'Thailand', true),
('UTH', 'Udon Thani International Airport', 'Udon Thani', 'Thailand', true),
('CEI', 'Mae Fah Luang - Chiang Rai Airport', 'Chiang Rai', 'Thailand', true),
('NRT', 'Narita International Airport', 'Tokyo', 'Japan', true),
('HND', 'Haneda International Airport', 'Tokyo', 'Japan', true),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', true),
('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', true),
('LHR', 'Heathrow Airport', 'London', 'United Kingdom', true),
('CDG', 'Charles de Gaulle Airport', 'Paris', 'France', true),
('HKG', 'Hong Kong International Airport', 'Hong Kong', 'Hong Kong', true),
('TPE', 'Taiwan Taoyuan Airport', 'Taipei', 'Taiwan', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    active = EXCLUDED.active;

-- ═══════════════════════════════════════════════════════════════
-- 3. AIRLINES TABLE (ข้อมูลสายการบิน)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.airlines (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'Thailand',
    fleet INT DEFAULT 16,
    status VARCHAR(50) DEFAULT 'Active',
    logo VARCHAR(50) DEFAULT '✈️',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Airlines (สายการบินหลัก Xfly-Anyway และสายการบินพันธมิตร)
INSERT INTO public.airlines (code, name, country, fleet, status, logo) VALUES
('XF', 'Xfly-Anyway Airlines', 'Thailand', 16, 'Active', '✈️'),
('TG', 'Thai Airways', 'Thailand', 48, 'Active', '🟣'),
('PG', 'Bangkok Airways', 'Thailand', 24, 'Active', '🔵'),
('FD', 'Thai AirAsia', 'Thailand', 36, 'Active', '🔴')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    fleet = EXCLUDED.fleet,
    status = EXCLUDED.status,
    logo = EXCLUDED.logo;

-- ═══════════════════════════════════════════════════════════════
-- 4. FLIGHTS TABLE (ข้อมูลเที่ยวบิน)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.flights (
    id VARCHAR(20) PRIMARY KEY,
    airline_code VARCHAR(10) REFERENCES public.airlines(code) ON DELETE SET NULL,
    airline_name VARCHAR(255) DEFAULT 'Xfly-Anyway Airlines',
    from_code VARCHAR(3) REFERENCES public.airports(code) ON DELETE CASCADE,
    from_city VARCHAR(100) NOT NULL,
    from_name VARCHAR(255),
    to_code VARCHAR(3) REFERENCES public.airports(code) ON DELETE CASCADE,
    to_city VARCHAR(100) NOT NULL,
    to_name VARCHAR(255),
    departure VARCHAR(10) NOT NULL,
    arrival VARCHAR(10) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    price INT NOT NULL DEFAULT 1290,
    seats_first INT DEFAULT 12,
    seats_business INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ปรับปรุงคอลัมน์ให้อัตโนมัติ (Safely migrate flight seat columns)
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS seats_first INT DEFAULT 12;
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS seats_business INT DEFAULT 60;

-- Seed Default Flights (ตารางเที่ยวบินหลักของ Xfly-Anyway Airlines ทั้งในและต่างประเทศ)
INSERT INTO public.flights (id, airline_code, airline_name, from_code, from_city, from_name, to_code, to_city, to_name, departure, arrival, duration, price, seats_first, seats_business) VALUES
('XF101', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'CNX', 'Chiang Mai', 'Chiang Mai Intl', '06:00', '07:15', '1h 15m', 1290, 12, 60),
('XF202', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'HKT', 'Phuket', 'Phuket Intl', '08:30', '09:45', '1h 15m', 1590, 12, 60),
('XF303', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'USM', 'Koh Samui', 'Samui Intl', '10:00', '11:20', '1h 20m', 1890, 12, 60),
('XF404', 'XF', 'Xfly-Anyway Airlines', 'CNX', 'Chiang Mai', 'Chiang Mai Intl', 'BKK', 'Bangkok', 'Suvarnabhumi', '13:00', '14:15', '1h 15m', 1350, 12, 60),
('XF505', 'XF', 'Xfly-Anyway Airlines', 'HKT', 'Phuket', 'Phuket Intl', 'BKK', 'Bangkok', 'Suvarnabhumi', '15:30', '16:45', '1h 15m', 1650, 12, 60),
('XF606', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'KBV', 'Krabi', 'Krabi Intl', '17:00', '18:20', '1h 20m', 1490, 12, 60),
('XF701', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'NRT', 'Tokyo', 'Narita Intl', '08:00', '16:30', '6h 30m', 8900, 12, 60),
('XF702', 'XF', 'Xfly-Anyway Airlines', 'NRT', 'Tokyo', 'Narita Intl', 'BKK', 'Bangkok', 'Suvarnabhumi', '18:00', '23:00', '7h 00m', 9200, 12, 60),
('XF801', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'SIN', 'Singapore', 'Changi Intl', '09:30', '13:00', '2h 30m', 3450, 12, 60),
('XF802', 'XF', 'Xfly-Anyway Airlines', 'SIN', 'Singapore', 'Changi Intl', 'BKK', 'Bangkok', 'Suvarnabhumi', '14:30', '16:00', '2h 30m', 3450, 12, 60),
('XF901', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'ICN', 'Seoul', 'Incheon Intl', '23:30', '07:00', '5h 30m', 7800, 12, 60),
('XF951', 'XF', 'Xfly-Anyway Airlines', 'BKK', 'Bangkok', 'Suvarnabhumi', 'LHR', 'London', 'Heathrow', '01:15', '07:45', '12h 30m', 18900, 12, 60)
ON CONFLICT (id) DO UPDATE SET
    airline_name = EXCLUDED.airline_name,
    from_code = EXCLUDED.from_code,
    from_city = EXCLUDED.from_city,
    from_name = EXCLUDED.from_name,
    to_code = EXCLUDED.to_code,
    to_city = EXCLUDED.to_city,
    to_name = EXCLUDED.to_name,
    departure = EXCLUDED.departure,
    arrival = EXCLUDED.arrival,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price,
    seats_first = EXCLUDED.seats_first,
    seats_business = EXCLUDED.seats_business;

-- ═══════════════════════════════════════════════════════════════
-- 5. BOOKINGS TABLE (การจองและตั๋วโดยสาร E-Boarding Pass)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID,
    flight_id VARCHAR(20),
    airline_name VARCHAR(255) DEFAULT 'Xfly-Anyway Airlines',
    seat_id VARCHAR(10) NOT NULL,
    seat_class VARCHAR(50) DEFAULT 'business', -- 'first' (First Class 👑), 'business' (Business Class ✨)
    base_price INT DEFAULT 0,
    total_price INT DEFAULT 0,
    payment_method VARCHAR(100) DEFAULT 'PromptPay', -- 'PromptPay', 'CreditCard', 'TrueMoney', 'Bitcoin (BTC)', 'Ethereum (ETH)'
    passenger_title VARCHAR(20),
    passenger_name VARCHAR(255) NOT NULL,
    passenger_email VARCHAR(255) NOT NULL,
    passenger_phone VARCHAR(50),
    passenger_id_number VARCHAR(50),
    flight_from VARCHAR(50),
    flight_to VARCHAR(50),
    departure VARCHAR(20),
    arrival VARCHAR(20),
    status VARCHAR(50) DEFAULT 'confirmed',
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

-- ปรับปรุงคอลัมน์ให้อัตโนมัติ (Safely migrate existing columns)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS airline_name VARCHAR(255) DEFAULT 'Xfly-Anyway Airlines';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS seat_class VARCHAR(50) DEFAULT 'economy';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS base_price INT DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_price INT DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'PromptPay';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_title VARCHAR(20);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(255);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(50);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS passenger_id_number VARCHAR(50);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS flight_from VARCHAR(50);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS flight_to VARCHAR(50);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS departure VARCHAR(20);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS arrival VARCHAR(20);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'confirmed';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booked_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- อัพเดตชื่อสายการบินเดิมเป็น Xfly-Anyway Airlines
UPDATE public.bookings 
SET airline_name = 'Xfly-Anyway Airlines' 
WHERE airline_name IS NULL OR airline_name = 'X-Fly Airlines';

-- ═══════════════════════════════════════════════════════════════
-- 6. SEAT_LOCKS TABLE (ผังและสถานะล็อกที่นั่ง Real-time)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.seat_locks (
    flight_seat_id VARCHAR(50) PRIMARY KEY, -- ตัวอย่าง: 'XF101-1A'
    flight_id VARCHAR(20) NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available', -- available, locked, booked
    session_id VARCHAR(100),
    booking_id VARCHAR(50),
    locked_at BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. ADMINS / STAFF TABLE (เจ้าหน้าที่ผู้ดูแลระบบและปฏิบัติการการบิน / Staff)
-- แยกเฉพาะบัญชีเจ้าหน้าที่ Staff/Admin (ห้ามปนกับบัญชี Owner)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admins (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    department VARCHAR(100) DEFAULT 'Flight Operations',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Staff / Admins (เฉพาะเจ้าหน้าที่ผู้ดูแลระบบและตรวจสอบตั๋ว)
INSERT INTO public.admins (id, name, email, password, role, department, status) VALUES
('STF-001', 'Xfly Operations Staff', 'staff@xfly.com', 'staff1234', 'staff_lead', 'Flight Operations', 'active'),
('STF-T01', 'Ticket Officer', 'ticket@xfly.com', 'ticket1234', 'ticket', 'Passenger & Ticket Services', 'active'),
('ADM-001', 'System Administrator', 'admin@xfly.com', 'admin1234', 'staff_lead', 'Central IT & Operations', 'active'),
('ADM-002', 'Flight Operations Support', 'ops@xfly.com', 'admin1234', 'ops_staff', 'Flight Control', 'active')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    status = EXCLUDED.status;

-- ลบบัญชี Owner ออกจากตาราง Admins หากเคยมีอยู่เดิม
DELETE FROM public.admins WHERE email = 'owner@xfly.com';

-- ═══════════════════════════════════════════════════════════════
-- 8. OWNERS TABLE (ผู้บริหารสูงสุด / Executive Owners)
-- แยกตาราง ข้อมูล และรหัสผ่านออกจาก Admin ชัดเจน 100%
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.owners (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'owner',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Owners (เฉพาะบัญชีผู้บริหารสูงสุด)
INSERT INTO public.owners (id, name, email, password, role, status) VALUES
('OWN-001', 'X-Fly Executive Owner', 'owner@xfly.com', 'owner1234', 'owner', 'active')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- ═══════════════════════════════════════════════════════════════
-- 9. PROFILES TABLE (โปรไฟล์ผู้ใช้งาน / Customer Profiles)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- เปิดให้ Client เชื่อมต่อ อ่าน-เขียน ได้อย่างราบรื่น
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if existing
DROP POLICY IF EXISTS "Public full access on airports" ON public.airports;
DROP POLICY IF EXISTS "Public full access on airlines" ON public.airlines;
DROP POLICY IF EXISTS "Public full access on flights" ON public.flights;
DROP POLICY IF EXISTS "Public full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public full access on seat_locks" ON public.seat_locks;
DROP POLICY IF EXISTS "Public full access on admins" ON public.admins;
DROP POLICY IF EXISTS "Public full access on owners" ON public.owners;
DROP POLICY IF EXISTS "Public full access on profiles" ON public.profiles;

-- Create Open Policies for Anon & Authenticated users
CREATE POLICY "Public full access on airports" ON public.airports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on airlines" ON public.airlines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on flights" ON public.flights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on seat_locks" ON public.seat_locks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on owners" ON public.owners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Grant Table Permissions
GRANT ALL ON TABLE public.airports TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.airlines TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.flights TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.seat_locks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admins TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.owners TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════
-- 🎉 เสร็จสิ้นการติดตั้งและอัพเดทโครงสร้าง Database
-- ═══════════════════════════════════════════════════════════════
