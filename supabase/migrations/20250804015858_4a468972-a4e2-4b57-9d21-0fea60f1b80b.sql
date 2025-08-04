-- Add comprehensive profile fields for KYC compliance and payment accounts
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employer TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS annual_income_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS source_of_funds TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trading_experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identification_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identification_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identification_expiry DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS airtm_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS airtm_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wise_account_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wise_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_record public.profiles)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 25; -- Total number of required fields
BEGIN
    -- Basic info (5 fields)
    IF profile_record.name IS NOT NULL AND profile_record.name != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.whatsapp_number IS NOT NULL AND profile_record.whatsapp_number != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.ethereum_wallet IS NOT NULL AND profile_record.ethereum_wallet != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
        completion_score := completion_score + 1;
    END IF;

    -- Address (6 fields)
    IF profile_record.address_line1 IS NOT NULL AND profile_record.address_line1 != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.state_province IS NOT NULL AND profile_record.state_province != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.postal_code IS NOT NULL AND profile_record.postal_code != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.country IS NOT NULL AND profile_record.country != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.date_of_birth IS NOT NULL THEN
        completion_score := completion_score + 1;
    END IF;

    -- KYC info (8 fields)
    IF profile_record.nationality IS NOT NULL AND profile_record.nationality != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.occupation IS NOT NULL AND profile_record.occupation != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.employer IS NOT NULL AND profile_record.employer != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.annual_income_range IS NOT NULL AND profile_record.annual_income_range != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.source_of_funds IS NOT NULL AND profile_record.source_of_funds != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.trading_experience IS NOT NULL AND profile_record.trading_experience != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.identification_type IS NOT NULL AND profile_record.identification_type != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.identification_number IS NOT NULL AND profile_record.identification_number != '' THEN
        completion_score := completion_score + 1;
    END IF;

    -- Payment accounts (6 fields)
    IF profile_record.stripe_customer_id IS NOT NULL AND profile_record.stripe_customer_id != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.stripe_account_id IS NOT NULL AND profile_record.stripe_account_id != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.airtm_email IS NOT NULL AND profile_record.airtm_email != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.airtm_username IS NOT NULL AND profile_record.airtm_username != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.wise_account_id IS NOT NULL AND profile_record.wise_account_id != '' THEN
        completion_score := completion_score + 1;
    END IF;
    IF profile_record.wise_email IS NOT NULL AND profile_record.wise_email != '' THEN
        completion_score := completion_score + 1;
    END IF;

    RETURN (completion_score * 100) / total_fields;
END;
$$;

-- Create trigger to automatically update profile completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.profile_completion_percentage := public.calculate_profile_completion(NEW);
    
    -- Mark profile as completed if 100%
    IF NEW.profile_completion_percentage = 100 AND OLD.profile_completion_percentage < 100 THEN
        NEW.profile_completed_at := now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profile_completion();

-- Update existing profiles to calculate completion percentage
UPDATE public.profiles SET updated_at = now();

-- Create RLS policies for the new fields (users can still only update their own profile)
-- Existing policies already cover these new fields since they apply to the entire table