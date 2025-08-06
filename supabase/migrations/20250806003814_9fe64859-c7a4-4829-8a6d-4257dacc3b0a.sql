-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE;

-- Create function to generate referral code from username and birth year
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_username text, p_date_of_birth date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  birth_year text;
  referral_code text;
BEGIN
  -- Extract last 4 digits of birth year
  birth_year := EXTRACT(YEAR FROM p_date_of_birth)::text;
  
  -- Concatenate username with birth year
  referral_code := p_username || birth_year;
  
  RETURN referral_code;
END;
$$;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to auto-update referral code when username or date_of_birth changes
CREATE OR REPLACE FUNCTION public.update_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only update if username and date_of_birth are both present
  IF NEW.username IS NOT NULL AND NEW.date_of_birth IS NOT NULL THEN
    NEW.referral_code := generate_referral_code(NEW.username, NEW.date_of_birth);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update referral code
CREATE TRIGGER trigger_update_referral_code
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_referral_code();