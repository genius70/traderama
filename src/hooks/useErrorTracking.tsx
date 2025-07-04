import React, { createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ErrorContext {
  componentStack?: string;
  [key: string]: any;
}

interface ErrorTrackingContextType {
  trackError: (error: Error, context?: ErrorContext) => Promise<void>;
}

interface ErrorTrackingProviderProps {
  children: React.ReactNode;
}

const ErrorTrackingContext = createContext<ErrorTrackingContextType | undefined>(undefined);

export const ErrorTrackingProvider: React.FC<ErrorTrackingProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const trackError = useCallback(async (error: Error, context?: ErrorContext) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        user_id: user?.id,
        context: context ? JSON.stringify(context) : null,
        timestamp: new Date().toISOString(),
      };

      await supabase.from('error_logs').insert([errorData]);
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }, [user]);

  const value: ErrorTrackingContextType = {
    trackError,
  };

  return (
    <ErrorTrackingContext.Provider value={value}>
      {children}
    </ErrorTrackingContext.Provider>
  );
};

export const useErrorTracking = (): ErrorTrackingContextType => {
  const context = useContext(ErrorTrackingContext);
  if (!context) {
    throw new Error('useErrorTracking must be used within an ErrorTrackingProvider');
  }
  return context;
};
