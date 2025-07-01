
import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';

export const useErrorTracking = () => {
  const { trackError } = useAnalytics();

  useEffect(() => {
    // Track JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
      trackError(error, 'javascript');
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      trackError(error, 'promise_rejection');
    };

    // Track React errors (if using error boundary)
    const handleReactError = (error: Error, errorInfo: any) => {
      trackError(error, 'react');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Global error handler for React (optional)
    (window as any).__REACT_ERROR_HANDLER__ = handleReactError;

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      delete (window as any).__REACT_ERROR_HANDLER__;
    };
  }, [trackError]);
};
