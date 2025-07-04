import { cva } from "class-variance-authority";

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

// Button variants for consistent styling
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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