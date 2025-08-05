-- Create comprehensive database schema for trading platform

-- First ensure we have all necessary types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'strategy_status') THEN
        CREATE TYPE strategy_status AS ENUM ('draft', 'published', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_status') THEN
        CREATE TYPE trade_status AS ENUM ('pending', 'open', 'closed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'broker_type') THEN
        CREATE TYPE broker_type AS ENUM ('ig', 'alpaca', 'interactive_brokers', 'td_ameritrade');
    END IF;
END
$$;

-- Create live_positions table for real-time position tracking
CREATE TABLE IF NOT EXISTS public.live_positions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_connection_id UUID REFERENCES public.ig_broker_connections(id),
    symbol TEXT NOT NULL,
    position_type TEXT NOT NULL CHECK (position_type IN ('CALL', 'PUT', 'IRON_CONDOR', 'BULL_SPREAD', 'BEAR_SPREAD')),
    contracts INTEGER NOT NULL DEFAULT 1,
    strike_price NUMERIC,
    expiry_date DATE,
    premium_paid NUMERIC NOT NULL DEFAULT 0,
    current_value NUMERIC NOT NULL DEFAULT 0,
    unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
    status trade_status NOT NULL DEFAULT 'pending',
    direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    broker_position_id TEXT,
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    greeks JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_market_data table for real-time market feeds
CREATE TABLE IF NOT EXISTS public.live_market_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    bid NUMERIC,
    ask NUMERIC,
    volume BIGINT,
    change_percent NUMERIC,
    iv_rank NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    source TEXT NOT NULL DEFAULT 'alpha_vantage'
);

-- Create auto_trading_settings table
CREATE TABLE IF NOT EXISTS public.auto_trading_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    risk_percentage NUMERIC NOT NULL DEFAULT 5 CHECK (risk_percentage >= 0 AND risk_percentage <= 100),
    max_daily_trades INTEGER NOT NULL DEFAULT 10,
    max_position_size NUMERIC NOT NULL DEFAULT 1000,
    stop_loss_percentage NUMERIC DEFAULT 20,
    take_profit_percentage NUMERIC DEFAULT 50,
    allowed_strategies UUID[] DEFAULT '{}',
    trading_hours_start TIME DEFAULT '09:30',
    trading_hours_end TIME DEFAULT '16:00',
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategy_signals table for automated trading signals
CREATE TABLE IF NOT EXISTS public.strategy_signals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id UUID NOT NULL REFERENCES public.trading_strategies(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'CLOSE')),
    symbol TEXT NOT NULL,
    strike_price NUMERIC,
    expiry_date DATE,
    option_type TEXT CHECK (option_type IN ('CALL', 'PUT')),
    confidence_score NUMERIC DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    market_conditions JSONB,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    executed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'expired'))
);

-- Create broker_sync_logs table for tracking API synchronization
CREATE TABLE IF NOT EXISTS public.broker_sync_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_connection_id UUID REFERENCES public.ig_broker_connections(id),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('positions', 'orders', 'account_info', 'market_data')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    sync_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update price_history table to support live data better
ALTER TABLE public.price_history 
ADD COLUMN IF NOT EXISTS open_price NUMERIC,
ADD COLUMN IF NOT EXISTS high_price NUMERIC,
ADD COLUMN IF NOT EXISTS low_price NUMERIC,
ADD COLUMN IF NOT EXISTS bid NUMERIC,
ADD COLUMN IF NOT EXISTS ask NUMERIC,
ADD COLUMN IF NOT EXISTS iv NUMERIC,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'alpha_vantage';

-- Ensure market_data table has all necessary columns
ALTER TABLE public.market_data 
ADD COLUMN IF NOT EXISTS bid NUMERIC,
ADD COLUMN IF NOT EXISTS ask NUMERIC,
ADD COLUMN IF NOT EXISTS change_percent NUMERIC,
ADD COLUMN IF NOT EXISTS market_cap BIGINT;

-- Enable RLS on all new tables
ALTER TABLE public.live_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_trading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for live_positions
CREATE POLICY "Users can manage their own live positions" ON public.live_positions
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for live_market_data (public read)
CREATE POLICY "Anyone can view live market data" ON public.live_market_data
    FOR SELECT USING (true);

-- Create RLS policies for auto_trading_settings
CREATE POLICY "Users can manage their own auto trading settings" ON public.auto_trading_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for strategy_signals
CREATE POLICY "Users can view signals for their strategies" ON public.strategy_signals
    FOR SELECT USING (
        strategy_id IN (
            SELECT id FROM public.trading_strategies 
            WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY "Strategy creators can manage signals" ON public.strategy_signals
    FOR ALL USING (
        strategy_id IN (
            SELECT id FROM public.trading_strategies 
            WHERE creator_id = auth.uid()
        )
    );

-- Create RLS policies for broker_sync_logs
CREATE POLICY "Users can view their own sync logs" ON public.broker_sync_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_positions_user_id ON public.live_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_positions_status ON public.live_positions(status);
CREATE INDEX IF NOT EXISTS idx_live_market_data_symbol ON public.live_market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_live_market_data_timestamp ON public.live_market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_strategy_signals_strategy_id ON public.strategy_signals(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_signals_status ON public.strategy_signals(status);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date ON public.price_history(symbol, date);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create triggers for updated_at
CREATE TRIGGER update_live_positions_updated_at
    BEFORE UPDATE ON public.live_positions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_auto_trading_settings_updated_at
    BEFORE UPDATE ON public.auto_trading_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();