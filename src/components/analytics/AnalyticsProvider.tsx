
import React, { createContext, useContext, ReactNode } from 'react';
import { ANALYTICS_EVENTS, type AnalyticsEvent } from '@/constants';

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent, properties?: Record<string, unknown>) => void;
  trackPageView: (page: string, properties?: Record<string, unknown>) => void;
  trackFeatureUsage: (featureName: string, timeSpent?: number, success?: boolean) => void;
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

  const trackFeatureUsage = (featureName: string, timeSpent: number = 0, success: boolean = true) => {
    trackEvent(ANALYTICS_EVENTS.FEATURE_USAGE, {
      feature_name: featureName,
      time_spent: timeSpent,
      success
    });
  };

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackFeatureUsage
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
