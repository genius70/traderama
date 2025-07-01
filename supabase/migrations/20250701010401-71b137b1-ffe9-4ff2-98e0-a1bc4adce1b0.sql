
-- Add comprehensive user activity tracking
ALTER TABLE user_activities 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS page_url TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser_type TEXT,
ADD COLUMN IF NOT EXISTS referrer_url TEXT;

-- Create table for page views tracking
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    page_path TEXT NOT NULL,
    page_title TEXT,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duration_seconds INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    device_type TEXT,
    browser_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for user engagement tracking
CREATE TABLE IF NOT EXISTS public.user_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    session_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'click', 'scroll', 'hover', 'form_submit', etc.
    element_id TEXT,
    element_type TEXT,
    page_path TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for feature usage tracking
CREATE TABLE IF NOT EXISTS public.feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    first_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, feature_name)
);

-- Create table for user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    session_id TEXT UNIQUE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    pages_visited INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    browser_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    page_path TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_action_type ON user_engagement(action_type);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- Enable RLS on new tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics tables
CREATE POLICY "Users can view their own page views" ON page_views
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own page views" ON page_views
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own engagement data" ON user_engagement
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own engagement data" ON user_engagement
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own feature usage" ON feature_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert/update their own feature usage" ON feature_usage
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert/update their own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own error logs" ON error_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own error logs" ON error_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin policies for analytics tables
CREATE POLICY "Admins can view all page views" ON page_views
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can view all engagement data" ON user_engagement
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can view all feature usage" ON feature_usage
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Admins can view all error logs" ON error_logs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

-- Update platform_analytics to include more comprehensive metrics
ALTER TABLE platform_analytics 
ADD COLUMN IF NOT EXISTS avg_session_duration NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounce_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS page_views_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_page_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS feature_adoption_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC DEFAULT 0;

-- Create function to update feature usage
CREATE OR REPLACE FUNCTION update_feature_usage(
    p_user_id UUID,
    p_feature_name TEXT,
    p_time_spent INTEGER DEFAULT 0,
    p_success BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO feature_usage (user_id, feature_name, usage_count, total_time_spent, success_rate)
    VALUES (p_user_id, p_feature_name, 1, p_time_spent, CASE WHEN p_success THEN 100.00 ELSE 0.00 END)
    ON CONFLICT (user_id, feature_name)
    DO UPDATE SET
        usage_count = feature_usage.usage_count + 1,
        last_used_at = now(),
        total_time_spent = feature_usage.total_time_spent + p_time_spent,
        success_rate = (
            (feature_usage.success_rate * feature_usage.usage_count) + 
            CASE WHEN p_success THEN 100.00 ELSE 0.00 END
        ) / (feature_usage.usage_count + 1),
        updated_at = now();
END;
$$;

-- Create function to end user session
CREATE OR REPLACE FUNCTION end_user_session(p_session_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE user_sessions 
    SET 
        ended_at = now(),
        duration_seconds = EXTRACT(EPOCH FROM (now() - started_at))::INTEGER,
        pages_visited = (
            SELECT COUNT(DISTINCT page_path) 
            FROM page_views 
            WHERE session_id = p_session_id
        ),
        actions_count = (
            SELECT COUNT(*) 
            FROM user_engagement 
            WHERE session_id = p_session_id
        )
    WHERE session_id = p_session_id AND ended_at IS NULL;
END;
$$;
