-- supabase/migrations/20250716071501_create_contact_management_tables.sql

-- Create profiles table (if not already created in previous migrations)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  name TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID REFERENCES auth.users(id),
  user_ids UUID[] NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'whatsapp', 'both')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID REFERENCES auth.users(id),
  user_ids UUID[] NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'whatsapp', 'both')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_access ON messages
  FOR ALL
  TO authenticated
  USING (auth.email() = 'royan.shaw@gmail.com')
  WITH CHECK (auth.email() = 'royan.shaw@gmail.com');

-- Enable Row Level Security (RLS) for scheduled_messages table
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_access ON scheduled_messages
  FOR ALL
  TO authenticated
  USING (auth.email() = 'royan.shaw@gmail.com')
  WITH CHECK (auth.email() = 'royan.shaw@gmail.com');

-- Enable real-time for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;
