-- Create email campaigns tracking table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email tracking table for individual email events
CREATE TABLE IF NOT EXISTS public.email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  open_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  tracking_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sender ON public.email_campaigns(sender_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign ON public.email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_user ON public.email_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_token ON public.email_tracking(tracking_token);

-- RLS policies for email_campaigns
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage campaigns"
  ON public.email_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- RLS policies for email_tracking
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view tracking"
  ON public.email_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Anyone can update tracking via token"
  ON public.email_tracking
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.email_campaigns
  SET
    sent_count = (SELECT COUNT(*) FROM public.email_tracking WHERE campaign_id = NEW.campaign_id AND status = 'sent'),
    opened_count = (SELECT COUNT(DISTINCT user_id) FROM public.email_tracking WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
    clicked_count = (SELECT COUNT(DISTINCT user_id) FROM public.email_tracking WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL),
    bounced_count = (SELECT COUNT(*) FROM public.email_tracking WHERE campaign_id = NEW.campaign_id AND bounced_at IS NOT NULL),
    failed_count = (SELECT COUNT(*) FROM public.email_tracking WHERE campaign_id = NEW.campaign_id AND status = 'failed'),
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update campaign stats
CREATE TRIGGER trigger_update_campaign_stats
  AFTER INSERT OR UPDATE ON public.email_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();