
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error'
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Global type definitions for analytics services
export interface GTAGFunction {
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, parameters?: Record<string, unknown>): void;
}

export interface MixpanelInstance {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
}

export interface AmplitudeInstance {
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  setUserId: (userId: string) => void;
}

declare global {
  interface Window {
    gtag?: GTAGFunction;
    mixpanel?: MixpanelInstance;
    amplitude?: AmplitudeInstance;
  }
}
