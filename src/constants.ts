
// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Analytics Providers
export const ANALYTICS_PROVIDERS = {
  GOOGLE_ANALYTICS: 'google_analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',
  CUSTOM: 'custom',
} as const;

export type AnalyticsProvider = typeof ANALYTICS_PROVIDERS[keyof typeof ANALYTICS_PROVIDERS];

// Toaster variants for Sonner
export const toasterVariants = () => {
  return "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg";
};
