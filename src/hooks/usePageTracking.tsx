
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

export const usePageTracking = () => {
  const location = useLocation();
  const { trackPageView, trackEngagement } = useAnalytics();

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname);

    // Track scroll events
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollPercent > 0) {
          trackEngagement('scroll', undefined, undefined, { scrollPercent });
        }
      }, 1000);
    };

    // Track clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || 'unknown';
      const elementType = target.tagName.toLowerCase();
      
      trackEngagement('click', elementId, elementType, {
        text: target.textContent?.substring(0, 100) || undefined,
        href: target.getAttribute('href') || undefined
      });
    };

    // Track form submissions
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';
      
      trackEngagement('form_submit', formId, 'form');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
    };
  }, [location.pathname, trackPageView, trackEngagement]);
};
