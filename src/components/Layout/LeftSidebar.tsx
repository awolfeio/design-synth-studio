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

// Custom Color System Icon Component
const ColorSystemIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="M7.25 3.75C7.25 3.198 6.802 2.75 6.25 2.75H3.75C3.198 2.75 2.75 3.198 2.75 3.75V13"></path>
    <path d="M13.132 8.04999C13.523 7.65899 13.523 7.02599 13.132 6.63599L11.364 4.86802C10.973 4.47702 10.34 4.47702 9.95001 4.86802L3.409 11.409"></path>
    <path d="M2.75 13C2.75 11.758 3.758 10.75 5 10.75H14.25C14.802 10.75 15.25 11.198 15.25 11.75V14.25C15.25 14.802 14.802 15.25 14.25 15.25H5C3.758 15.25 2.75 14.242 2.75 13Z"></path>
    <path d="M7.25 10.75V15.25"></path>
    <path d="M11.25 10.75V15.25"></path>
  </svg>
);

// Custom Shadow Icon Component
const ShadowIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="m14.8439,12.5303c-1.0912,1.4946-2.8516,2.4697-4.8439,2.4697s-3.7527-.975-4.8439-2.4697c-1.685.4144-3.1561,1.1508-3.1561,2.4697,0,2.916,7.1812,3,8,3s8-.084,8-3c0-1.3189-1.4711-2.0552-3.1561-2.4697Z" fill="currentColor" stroke="none"></path>
    <circle cx="10" cy="9" r="6" fill="none" stroke="currentColor"></circle>
  </svg>
);

// Custom Icons Icon Component
const IconsIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="M4.445,15.227l5.64-5.641c.781-.781,2.047-.781,2.828,0l2.336,2.336"></path>
    <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2" ry="2"></rect>
    <path
      d="M9.158,6.508l-1.263-.421-.421-1.263c-.137-.408-.812-.408-.949,0l-.421,1.263-1.263,.421c-.204,.068-.342,.259-.342,.474s.138,.406,.342,.474l1.263,.421,.421,1.263c.068,.204,.26,.342,.475,.342s.406-.138,.475-.342l.421-1.263,1.263-.421c.204-.068,.342-.259,.342-.474s-.138-.406-.342-.474Z"
      fill="currentColor" stroke="none"></path>
  </svg>
);

// Custom Spacing Icon Component
const SpacingIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="M3 4v16"></path>
    <path d="M21 4v16"></path>
    <path d="M16 14l2-2 -2-2"></path>
    <path d="M8 14l-2-2 2-2"></path>
    <path d="M6 12h12"></path>
  </svg>
);

// Custom Border Radius Icon Component
const BorderRadiusIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4C4.44772 4 4 4.44772 4 5V9H2V5C2 3.34315 3.34315 2 5 2H9V4H5Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M15 2H19C20.6569 2 22 3.34315 22 5V9H20V5C20 4.44772 19.5523 4 19 4H15V2Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M22 15V19C22 20.6569 20.6569 22 19 22H15V20H19C19.5523 20 20 19.5523 20 19V15H22Z"></path>
    <path fillRule="evenodd" clipRule="evenodd" d="M4 15V19C4 19.5523 4.44772 20 5 20H9V22H5C3.34315 22 2 20.6569 2 19V15H4Z"></path>
  </svg>
);

// Custom Alias Tokens Icon Component
const AliasTokensIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="m8.25,4.75c1.1046,0,2,.8954,2,2v4.5c0,1.1046.8954,2,2,2h3.75"></path>
    <circle cx="3.75" cy="4.75" r="2"></circle>
    <polyline points="13.5 10.5 16.25 13.25 13.5 16"></polyline>
  </svg>
);

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems: NavigationItem[] = [
    { id: 'overview', icon: <Layout className="h-4 w-4" />, label: 'Overview', path: '/' },
    { id: 'colors', icon: <ColorSystemIcon className="h-4 w-4" />, label: 'Color System', path: '/colors' },
    { id: 'typography', icon: <Type className="h-4 w-4" />, label: 'Typography', path: '/typography' },
    { id: 'spacing', icon: <SpacingIcon className="h-4 w-4" />, label: 'Spacing', path: '/spacing' },
    { id: 'radius', icon: <BorderRadiusIcon className="h-4 w-4" />, label: 'Border Radius', path: '/border-radius' },
    { id: 'shadow', icon: <ShadowIcon className="h-4 w-4" />, label: 'Shadow', path: '/shadow' },
    { id: 'icons', icon: <IconsIcon className="h-4 w-4" />, label: 'Icons', path: '/icons' },
    { id: 'aliases', icon: <AliasTokensIcon className="h-4 w-4" />, label: 'Alias Tokens', path: '/aliases' },
    { id: 'preview', icon: <Eye className="h-4 w-4" />, label: 'Preview', path: '/preview' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-60 bg-white flex flex-col overflow-hidden rounded-2xl fixed top-3 left-3 bottom-3" style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.08), 0 0 16px rgba(0, 0, 0, 0.06), 0 0 24px rgba(0, 0, 0, 0.04)' }}>
      <div className="p-4 font-medium text-sidebar-foreground border-b border-sidebar-border">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px' }}>
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
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};
