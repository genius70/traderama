
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Generate unique session ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get device info
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = 'desktop';
  let browserType = 'unknown';

  // Device detection
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // Browser detection
  if (userAgent.includes('Chrome')) browserType = 'chrome';
  else if (userAgent.includes('Firefox')) browserType = 'firefox';
  else if (userAgent.includes('Safari')) browserType = 'safari';
  else if (userAgent.includes('Edge')) browserType = 'edge';

  return { deviceType, browserType };
};

export const useAnalytics = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string>();
  const pageStartTimeRef = useRef<number>();
  const lastPagePathRef = useRef<string>();

  // Initialize session
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateSessionId();
    }

    if (user && sessionIdRef.current) {
      const { deviceType, browserType } = getDeviceInfo();
      
      // Start user session
      supabase.from('user_sessions').insert({
        user_id: user.id,
        session_id: sessionIdRef.current,
        ip_address: null, // Will be handled server-side if needed
        user_agent: navigator.userAgent,
        device_type: deviceType,
        browser_type: browserType
      }).then(({ error }) => {
        if (error) console.warn('Failed to start session:', error);
      });

      // End session on page unload
      const handleBeforeUnload = () => {
        if (sessionIdRef.current) {
          // Use fetch instead of navigator.sendBeacon with full URL
          fetch('/rest/v1/rpc/end_user_session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ p_session_id: sessionIdRef.current }),
            keepalive: true
          }).catch(() => {
            // Fallback - try to update session directly
            supabase.rpc('end_user_session', { p_session_id: sessionIdRef.current });
          });
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [user]);

  // Track page views
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!user || !sessionIdRef.current) return;

    // End previous page tracking
    if (lastPagePathRef.current && pageStartTimeRef.current) {
      const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      supabase.from('page_views')
        .update({ duration_seconds: duration })
        .eq('user_id', user.id)
        .eq('page_path', lastPagePathRef.current)
        .eq('session_id', sessionIdRef.current)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    // Start new page tracking
    const { deviceType, browserType } = getDeviceInfo();
    pageStartTimeRef.current = Date.now();
    lastPagePathRef.current = path;

    supabase.from('page_views').insert({
      user_id: user.id,
      page_path: path,
      page_title: title || document.title,
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer_url: document.referrer || null,
      device_type: deviceType,
      browser_type: browserType
    }).then(({ error }) => {
      if (error) console.warn('Failed to track page view:', error);
    });
  }, [user]);

  // Track user engagement
  const trackEngagement = useCallback((actionType: string, elementId?: string, elementType?: string, metadata?: any) => {
    if (!user || !sessionIdRef.current) return;

    supabase.from('user_engagement').insert({
      user_id: user.id,
      session_id: sessionIdRef.current,
      action_type: actionType,
      element_id: elementId || null,
      element_type: elementType || null,
      page_path: window.location.pathname,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).then(({ error }) => {
      if (error) console.warn('Failed to track engagement:', error);
    });
  }, [user]);

  // Track feature usage
  const trackFeatureUsage = useCallback((featureName: string, timeSpent = 0, success = true) => {
    if (!user) return;

    supabase.rpc('update_feature_usage', {
      p_user_id: user.id,
      p_feature_name: featureName,
      p_time_spent: timeSpent,
      p_success: success
    }).then(({ error }) => {
      if (error) console.warn('Failed to track feature usage:', error);
    });
  }, [user]);

  // Track errors
  const trackError = useCallback((error: Error, errorType = 'javascript') => {
    if (!user) return;

    supabase.from('error_logs').insert({
      user_id: user.id,
      session_id: sessionIdRef.current || null,
      error_type: errorType,
      error_message: error.message,
      error_stack: error.stack || null,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent
    }).then(({ error: insertError }) => {
      if (insertError) console.warn('Failed to track error:', insertError);
    });
  }, [user]);

  // Track user activity with credits
  const trackActivity = useCallback((activityType: string, targetId?: string, creditsAwarded = 0) => {
    if (!user) return;

    const { deviceType, browserType } = getDeviceInfo();

    supabase.from('user_activities').insert({
      user_id: user.id,
      activity_type: activityType,
      target_id: targetId || null,
      credits_awarded: creditsAwarded,
      session_id: sessionIdRef.current || null,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
      device_type: deviceType,
      browser_type: browserType,
      referrer_url: document.referrer || null
    }).then(({ error }) => {
      if (error) console.warn('Failed to track activity:', error);
    });
  }, [user]);

  return {
    trackPageView,
    trackEngagement,
    trackFeatureUsage,
    trackError,
    trackActivity,
    sessionId: sessionIdRef.current
  };
};
