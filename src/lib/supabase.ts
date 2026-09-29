import { createClient, SupabaseClient } from '@supabase/supabase-js';

const RUNTIME_STORAGE_KEY = 'ue_farm_supabase_credentials';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

function isValidUrl(str: string): boolean {
  if (!str) return false;
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  try {
    const raw = localStorage.getItem(RUNTIME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return { url: '', anonKey: '' };
}

export function getActiveSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isEnvValid =
    Boolean(envUrl && envKey) &&
    envUrl !== 'https://your-project.supabase.co' &&
    envKey !== 'your-anon-key' &&
    isValidUrl(envUrl);

  if (isEnvValid) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const stored = getStoredSupabaseCredentials();
  if (stored.url && stored.anonKey && isValidUrl(stored.url)) {
    return {
      url: stored.url,
      anonKey: stored.anonKey,
      isConfigured: true,
      source: 'custom',
    };
  }

  return {
    url: envUrl || '',
    anonKey: envKey || '',
    isConfigured: false,
    source: 'none',
  };
}

let cachedClient: SupabaseClient | null = null;
let currentConfigSignature = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getActiveSupabaseConfig();
  const signature = `${config.url}::${config.anonKey}::${config.isConfigured}`;

  if (!config.isConfigured) {
    cachedClient = null;
    currentConfigSignature = signature;
    return null;
  }

  if (cachedClient && currentConfigSignature === signature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentConfigSignature = signature;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  if (cleanUrl && cleanKey && isValidUrl(cleanUrl)) {
    localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  } else {
    localStorage.removeItem(RUNTIME_STORAGE_KEY);
  }
  // Reset cached client
  cachedClient = null;
  currentConfigSignature = '';
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(RUNTIME_STORAGE_KEY);
  cachedClient = null;
  currentConfigSignature = '';
}

// Check connection to Supabase database
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; pingMs?: number }> {
  const config = getActiveSupabaseConfig();
  if (!config.isConfigured) {
    return { success: false, message: 'Supabase credentials are not configured yet (Local offline mode active).' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Invalid Supabase URL format. Please provide a valid project URL.' };
  }

  const start = performance.now();
  try {
    const { error } = await client.from('farm_plots').select('id').limit(1);
    const pingMs = Math.round(performance.now() - start);

    if (error) {
      // Check if table missing
      if (
        error.code === '42P01' ||
        error.message.includes('relation "farm_plots" does not exist') ||
        error.message.includes('not found')
      ) {
        return {
          success: false,
          message: `Connected to Supabase project, but database tables are not initialized yet. Copy the SQL Schema and run it in the Supabase SQL Editor.`,
          pingMs,
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}`, pingMs };
    }

    return { success: true, message: `Connected to Supabase PostgreSQL database (${pingMs}ms)`, pingMs };
  } catch (err: any) {
    const errText = String(err?.message || err);
    if (errText.includes('Failed to fetch') || errText.includes('NetworkError') || errText.includes('TypeError')) {
      return {
        success: false,
        message: 'Could not connect to Supabase host. Please check that your Project URL and Anon Key are valid and your network connection is online.',
      };
    }
    return { success: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
}

// SQL Schema script for user reference in Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- U & E GRACE FOUNDATION FARM, IKOT EKPENE - SUPABASE POSTGRESQL SCHEMA
-- Execute this script in the Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Users & Roles Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'farm_worker',
  phone TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farm Plots Table
CREATE TABLE IF NOT EXISTS farm_plots (
  id BIGSERIAL PRIMARY KEY,
  plot_code TEXT UNIQUE NOT NULL,
  plot_name TEXT NOT NULL,
  location TEXT NOT NULL,
  size NUMERIC NOT NULL DEFAULT 1.0,
  size_unit TEXT DEFAULT 'hectares',
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_harvest_date DATE,
  status TEXT NOT NULL DEFAULT 'Active',
  description TEXT,
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farm Resources & Equipment Table
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  resource_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'Good',
  location TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Farm Inputs & Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  item_code TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Bag',
  minimum_stock NUMERIC NOT NULL DEFAULT 5,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'Available',
  qr_code TEXT UNIQUE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Farm Workers Directory Table
CREATE TABLE IF NOT EXISTS workers (
  id BIGSERIAL PRIMARY KEY,
  worker_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Farm Activities Table
CREATE TABLE IF NOT EXISTS farm_activities (
  id BIGSERIAL PRIMARY KEY,
  activity_code TEXT UNIQUE NOT NULL,
  activity_name TEXT NOT NULL,
  plot_id BIGINT REFERENCES farm_plots(id) ON DELETE SET NULL,
  resource_id BIGINT REFERENCES resources(id) ON DELETE SET NULL,
  worker_id BIGINT REFERENCES workers(id) ON DELETE SET NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  inventory_item_id BIGINT REFERENCES inventory(id) ON DELETE SET NULL,
  quantity_used NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QR Codes Registry Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id BIGSERIAL PRIMARY KEY,
  qr_code TEXT UNIQUE NOT NULL,
  record_type TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS) and grant demo policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'farm_plots' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON farm_plots FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON resources FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON inventory FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workers' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON workers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'farm_activities' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON farm_activities FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_codes' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON qr_codes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;
