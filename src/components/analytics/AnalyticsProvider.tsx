
import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useErrorTracking } from '@/hooks/useErrorTracking';

interface AnalyticsContextType {
  trackPageView: (path: string, title?: string) => void;
  trackEngagement: (actionType: string, elementId?: string, elementType?: string, metadata?: any) => void;
  trackFeatureUsage: (featureName: string, timeSpent?: number, success?: boolean) => void;
  trackError: (error: Error, errorType?: string) => void;
  trackActivity: (activityType: string, targetId?: string, creditsAwarded?: number) => void;
  sessionId?: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const analytics = useAnalytics();
  
  // Initialize tracking hooks
  usePageTracking();
  useErrorTracking();

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};
