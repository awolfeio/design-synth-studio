
import React from 'react';
import { LeftSidebar } from './LeftSidebar';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DesignSystemProvider>
      <div className="flex min-h-screen">
        <LeftSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </DesignSystemProvider>
  );
};

export default RootLayout;
