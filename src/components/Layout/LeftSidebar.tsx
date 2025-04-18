
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Palette, Type, Ruler, Radius, ArrowRightLeft } from 'lucide-react';

type NavigationSection = 'colors' | 'typography' | 'spacing' | 'radius' | 'aliases';

interface NavigationItem {
  id: NavigationSection;
  icon: React.ReactNode;
  label: string;
}

export const LeftSidebar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavigationSection>('colors');

  const navigationItems: NavigationItem[] = [
    { id: 'colors', icon: <Palette className="h-5 w-5" />, label: 'Color System' },
    { id: 'typography', icon: <Type className="h-5 w-5" />, label: 'Typography' },
    { id: 'spacing', icon: <Ruler className="h-5 w-5" />, label: 'Spacing Scale' },
    { id: 'radius', icon: <Radius className="h-5 w-5" />, label: 'Border Radius' },
    { id: 'aliases', icon: <ArrowRightLeft className="h-5 w-5" />, label: 'Alias Tokens' },
  ];

  return (
    <div className="w-60 border-r border-border bg-sidebar flex flex-col overflow-hidden">
      <div className="p-4 font-medium text-sidebar-foreground border-b border-sidebar-border">
        Foundation Setup
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            size="lg"
            className={`w-full justify-start mb-1 ${
              activeSection === item.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
            }`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};
