-- Fix search_path and remove invalid enum references
-- This migration adds search_path to all SECURITY DEFINER functions

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update get_user_primary_role function (removed invalid enum values)
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
      ELSE 4
    END
  LIMIT 1
$$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM saved_email_lists
    WHERE created_by = user_id
  )
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  
  INSERT INTO public.kem_credits (user_id, credits_earned, credits_spent, created_at, updated_at)
  VALUES (
    NEW.id,
    0,
    0,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update update_profile_completion function
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completion_data jsonb;
BEGIN
  completion_data := public.calculate_profile_completion(NEW);
  
  NEW.profile_completion_percentage := (completion_data->>'percentage')::integer;
  
  IF (completion_data->>'percentage')::integer = 100 AND NEW.profile_completed_at IS NULL THEN
    NEW.profile_completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create audit log table for profile access
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessor_user_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'update', 'delete')),
  accessed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view profile access logs"
ON public.profile_access_logs
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::user_role) OR
  public.has_role(auth.uid(), 'super_admin'::user_role)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_access_logs_profile ON public.profile_access_logs(accessed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_logs_accessor ON public.profile_access_logs(accessor_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_logs_created ON public.profile_access_logs(created_at DESC);