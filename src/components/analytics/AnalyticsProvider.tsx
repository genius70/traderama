
import React, { createContext, useContext, ReactNode } from 'react';

// Define proper types for analytics services
interface GTAGFunction {
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, parameters?: Record<string, unknown>): void;
}

interface MixpanelInstance {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
}

interface AmplitudeInstance {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  setUserId: (userId: string) => void;
}

// Extend Window interface with analytics properties
declare global {
  interface Window {
    gtag?: GTAGFunction;
    mixpanel?: MixpanelInstance;
    amplitude?: AmplitudeInstance;
  }
}

const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction', 
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error'
} as const;

type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent, properties?: Record<string, unknown>) => void;
  trackPageView: (page: string, properties?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const trackEvent = (event: AnalyticsEvent, properties: Record<string, unknown> = {}) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event, properties);
    }

    // Amplitude
    if (typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.track(event, properties);
    }

    // Console log for development
    console.log('Analytics Event:', event, properties);
  };

  const trackPageView = (page: string, properties: Record<string, unknown> = {}) => {
    const pageViewProperties = {
      page_path: page,
      ...properties
    };

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', ANALYTICS_EVENTS.PAGE_VIEW, pageViewProperties);
    }

    // Mixpanel
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(ANALYTICS_EVENTS.PAGE_VIEW, pageViewProperties);
    }

    // Amplitude
    if (typeof window !== 'undefined' && window.amplitude) {
      window.amplitude.track(ANALYTICS_EVENTS.PAGE_VIEW, pageViewProperties);
    }

    console.log('Page View:', page, pageViewProperties);
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export { ANALYTICS_EVENTS };
export default AnalyticsProvider;
