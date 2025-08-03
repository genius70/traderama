-- Fix function dependencies by dropping triggers first, then recreating functions with proper search_path

-- Drop triggers that depend on the function
DROP TRIGGER IF EXISTS update_trades_updated_at ON trades;
DROP TRIGGER IF EXISTS update_analytics_updated_at ON analytics;
DROP TRIGGER IF EXISTS update_ig_broker_connections_updated_at ON ig_broker_connections;

-- Now we can safely drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_trades_updated_at 
    BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at 
    BEFORE UPDATE ON analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ig_broker_connections_updated_at 
    BEFORE UPDATE ON ig_broker_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fix other functions with proper search_path (recreate only if they exist)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referral_code TEXT;
BEGIN
  -- Generate unique referral code based on email
  referral_code := SUBSTRING(REPLACE(NEW.email, '@', ''), 1, 8) || EXTRACT(EPOCH FROM now())::TEXT;
  
  -- Check if this is the first user in the system
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    -- First user gets super_admin role
    INSERT INTO public.profiles (id, email, name, role, referral_code)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin User'), 'super_admin', referral_code);
  ELSE
    -- All other users get default user role
    INSERT INTO public.profiles (id, email, name, referral_code)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), referral_code);
  END IF;
  
  -- Initialize KEM credits for new user
  INSERT INTO public.kem_credits (user_id) VALUES (NEW.id);
  
  -- Initialize escrow account
  INSERT INTO public.escrow_accounts (user_id, account_number) 
  VALUES (NEW.id, 'ESC-' || NEW.id::TEXT);
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();