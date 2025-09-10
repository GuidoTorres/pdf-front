import { useCallback } from 'react';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    fbq: (command: string, ...args: any[]) => void;
    hj: (command: string, ...args: any[]) => void;
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ConversionEvent {
  event_name: string;
  value?: number;
  currency?: string;
  items?: any[];
}

export const useAnalytics = () => {
  // Google Analytics 4 event tracking
  const trackEvent = useCallback(({ action, category, label, value, custom_parameters }: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...custom_parameters
      });
    }
  }, []);

  // Conversion tracking
  const trackConversion = useCallback(({ event_name, value, currency = 'USD', items }: ConversionEvent) => {
    // Google Analytics conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event_name, {
        value: value,
        currency: currency,
        items: items
      });
    }

    // Facebook Pixel conversion
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event_name, {
        value: value,
        currency: currency
      });
    }
  }, []);

  // PDF processing events
  const trackPDFUpload = useCallback((fileSize: number, fileName: string) => {
    trackEvent({
      action: 'pdf_upload',
      category: 'PDF Processing',
      label: fileName,
      value: fileSize,
      custom_parameters: {
        file_name: fileName,
        file_size: fileSize
      }
    });

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
  }, [trackEvent]);

  const trackPDFConversion = useCallback((processingTime: number, pageCount: number) => {
    trackEvent({
      action: 'pdf_conversion_success',
      category: 'PDF Processing',
      label: 'Conversion Completed',
      value: processingTime,
      custom_parameters: {
        processing_time: processingTime,
        page_count: pageCount
      }
    });

    trackConversion({
      event_name: 'purchase',
      value: 0, // Free conversion but track as conversion
      items: [{
        item_id: 'pdf_conversion',
        item_name: 'PDF to Excel Conversion',
        item_category: 'AI Service',
        quantity: 1,
        price: 0
      }]
    });
  }, [trackEvent, trackConversion]);

  const trackPDFError = useCallback((errorType: string, errorMessage: string) => {
    trackEvent({
      action: 'pdf_conversion_error',
      category: 'PDF Processing',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage
      }
    });
  }, [trackEvent]);

  // User engagement events
  const trackSignUp = useCallback((method: string) => {
    trackEvent({
      action: 'sign_up',
      category: 'User Engagement',
      label: method,
      custom_parameters: {
        method: method
      }
    });

    trackConversion({
      event_name: 'sign_up',
      items: [{
        item_id: 'user_registration',
        item_name: 'User Sign Up',
        item_category: 'User Action',
        quantity: 1
      }]
    });

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration');
    }
  }, [trackEvent, trackConversion]);

  const trackLogin = useCallback((method: string) => {
    trackEvent({
      action: 'login',
      category: 'User Engagement',
      label: method,
      custom_parameters: {
        method: method
      }
    });
  }, [trackEvent]);

  const trackSubscriptionUpgrade = useCallback=(plan: string, value: number) => {
    trackEvent({
      action: 'subscription_upgrade',
      category: 'Revenue',
      label: plan,
      value: value,
      custom_parameters: {
        plan_name: plan,
        plan_value: value
      }
    });

    trackConversion({
      event_name: 'purchase',
      value: value,
      items: [{
        item_id: plan.toLowerCase(),
        item_name: `${plan} Plan`,
        item_category: 'Subscription',
        quantity: 1,
        price: value
      }]
    });

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: value,
        currency: 'USD'
      });
    }
  }, [trackEvent, trackConversion]);

  // Page view tracking
  const trackPageView = useCallback((page_title: string, page_location: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page_title,
        page_location: page_location
      });
    }
  }, []);

  // User behavior with Hotjar
  const trackUserBehavior = useCallback((action: string, data?: any) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('identify', action, data);
    }
  }, []);

  return {
    trackEvent,
    trackConversion,
    trackPDFUpload,
    trackPDFConversion,
    trackPDFError,
    trackSignUp,
    trackLogin,
    trackSubscriptionUpgrade,
    trackPageView,
    trackUserBehavior
  };
};

// SEO and Analytics utility functions
export const initializeAnalytics = () => {
  // Enhanced ecommerce tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: {
        'custom_parameter_1': 'pdf_processing_time',
        'custom_parameter_2': 'conversion_success_rate',
        'custom_parameter_3': 'user_plan_type'
      }
    });
  }
};

// Performance tracking
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        if (window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: 'page_load',
            value: pageLoadTime
          });
        }
      }, 0);
    });
  }
};