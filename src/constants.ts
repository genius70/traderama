
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error'
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Toast variants for consistent styling
export const toasterVariants = (props?: { variant?: 'default' | 'destructive' }) => {
  const variant = props?.variant || 'default';
  return variant === 'destructive' 
    ? 'group toast group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive group-[.toaster]:shadow-lg'
    : 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg';
};

// Auth constants
export const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred'
} as const;

export type AuthState = typeof AUTH_STATES[keyof typeof AUTH_STATES];
export type AuthError = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];

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
