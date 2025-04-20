
import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { RightSidebar } from './RightSidebar';
import { Canvas } from './Canvas';
import { BottomBar } from './BottomBar';
import { TokenViewer } from '../TokenViewer/TokenViewer';
import { useDesignSystem } from '@/contexts/DesignSystemContext';

const AppLayout: React.FC = () => {
  const { system } = useDesignSystem();
  const [isTokenViewerOpen, setIsTokenViewerOpen] = useState(false);
  
  return (
    <div className={`min-h-screen flex flex-col ${system.isDark ? 'dark' : ''}`}>
      {/* Top Bar */}
      <TopBar onTokenViewerOpen={() => setIsTokenViewerOpen(true)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas */}
        <Canvas />
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
      
      {/* Bottom Bar */}
      <BottomBar />
      
      {/* Token Viewer Modal */}
      <TokenViewer isOpen={isTokenViewerOpen} onClose={() => setIsTokenViewerOpen(false)} />
    </div>
  );
};

export default AppLayout;
