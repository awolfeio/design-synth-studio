
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Palette, Type, Ruler, Radius, Square, Icon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Color System',
      description: 'Color palette, themes, and semantic tokens',
      icon: <Palette className="h-6 w-6 text-purple-500" />,
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
      icon: <Ruler className="h-6 w-6 text-green-500" />,
      path: '/spacing'
    },
    {
      title: 'Border Radius',
      description: 'Corner radius tokens and utilities',
      icon: <Radius className="h-6 w-6 text-orange-500" />,
      path: '/radius'
    },
    {
      title: 'Shadow',
      description: 'Elevation and depth tokens',
      icon: <Square className="h-6 w-6 text-gray-500" />,
      path: '/shadow'
    },
    {
      title: 'Icons',
      description: 'Icon library and guidelines',
      icon: <Icon name="grid" className="h-6 w-6 text-pink-500" />,
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
