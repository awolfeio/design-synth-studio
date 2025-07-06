import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Type } from 'lucide-react';

// Custom icon components using our custom SVGs
const ColorSystemIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C10.5523 2 11 2.44772 11 3V4.1C11 4.59695 11.4477 5 12 5C12.5523 5 13 4.55228 13 4V3C13 1.34315 11.6569 0 10 0C8.34315 0 7 1.34315 7 3V4C7 4.55228 7.44772 5 8 5C8.55228 5 9 4.59695 9 4.1V3C9 2.44772 9.44772 2 10 2Z" fill="currentColor"/>
    <path d="M3 10C3 9.44772 3.44772 9 4 9H4.9C5.40305 9 5.5 8.55228 5.5 8C5.5 7.44772 5.05228 7 4.5 7H3.5C1.84315 7 0.5 8.34315 0.5 10C0.5 11.6569 1.84315 13 3.5 13H4.5C5.05228 13 5.5 12.5523 5.5 12C5.5 11.4477 5.40305 11 4.9 11H4C3.44772 11 3 10.5523 3 10Z" fill="currentColor"/>
    <circle cx="10" cy="10" r="3" fill="currentColor"/>
    <path d="M15 6C15.5523 6 16 6.44772 16 7V8C16 8.55228 15.5523 9 15 9C14.4477 9 14 8.55228 14 8V7C14 6.44772 14.4477 6 15 6Z" fill="currentColor"/>
    <path d="M5 14C5.55228 14 6 14.4477 6 15V16C6 16.5523 5.55228 17 5 17C4.44772 17 4 16.5523 4 16V15C4 14.4477 4.44772 14 5 14Z" fill="currentColor"/>
  </svg>
);

const SpacingIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="4" x2="3" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="17" y1="4" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arrowhead)" markerStart="url(#arrowhead)"/>
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor"/>
      </marker>
    </defs>
  </svg>
);

const BorderRadiusIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H16C17.1046 4 18 4.89543 18 6V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M2 6C2 4.89543 2.89543 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 6C18 4.89543 17.1046 4 16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 14C18 15.1046 17.1046 16 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 14C2 15.1046 2.89543 16 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ShadowIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m14.8439,12.5303c-1.0912,1.4946-2.8516,2.4697-4.8439,2.4697s-3.7527-.975-4.8439-2.4697c-1.685.4144-3.1561,1.1508-3.1561,2.4697,0,2.916,7.1812,3,8,3s8-.084,8-3c0-1.3189-1.4711-2.0552-3.1561-2.4697Z" fill="currentColor" strokeWidth="0"/>
    <circle cx="10" cy="9" r="6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

const IconsIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M15 5L16 6L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="5" r="1" fill="currentColor"/>
    <path d="M5 15L6 14L7 15L6 16L5 15Z" fill="currentColor"/>
    <circle cx="15" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Color System',
      description: 'Color palette, themes, and semantic tokens',
      icon: <ColorSystemIcon className="h-6 w-6 text-purple-500" />,
      path: '/colors'
    },
    {
      title: 'Typography',
      description: 'Font families, sizes, and line heights',
      icon: <Type className="h-6 w-6 text-blue-500" />,
      path: '/typography'
    },
    {
      title: 'Spacing',
      description: 'Layout spacing and sizing scales',
      icon: <SpacingIcon className="h-6 w-6 text-green-500" />,
      path: '/spacing'
    },
    {
      title: 'Border Radius',
      description: 'Corner radius tokens and utilities',
      icon: <BorderRadiusIcon className="h-6 w-6 text-orange-500" />,
      path: '/radius'
    },
    {
      title: 'Shadow',
      description: 'Elevation and depth tokens',
      icon: <ShadowIcon className="h-6 w-6 text-gray-500" />,
      path: '/shadow'
    },
    {
      title: 'Icons',
      description: 'Icon library and guidelines',
      icon: <IconsIcon className="h-6 w-6 text-pink-500" />,
      path: '/icons'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Design System Overview</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Explore the building blocks of our design system
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Card 
              key={section.title}
              className="hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigate(section.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {section.icon}
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
