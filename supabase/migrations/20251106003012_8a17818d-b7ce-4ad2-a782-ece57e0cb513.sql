-- Drop existing policy before recreating
DROP POLICY IF EXISTS "Only admins can view profile access logs" ON public.profile_access_logs;

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