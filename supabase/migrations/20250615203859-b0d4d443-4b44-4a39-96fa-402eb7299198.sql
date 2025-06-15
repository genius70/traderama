
-- Create a table to store per-user IG Broker connections
CREATE TABLE public.ig_broker_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  account_id TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Each user can have only one IG connection
);

-- Enable Row Level Security
ALTER TABLE public.ig_broker_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to their own connections
CREATE POLICY "Users can view their own IG connections" 
ON public.ig_broker_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own IG connections" 
ON public.ig_broker_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own IG connections" 
ON public.ig_broker_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own IG connections" 
ON public.ig_broker_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ig_broker_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at field
CREATE TRIGGER update_ig_broker_connections_updated_at
  BEFORE UPDATE ON public.ig_broker_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ig_broker_connections_updated_at();
