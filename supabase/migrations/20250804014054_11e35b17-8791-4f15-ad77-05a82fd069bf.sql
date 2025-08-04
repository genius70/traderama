-- Complete database migration for all missing tables and functions

-- Create contact management tables
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  company TEXT,
  tags TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts
FOR DELETE
USING (auth.uid() = user_id);

-- Create user rewards computation table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_rewards
CREATE POLICY "Users can view their own rewards"
ON public.user_rewards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON public.user_rewards
FOR UPDATE
USING (auth.uid() = user_id);

-- Create reward distribution tracking table
CREATE TABLE IF NOT EXISTS public.reward_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  user_ids UUID[] NOT NULL,
  reward_type TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  amount_per_user NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reward_distributions
ALTER TABLE public.reward_distributions ENABLE ROW LEVEL SECURITY;

-- Create policies for reward_distributions
CREATE POLICY "Admins can manage reward distributions"
ON public.reward_distributions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Create price_history table for market data
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume BIGINT,
  sma20 NUMERIC,
  rsi NUMERIC,
  macd NUMERIC,
  signal NUMERIC,
  upperBB NUMERIC,
  lowerBB NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on price_history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create policy for price_history
CREATE POLICY "Anyone can view price history"
ON public.price_history
FOR SELECT
USING (true);

-- Create additional missing functions with SECURITY DEFINER

-- Function to calculate user reward points
CREATE OR REPLACE FUNCTION public.calculate_user_reward_points(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_points NUMERIC := 0;
BEGIN
  -- Calculate points from various activities
  SELECT COALESCE(SUM(credits_awarded), 0) INTO total_points
  FROM public.user_activities
  WHERE user_id = p_user_id;
  
  RETURN total_points;
END;
$$;

-- Function to distribute rewards to multiple users
CREATE OR REPLACE FUNCTION public.distribute_rewards(
  p_admin_id UUID,
  p_user_ids UUID[],
  p_reward_type TEXT,
  p_amount_per_user NUMERIC,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Function to process pending rewards
CREATE OR REPLACE FUNCTION public.process_pending_rewards()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Function to cleanup expired rewards
CREATE OR REPLACE FUNCTION public.cleanup_expired_rewards()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Function to get user contact statistics
CREATE OR REPLACE FUNCTION public.get_user_contact_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_contacts', COUNT(*),
    'active_contacts', COUNT(*) FILTER (WHERE status = 'active'),
    'with_phone', COUNT(*) FILTER (WHERE phone_number IS NOT NULL),
    'with_whatsapp', COUNT(*) FILTER (WHERE whatsapp_number IS NOT NULL),
    'with_email', COUNT(*) FILTER (WHERE email IS NOT NULL)
  ) INTO stats
  FROM public.contacts
  WHERE user_id = p_user_id;
  
  RETURN stats;
END;
$$;

-- Function to batch import contacts
CREATE OR REPLACE FUNCTION public.batch_import_contacts(
  p_user_id UUID,
  p_contacts JSON
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  contact_record JSON;
  import_count INTEGER := 0;
BEGIN
  -- Loop through contacts array
  FOR contact_record IN SELECT * FROM json_array_elements(p_contacts)
  LOOP
    INSERT INTO public.contacts (
      user_id, name, email, phone_number, 
      whatsapp_number, company, notes
    )
    VALUES (
      p_user_id,
      contact_record->>'name',
      contact_record->>'email',
      contact_record->>'phone_number',
      contact_record->>'whatsapp_number',
      contact_record->>'company',
      contact_record->>'notes'
    );
    
    import_count := import_count + 1;
  END LOOP;
  
  RETURN import_count;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at
  BEFORE UPDATE ON public.user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_distributions_updated_at
  BEFORE UPDATE ON public.reward_distributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();