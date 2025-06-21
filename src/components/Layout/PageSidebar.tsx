import React from 'react';

export const PageSidebar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-80 bg-white flex flex-col overflow-hidden rounded-2xl fixed top-3 right-3 bottom-3" style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.08), 0 0 16px rgba(0, 0, 0, 0.06), 0 0 24px rgba(0, 0, 0, 0.04)' }}>
      <div className="px-5 py-4 font-medium text-sidebar-foreground border-b border-sidebar-border">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900 }}>
          Page Settings
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-5 py-2">
        {children}
      </div>
    </div>
  );
}; 