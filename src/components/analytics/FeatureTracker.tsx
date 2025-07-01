
import React, { useEffect, useRef } from 'react';
import { useAnalyticsContext } from './AnalyticsProvider';

interface FeatureTrackerProps {
  featureName: string;
  children: React.ReactNode;
  trackOnMount?: boolean;
  trackOnUnmount?: boolean;
}

export const FeatureTracker: React.FC<FeatureTrackerProps> = ({
  featureName,
  children,
  trackOnMount = true,
  trackOnUnmount = false
}) => {
  const { trackFeatureUsage } = useAnalyticsContext();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (trackOnMount) {
      startTimeRef.current = Date.now();
      trackFeatureUsage(featureName, 0, true);
    }

    return () => {
      if (trackOnUnmount && startTimeRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackFeatureUsage(`${featureName}_session`, timeSpent, true);
      }
    };
  }, [featureName, trackOnMount, trackOnUnmount, trackFeatureUsage]);

  return <>{children}</>;
};
