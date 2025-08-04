-- supabase/migrations/20250804121300_rewards_tables.sql
CREATE TABLE user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  credits INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_cycle_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  total_credits INTEGER,
  cycles_completed INTEGER,
  credit_rewards_kem DECIMAL,
  bonus_rewards_kem DECIMAL,
  claimed BOOLEAN DEFAULT FALSE,
  claim_timestamp TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, period_start)
);

CREATE TABLE user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  min_balance_kem DECIMAL,
  min_balance_usd DECIMAL,
  tier TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE action_rewards (
  action TEXT PRIMARY KEY,
  credits INTEGER NOT NULL,
  description TEXT,
  cooldown_minutes INTEGER,
  daily_limit INTEGER
);
