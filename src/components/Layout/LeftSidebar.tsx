import React from 'react';
import { Button } from '../ui/button';
import { Palette, Type, Ruler, Radius, ArrowRightLeft, Eye, Layout, Box, Grid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

type NavigationSection = 'overview' | 'colors' | 'typography' | 'spacing' | 'radius' | 'aliases' | 'preview' | 'shadow' | 'icons';

interface NavigationItem {
  id: NavigationSection;
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems: NavigationItem[] = [
    { id: 'overview', icon: <Layout className="h-5 w-5" />, label: 'Overview', path: '/' },
    { id: 'colors', icon: <Palette className="h-5 w-5" />, label: 'Color System', path: '/colors' },
    { id: 'typography', icon: <Type className="h-5 w-5" />, label: 'Typography', path: '/typography' },
    { id: 'spacing', icon: <Ruler className="h-5 w-5" />, label: 'Spacing Scale', path: '/spacing' },
    { id: 'radius', icon: <Radius className="h-5 w-5" />, label: 'Border Radius', path: '/radius' },
    { id: 'shadow', icon: <Box className="h-5 w-5" />, label: 'Shadow', path: '/shadow' },
    { id: 'icons', icon: <Grid className="h-5 w-5" />, label: 'Icons', path: '/icons' },
    { id: 'aliases', icon: <ArrowRightLeft className="h-5 w-5" />, label: 'Alias Tokens', path: '/aliases' },
    { id: 'preview', icon: <Eye className="h-5 w-5" />, label: 'Preview', path: '/preview' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-60 bg-white flex flex-col overflow-hidden rounded-2xl fixed top-3 left-3 bottom-3" style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.08), 0 0 16px rgba(0, 0, 0, 0.06), 0 0 24px rgba(0, 0, 0, 0.04)' }}>
      <div className="p-4 font-medium text-sidebar-foreground border-b border-sidebar-border">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900 }}>
          Design Synth Studio
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPath === item.path ? 'secondary' : 'ghost'}
            size="lg"
            className={`w-full justify-start mb-1 ${
              currentPath === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
            }`}
            style={{ padding: '1rem' }}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};
