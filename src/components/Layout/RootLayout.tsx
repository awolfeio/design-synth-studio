import React, { useEffect, Suspense, lazy } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { PageSidebar } from './PageSidebar';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';
import { ColorControlProvider } from '@/contexts/ColorControlContext';
import { TypographyControlProvider } from '@/contexts/TypographyControlContext';
import { ContrastCheckProvider } from '@/contexts/ContrastCheckContext';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { useLocation } from 'react-router-dom';

// Lazy load heavy control sidebar components
const ColorControlSidebar = lazy(() => import('../Controls/ColorControlSidebar').then(module => ({ default: module.ColorControlSidebar })));
const TypographyControlSidebar = lazy(() => import('../Controls/TypographyControlSidebar').then(module => ({ default: module.TypographyControlSidebar })));
const TypographyGroupControlSidebar = lazy(() => import('../Controls/TypographyGroupControlSidebar').then(module => ({ default: module.TypographyGroupControlSidebar })));

// Loading component for control sidebars
const ControlSidebarLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

const RootLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeColorControl, controlProps, setActiveColorControl, setControlProps } = useColorControl();
  const { activeTypographyControl, controlProps: typographyControlProps, setActiveTypographyControl, setControlProps: setTypographyControlProps } = useTypographyControl();
  const location = useLocation();

  // Check if the active typography control is a group (paragraph or span)
  const isTypographyGroup = activeTypographyControl === 'paragraph' || activeTypographyControl === 'span';

  // Clear all active controls when navigating to a different page
  useEffect(() => {
    setActiveColorControl(null);
    setControlProps(null);
    setActiveTypographyControl(null);
    setTypographyControlProps(null);
  }, [location.pathname, setActiveColorControl, setControlProps, setActiveTypographyControl, setTypographyControlProps]);

  // Determine if we should show the right sidebar
  const showRightSidebar = location.pathname !== '/' && location.pathname !== '/icons';
  const isIconsPage = location.pathname === '/icons';

  return (
    <div className="min-h-screen">
      <LeftSidebar />
      {!isIconsPage && (
        <PageSidebar>
          <Suspense fallback={<ControlSidebarLoader />}>
            {activeColorControl && controlProps && (
              <ColorControlSidebar {...controlProps} />
            )}
            {activeTypographyControl && !isTypographyGroup && typographyControlProps && (
              <TypographyControlSidebar {...typographyControlProps} />
            )}
            {activeTypographyControl && isTypographyGroup && (
              <TypographyGroupControlSidebar 
                groupName={activeTypographyControl} 
                label={activeTypographyControl === 'paragraph' ? 'Paragraph Typography' : 'Span Typography'} 
              />
            )}
          </Suspense>
        </PageSidebar>
      )}
      <main className="flex-1" style={{ 
        marginLeft: '292px', 
        marginRight: isIconsPage ? '0px' : (showRightSidebar ? '372px' : '12px')
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
