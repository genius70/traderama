
export const FORM_CLASSES = {
  label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  button: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
};

export const navigationMenuTriggerStyle = () =>
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

export const toasterVariants = () =>
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full";

// Analytics constants
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  FEATURE_USAGE: 'feature_usage',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  ERROR: 'error',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  STRATEGY_CREATE: 'strategy_create',
  STRATEGY_SUBSCRIBE: 'strategy_subscribe',
  TRADE_EXECUTE: 'trade_execute',
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Global window interface extensions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
    amplitude?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}
