import React from 'react';
import { useLocation } from 'react-router-dom';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { Button } from '@/components/ui/button';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { hslaToHex } from '@/lib/colorUtils';
import { Type, Code, FileText } from 'lucide-react';

export const PageSidebar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { activeColorControl, setActiveColorControl } = useColorControl();
  const { activeTypographyControl, setActiveTypographyControl } = useTypographyControl();
  const { system } = useDesignSystem();
  
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

  // Define all available color palettes
  const colorPalettes = [
    { name: 'primary', label: 'Primary Color' },
    { name: 'secondary', label: 'Secondary Color' },
    { name: 'accent', label: 'Accent Color' },
    { name: 'neutrals', label: 'Neutrals' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'destructive', label: 'Destructive' },
    { name: 'border', label: 'Border' }
  ];

  // Define all available typography controls
  const typographyControls = [
    { name: 'base', label: 'Base Typography', icon: FileText },
    { name: 'heading', label: 'Heading Typography', icon: Type },
    { name: 'paragraph', label: 'Paragraph Typography', icon: FileText },
    { name: 'span', label: 'Span Typography', icon: Type },
    { name: 'mono', label: 'Monospace Typography', icon: Code }
  ];

  // Handle color quick select - select color and smooth scroll to it
  const handleColorQuickSelect = (tokenName: string) => {
    // Use the programmatic scroll handler from ColorSystem if available
    const programmaticScrollHandler = (window as unknown as { handleProgrammaticColorScroll?: (tokenName: string) => void }).handleProgrammaticColorScroll;
    
    if (programmaticScrollHandler) {
      programmaticScrollHandler(tokenName);
    } else {
      // Fallback to original behavior if handler not available
      setActiveColorControl(tokenName);
      
      const element = document.querySelector(`[data-color-control="${tokenName}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  };

  // Handle typography quick select - select typography and smooth scroll to it
  const handleTypographyQuickSelect = (tokenName: string) => {
    // Use the programmatic scroll handler from Typography if available
    const programmaticScrollHandler = (window as unknown as { handleProgrammaticTypographyScroll?: (tokenName: string) => void }).handleProgrammaticTypographyScroll;
    
    if (programmaticScrollHandler) {
      programmaticScrollHandler(tokenName);
    } else {
      // Fallback to original behavior if handler not available
      setActiveTypographyControl(tokenName);
      
      const element = document.querySelector(`[data-typography-control="${tokenName}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  };

  // Get color hex for swatch display
  const getColorHex = (tokenName: string) => {
    const color = system.colors[tokenName as keyof typeof system.colors];
    if (!color) return '#000000';
    return hslaToHex(color.hue, color.saturation, color.lightness, color.alpha);
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
        {/* Show quick select buttons when on Colors page with no color selected */}
        {location.pathname === '/colors' && !activeColorControl ? (
          <div className="py-4">
            <div className="text-center text-muted-foreground mb-6">
              <p className="text-sm">Select a color to configure</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Select
              </h4>
              
              <div className="space-y-2">
                {colorPalettes.map(({ name, label }) => (
                  <Button
                    key={name}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                    onClick={() => handleColorQuickSelect(name)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div 
                        className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: getColorHex(name) }}
                      />
                      <span className="text-sm font-medium text-left">{label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : location.pathname === '/typography' && !activeTypographyControl ? (
          /* Show quick select buttons when on Typography page with no typography selected */
          <div className="py-4">
            <div className="text-center text-muted-foreground mb-6">
              <p className="text-sm">Select a typography to configure</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Quick Select
              </h4>
              
              <div className="space-y-2">
                {typographyControls.map(({ name, label, icon: Icon }) => (
                  <Button
                    key={name}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                    onClick={() => handleTypographyQuickSelect(name)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium text-left">{label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}; 