// src/constants.ts
// Central constants file to resolve Fast Refresh warnings

import { type VariantProps, cva } from "class-variance-authority";

// =============================================================================
// BADGE VARIANTS
// =============================================================================
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// =============================================================================
// BUTTON VARIANTS
// =============================================================================
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// =============================================================================
// FORM CONSTANTS
// =============================================================================
export const FORM_MESSAGE_ID = "form-message";

export const FORM_ITEM_CONTEXT = "FormItemContext";
export const FORM_FIELD_CONTEXT = "FormFieldContext";

export const FORM_CLASSES = {
  ITEM: "space-y-2",
  LABEL: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  CONTROL: "",
  DESCRIPTION: "text-sm text-muted-foreground",
  MESSAGE: "text-sm font-medium text-destructive",
} as const;

export type FormClass = typeof FORM_CLASSES[keyof typeof FORM_CLASSES];

// =============================================================================
// NAVIGATION MENU CONSTANTS
// =============================================================================
export const NAVIGATION_MENU_TRIGGER_CLASS = "NavigationMenuTrigger";

// =============================================================================
// SIDEBAR CONSTANTS
// =============================================================================
export const SIDEBAR_COOKIE_NAME = "sidebar:state";
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "3rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export const SIDEBAR_VARIANTS = {
  SIDEBAR: "sidebar",
  FLOATING: "floating",
  INSET: "inset",
} as const;

export const SIDEBAR_SIDES = {
  LEFT: "left",
  RIGHT: "right",
} as const;

export const SIDEBAR_CONTEXT_NAME = "SidebarContext";

export type SidebarVariant = typeof SIDEBAR_VARIANTS[keyof typeof SIDEBAR_VARIANTS];
export type SidebarSide = typeof SIDEBAR_SIDES[keyof typeof SIDEBAR_SIDES];

// =============================================================================
// SONNER TOAST VARIANTS
// =============================================================================
export const toasterVariants = cva(
  "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  {
    variants: {
      variant: {
        default: "group-[.toaster]:bg-background group-[.toaster]:text-foreground",
        destructive:
          "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type ToasterVariants = VariantProps<typeof toasterVariants>;

// =============================================================================
// TOGGLE VARIANTS
// =============================================================================
export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;

// =============================================================================
// ANALYTICS CONSTANTS
// =============================================================================
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_INTERACTION: 'user_interaction',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export const ANALYTICS_CONTEXT_NAME = "AnalyticsContext";

export const ANALYTICS_PROVIDERS = {
  GOOGLE_ANALYTICS: 'google_analytics',
  MIXPANEL: 'mixpanel',
  AMPLITUDE: 'amplitude',
  CUSTOM: 'custom',
} as const;

export type AnalyticsProvider = typeof ANALYTICS_PROVIDERS[keyof typeof ANALYTICS_PROVIDERS];

// =============================================================================
// AUTH CONSTANTS
// =============================================================================
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VERIFY: '/auth/verify',
} as const;

export type AuthStorageKey = typeof AUTH_STORAGE_KEYS[keyof typeof AUTH_STORAGE_KEYS];
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];

// =============================================================================
// AUTH CONTEXT/PROVIDER CONSTANTS
// =============================================================================
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

export const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
} as const;

export const AUTH_CONTEXT_NAME = "AuthContext";

export type AuthError = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS];
export type AuthState = typeof AUTH_STATES[keyof typeof AUTH_STATES];

// =============================================================================
// COMMON UI CONSTANTS
// =============================================================================
export const COMMON_CLASSES = {
  CONTAINER: "container mx-auto",
  FLEX_CENTER: "flex items-center justify-center",
  FLEX_BETWEEN: "flex items-center justify-between",
  GRID_RESPONSIVE: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  TEXT_MUTED: "text-muted-foreground",
  TEXT_ERROR: "text-destructive",
  TEXT_SUCCESS: "text-green-600",
  BUTTON_FULL: "w-full",
  BUTTON_LOADING: "opacity-50 cursor-not-allowed",
} as const;

export type CommonClass = typeof COMMON_CLASSES[keyof typeof COMMON_CLASSES];

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_FORMAT: 'Invalid format',
  TOO_LONG: 'Input is too long',
  TOO_SHORT: 'Input is too short',
} as const;

export type ValidationMessage = typeof VALIDATION_MESSAGES[keyof typeof VALIDATION_MESSAGES];

// =============================================================================
// API CONSTANTS
// =============================================================================
export const API_ENDPOINTS = {
  USERS: '/api/users',
  TRADES: '/api/trades',
  ANALYTICS: '/api/analytics',
  WALLETS: '/api/wallets',
  SETTINGS: '/api/settings',
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export type HttpStatusCode = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];