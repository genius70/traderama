-- Fix security issues identified by linter

-- Enable RLS on tables that are missing it
ALTER TABLE public.action_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for action_rewards (admin only)
CREATE POLICY "Only admins can manage action rewards" ON public.action_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create RLS policies for user_actions (users can insert their own)
CREATE POLICY "Users can insert their own actions" ON public.user_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own actions" ON public.user_actions
    FOR SELECT USING (auth.uid() = user_id);

-- Fix function search paths - update all functions without SET search_path
CREATE OR REPLACE FUNCTION public.calculate_user_reward_points(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  total_points NUMERIC := 0;
BEGIN
  -- Calculate points from various activities
  SELECT COALESCE(SUM(credits_awarded), 0) INTO total_points
  FROM public.user_activities
  WHERE user_id = p_user_id;
  
  RETURN total_points;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_feature_usage(p_user_id uuid, p_feature_name text, p_time_spent integer DEFAULT 0, p_success boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.feature_usage (user_id, feature_name, usage_count, total_time_spent, success_rate)
    VALUES (p_user_id, p_feature_name, 1, p_time_spent, CASE WHEN p_success THEN 100.00 ELSE 0.00 END)
    ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        last_used_at = now(),
        total_time_spent = feature_usage.total_time_spent + p_time_spent,
        success_rate = (
            (feature_usage.success_rate * feature_usage.usage_count) + 
            CASE WHEN p_success THEN 100.00 ELSE 0.00 END
        ) / (feature_usage.usage_count + 1),
        updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_user_session(p_session_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.distribute_rewards(p_admin_id uuid, p_user_ids uuid[], p_reward_type text, p_amount_per_user numeric, p_description text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  distribution_id UUID;
  user_id UUID;
BEGIN
  -- Create distribution record
  INSERT INTO public.reward_distributions (
    admin_id, user_ids, reward_type, 
    total_amount, amount_per_user, description
  )
  VALUES (
    p_admin_id, p_user_ids, p_reward_type,
    p_amount_per_user * array_length(p_user_ids, 1),
    p_amount_per_user, p_description
  )
  RETURNING id INTO distribution_id;
  
  -- Create individual reward records
  FOREACH user_id IN ARRAY p_user_ids
  LOOP
    INSERT INTO public.user_rewards (
      user_id, reward_type, reward_amount, description
    )
    VALUES (
      user_id, p_reward_type, p_amount_per_user, p_description
    );
  END LOOP;
  
  RETURN distribution_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_pending_rewards()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  processed_count INTEGER := 0;
  reward_record RECORD;
BEGIN
  -- Process pending rewards
  FOR reward_record IN 
    SELECT * FROM public.user_rewards 
    WHERE status = 'pending' 
    AND (expires_at IS NULL OR expires_at > now())
  LOOP
    -- Update user credits
    UPDATE public.kem_credits 
    SET credits_earned = credits_earned + reward_record.reward_amount,
        updated_at = now()
    WHERE user_id = reward_record.user_id;
    
    -- Mark reward as processed
    UPDATE public.user_rewards
    SET status = 'processed', 
        claimed_at = now(),
        updated_at = now()
    WHERE id = reward_record.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_rewards()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  -- Mark expired rewards
  UPDATE public.user_rewards
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'pending' 
  AND expires_at IS NOT NULL 
  AND expires_at <= now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$;