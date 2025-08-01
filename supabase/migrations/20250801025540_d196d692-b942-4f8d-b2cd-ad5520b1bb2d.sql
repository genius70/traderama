-- Add is_premium column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;

-- Create messages table for contact management
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  super_admin_id uuid,
  user_ids uuid[] NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  delivery_method text NOT NULL,
  status text NOT NULL,
  sent_at timestamp with time zone,
  error text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  super_admin_id uuid,
  user_ids uuid[] NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  delivery_method text NOT NULL,
  status text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "super_admin_access_messages" ON public.messages
FOR ALL USING (
  auth.email() = 'royan.shaw@gmail.com' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "super_admin_access_scheduled" ON public.scheduled_messages  
FOR ALL USING (
  auth.email() = 'royan.shaw@gmail.com' AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Create triggers for updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_scheduled_messages_updated_at
  BEFORE UPDATE ON public.scheduled_messages  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();