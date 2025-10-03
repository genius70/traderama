-- Fix Email Marketing Lists Security Issue
-- Enable RLS and create policies to prevent unauthorized access

-- 1. Enable RLS on saved_email_lists table
ALTER TABLE public.saved_email_lists ENABLE ROW LEVEL SECURITY;

-- 2. Create a secure function to check if user is admin
-- This uses SECURITY DEFINER to bypass RLS and prevent recursive issues
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id
    AND profiles.role IN ('admin', 'super_admin')
  )
$$;

-- 3. Create RLS policies for saved_email_lists

-- Allow users to view their own email lists
CREATE POLICY "Users can view their own email lists"
ON public.saved_email_lists
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

-- Allow users to create email lists (they must be the creator)
CREATE POLICY "Users can create their own email lists"
ON public.saved_email_lists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own email lists
CREATE POLICY "Users can update their own email lists"
ON public.saved_email_lists
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Allow users to delete their own email lists
CREATE POLICY "Users can delete their own email lists"
ON public.saved_email_lists
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Allow admins to view all email lists
CREATE POLICY "Admins can view all email lists"
ON public.saved_email_lists
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to manage all email lists
CREATE POLICY "Admins can manage all email lists"
ON public.saved_email_lists
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));