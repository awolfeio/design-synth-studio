import React from 'react';
import { useLocation } from 'react-router-dom';
import { useColorControl } from '@/contexts/ColorControlContext';

export const PageSidebar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { activeColorControl } = useColorControl();
  
  // Get the page title based on the current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/colors':
        return 'Color System';
      case '/typography':
        return 'Typography System';
      case '/spacing':
        return 'Spacing System';
      case '/radius':
        return 'Radius System';
      case '/shadow':
        return 'Shadow System';
      case '/icons':
        return 'Icon System';
      case '/aliases':
        return 'Alias Tokens';
      case '/preview':
        return 'Preview Settings';
      default:
        return 'Page Settings';
    }
  };
  
  // Hide sidebar on overview page
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <div className="w-80 bg-white flex flex-col overflow-hidden rounded-2xl fixed top-3 right-3 bottom-3" style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.08), 0 0 16px rgba(0, 0, 0, 0.06), 0 0 24px rgba(0, 0, 0, 0.04)' }}>
      <div className="px-5 py-4 font-medium text-sidebar-foreground border-b border-sidebar-border">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900 }}>
          {getPageTitle()}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {/* Show default message when on Colors page with no color selected */}
        {location.pathname === '/colors' && !activeColorControl ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Select a color to configure</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}; 