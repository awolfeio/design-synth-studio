import React, { useEffect } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { PageSidebar } from './PageSidebar';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';
import { ColorControlProvider } from '@/contexts/ColorControlContext';
import { TypographyControlProvider } from '@/contexts/TypographyControlContext';
import { ContrastCheckProvider } from '@/contexts/ContrastCheckContext';
import { ColorControlSidebar } from '../Controls/ColorControlSidebar';
import { TypographyControlSidebar } from '../Controls/TypographyControlSidebar';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { useLocation } from 'react-router-dom';

const RootLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeColorControl, controlProps, setActiveColorControl, setControlProps } = useColorControl();
  const { activeTypographyControl, controlProps: typographyControlProps, setActiveTypographyControl, setControlProps: setTypographyControlProps } = useTypographyControl();
  const location = useLocation();

  // Clear all active controls when navigating to a different page
  useEffect(() => {
    setActiveColorControl(null);
    setControlProps(null);
    setActiveTypographyControl(null);
    setTypographyControlProps(null);
  }, [location.pathname, setActiveColorControl, setControlProps, setActiveTypographyControl, setTypographyControlProps]);

  // Determine if we should show the right sidebar
  const showRightSidebar = location.pathname !== '/';

  return (
    <div className="min-h-screen">
      <LeftSidebar />
      <PageSidebar>
        {activeColorControl && controlProps && (
          <ColorControlSidebar {...controlProps} />
        )}
        {activeTypographyControl && typographyControlProps && (
          <TypographyControlSidebar {...typographyControlProps} />
        )}
      </PageSidebar>
      <main className="flex-1" style={{ 
        marginLeft: '292px', 
        marginRight: showRightSidebar ? '372px' : '12px' 
      }}>
        {children}
      </main>
    </div>
  );
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DesignSystemProvider>
      <ContrastCheckProvider>
        <ColorControlProvider>
          <TypographyControlProvider>
            <RootLayoutContent>
              {children}
            </RootLayoutContent>
          </TypographyControlProvider>
        </ColorControlProvider>
      </ContrastCheckProvider>
    </DesignSystemProvider>
  );
};

export default RootLayout;
