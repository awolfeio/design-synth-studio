
import React from 'react';
import { TopBar } from '@/components/Layout/TopBar';
import { RightSidebar } from '@/components/Layout/RightSidebar';
import { Canvas } from '@/components/Layout/Canvas';
import { BottomBar } from '@/components/Layout/BottomBar';
import { TokenViewer } from '@/components/TokenViewer/TokenViewer';

const Preview: React.FC = () => {
  const [isTokenViewerOpen, setIsTokenViewerOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
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

export default Preview;
