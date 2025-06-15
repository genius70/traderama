
-- Create airdrop_milestones table
CREATE TABLE public.airdrop_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  kem_bonus NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_milestones table to track user achievements
CREATE TABLE public.user_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.airdrop_milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

-- Enable Row Level Security
ALTER TABLE public.airdrop_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for airdrop_milestones (readable by all authenticated users)
CREATE POLICY "Anyone can view milestones" 
  ON public.airdrop_milestones 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- RLS policies for user_milestones
CREATE POLICY "Users can view their own milestones" 
  ON public.user_milestones 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own milestones" 
  ON public.user_milestones 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Insert some sample milestones
INSERT INTO public.airdrop_milestones (name, kem_bonus) VALUES
  ('First Post', 5),
  ('Community Contributor', 10),
  ('Strategy Creator', 25),
  ('Social Butterfly', 15),
  ('Early Adopter', 50);
