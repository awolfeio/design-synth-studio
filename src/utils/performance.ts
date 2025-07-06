// Simple performance monitoring utility
export const performanceMonitor = {
  // Mark the start of page load
  markPageStart: (pageName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${pageName}-start`);
    }
  },

  // Mark the end of page load and measure duration
  markPageEnd: (pageName: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${pageName}-end`);
      performance.measure(
        `${pageName}-load-time`,
        `${pageName}-start`,
        `${pageName}-end`
      );
      
      // Log the measurement for debugging
      const measure = performance.getEntriesByName(`${pageName}-load-time`)[0];
      if (measure) {
        console.log(`📊 ${pageName} load time: ${measure.duration.toFixed(2)}ms`);
      }
    }
  },

  // Get core web vitals
  getCoreWebVitals: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        // First Contentful Paint
        fcp: navigation.loadEventEnd - navigation.fetchStart,
        // Largest Contentful Paint (approximation)
        lcp: navigation.loadEventEnd - navigation.fetchStart,
        // Time to Interactive (approximation)
        tti: navigation.domInteractive - navigation.fetchStart,
        // First Input Delay (can't measure without user interaction)
        fid: null
      };
    }
    return null;
  },

  // Log bundle size information
  logBundleInfo: () => {
    if (typeof window !== 'undefined') {
      // Estimate bundle size based on script tags
      const scripts = document.querySelectorAll('script[src]');
      console.log(`📦 Loaded ${scripts.length} script files`);
      
      // Log performance entries
      const resources = performance.getEntriesByType('resource');
      const jsFiles = resources.filter(r => r.name.includes('.js'));
      const cssFiles = resources.filter(r => r.name.includes('.css'));
      
      console.log(`📊 Performance summary:
        - JS files: ${jsFiles.length}
        - CSS files: ${cssFiles.length}
        - Total resources: ${resources.length}`);
    }
  }
};

// Auto-log performance metrics in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logBundleInfo();
      const vitals = performanceMonitor.getCoreWebVitals();
      if (vitals) {
        console.log('📊 Core Web Vitals:', vitals);
      }
    }, 1000);
  });
} 