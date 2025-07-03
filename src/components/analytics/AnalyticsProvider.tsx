import React, { createContext, useEffect, useState } from 'react';
import { 
  ANALYTICS_EVENTS, 
  ANALYTICS_PROVIDERS, 
  type AnalyticsEvent,
  type AnalyticsProvider as AnalyticsProviderType
} from '@/constants';

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent, properties?: Record<string, unknown>) => void;
  trackPageView: (page: string) => void;
  setUserId: (userId: string) => void;
  provider: AnalyticsProviderType;
}

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  provider?: AnalyticsProviderType;
  apiKey?: string;
  debug?: boolean;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  provider = ANALYTICS_PROVIDERS.CUSTOM,
  apiKey,
  debug = false
}) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize analytics provider
    if (provider === ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS && apiKey) {
      // Initialize Google Analytics
      if (debug) console.log('Initializing Google Analytics with key:', apiKey);
    } else if (provider === ANALYTICS_PROVIDERS.MIXPANEL && apiKey) {
      // Initialize Mixpanel
      if (debug) console.log('Initializing Mixpanel with key:', apiKey);
    } else if (provider === ANALYTICS_PROVIDERS.AMPLITUDE && apiKey) {
      // Initialize Amplitude
      if (debug) console.log('Initializing Amplitude with key:', apiKey);
    } else {
      // Custom analytics implementation
      if (debug) console.log('Using custom analytics provider');
    }
  }, [provider, apiKey, debug]);

  const trackEvent = (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
    if (debug) {
      console.log('Tracking event:', event, 'with properties:', properties);
    }

    // Implement actual tracking based on provider
    switch (provider) {
      case ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS:
        // Google Analytics tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', event, properties);
        }
        break;
      case ANALYTICS_PROVIDERS.MIXPANEL:
        // Mixpanel tracking
        if (typeof window !== 'undefined' && window.mixpanel) {
          window.mixpanel.track(event, properties);
        }
        break;
      case ANALYTICS_PROVIDERS.AMPLITUDE:
        // Amplitude tracking
        if (typeof window !== 'undefined' && window.amplitude) {
          window.amplitude.track(event, properties);
        }
        break;
      default:
        // Custom tracking - could send to your own API
        if (debug) {
          console.log('Custom tracking:', { event, properties, userId });
        }
    }
  };

  const trackPageView = (page: string) => {
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page });
  };

  const handleSetUserId = (newUserId: string) => {
    setUserId(newUserId);
    
    // Set user ID in analytics provider
    switch (provider) {
      case ANALYTICS_PROVIDERS.GOOGLE_ANALYTICS:
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('config', apiKey, { user_id: newUserId });
        }
        break;
      case ANALYTICS_PROVIDERS.MIXPANEL:
        if (typeof window !== 'undefined' && window.mixpanel) {
          window.mixpanel.identify(newUserId);
        }
        break;
      case ANALYTICS_PROVIDERS.AMPLITUDE:
        if (typeof window !== 'undefined' && window.amplitude) {
          window.amplitude.setUserId(newUserId);
        }
        break;
      default:
        if (debug) {
          console.log('Setting user ID:', newUserId);
        }
    }
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    setUserId: handleSetUserId,
    provider,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;