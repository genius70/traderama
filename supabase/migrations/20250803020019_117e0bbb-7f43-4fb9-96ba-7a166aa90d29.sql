-- Fix function search path security issues by setting search_path for all functions

-- Fix the update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column();
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

-- Fix the handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user();
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

-- Fix the update_feature_usage function
DROP FUNCTION IF EXISTS public.update_feature_usage(uuid, text, integer, boolean);
CREATE OR REPLACE FUNCTION public.update_feature_usage(p_user_id uuid, p_feature_name text, p_time_spent integer DEFAULT 0, p_success boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.feature_usage (user_id, feature_name, usage_count, total_time_spent, success_rate)
    VALUES (p_user_id, p_feature_name, 1, p_time_spent, CASE WHEN p_success THEN 100.00 ELSE 0.00 END)
    ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = public.feature_usage.usage_count + 1,
        last_used_at = now(),
        total_time_spent = public.feature_usage.total_time_spent + p_time_spent,
        success_rate = (
            (public.feature_usage.success_rate * public.feature_usage.usage_count) + 
            CASE WHEN p_success THEN 100.00 ELSE 0.00 END
        ) / (public.feature_usage.usage_count + 1),
        updated_at = now();
END;
$$;

-- Fix the end_user_session function
DROP FUNCTION IF EXISTS public.end_user_session(text);
CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_sessions 
    SET 
        ended_at = now(),
        duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))::INTEGER,
        pages_visited = (
            SELECT COUNT(DISTINCT page_path) 
            FROM public.page_views 
            WHERE session_id = p_session_id
        ),
        actions_count = (
            SELECT COUNT(*) 
            FROM public.user_engagement 
            WHERE session_id = p_session_id
        )
    WHERE session_id = p_session_id AND ended_at IS NULL;
END;
$$;

-- Fix the get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role();
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Fix the is_admin_role function
DROP FUNCTION IF EXISTS public.is_admin_role(user_role);
CREATE OR REPLACE FUNCTION public.is_admin_role(role_to_check user_role)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN role_to_check IN ('admin', 'super_admin');
END;
$$;

-- Fix the update_ig_broker_connections_updated_at function
DROP FUNCTION IF EXISTS public.update_ig_broker_connections_updated_at();
CREATE OR REPLACE FUNCTION public.update_ig_broker_connections_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;