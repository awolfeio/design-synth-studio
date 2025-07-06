import React, { useState, useEffect, useMemo } from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { IconPreview } from '@/components/Display/IconPreview';
import { ExternalLink, Search, Loader } from 'lucide-react';

// Import icons from each library for preloading
import * as LucideIcons from 'lucide-react';
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as TablerIcons from '@tabler/icons-react';

const Icons: React.FC = () => {
  const { system, dispatch } = useDesignSystem();
  const currentLibrary = system.iconLibrary || 'lucide';
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Preload icon libraries to reduce loading time
  useEffect(() => {
    // Preload the current library icons
    const preloadIcons = async () => {
      setIsLoading(true);
      
      // Small delay to show loading state, then preload
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force import of the current library
      switch (currentLibrary) {
        case 'lucide':
          // Already imported, just ensure it's ready
          break;
        case 'heroicons':
          // Already imported, just ensure it's ready
          break;
        case 'tabler':
          // Already imported, just ensure it's ready
          break;
      }
      
      setIsLoading(false);
    };

    preloadIcons();
  }, [currentLibrary]);

  const handleLibraryChange = (library: string) => {
    setIsLoading(true);
    dispatch({ type: 'SET_ICON_LIBRARY', library: library as 'lucide' | 'heroicons' | 'tabler' | 'nucleo' });
    
    // Small delay to show loading feedback
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleGetNucleo = () => {
    window.open('https://nucleoapp.com/?ref=20331', '_blank');
  };

  // Library selector component for the sidebar
  const LibrarySelector = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Icon Library</Label>
        <RadioGroup 
          value={currentLibrary} 
          onValueChange={handleLibraryChange}
          className="space-y-3"
        >
          <div 
            className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
              currentLibrary === 'lucide' 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }`}
            onClick={() => handleLibraryChange('lucide')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <RadioGroupItem value="lucide" id="lucide" />
              <Label 
                htmlFor="lucide" 
                className="font-medium cursor-pointer text-sm"
              >
                Lucide
              </Label>
              <Badge variant="outline" className="text-xs">Default</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              1500+ clean and consistent icons with a 24x24 grid. Perfect for modern interfaces.
            </div>
          </div>
          
          <div 
            className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
              currentLibrary === 'heroicons' 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }`}
            onClick={() => handleLibraryChange('heroicons')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <RadioGroupItem value="heroicons" id="heroicons" />
              <Label 
                htmlFor="heroicons" 
                className="font-medium cursor-pointer text-sm"
              >
                Heroicons
              </Label>
            </div>
            <div className="text-xs text-muted-foreground">
              300+ beautiful hand-crafted SVG icons by the makers of Tailwind CSS.
            </div>
          </div>
          
          <div 
            className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
              currentLibrary === 'tabler' 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }`}
            onClick={() => handleLibraryChange('tabler')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <RadioGroupItem value="tabler" id="tabler" />
              <Label 
                htmlFor="tabler" 
                className="font-medium cursor-pointer text-sm"
              >
                Tabler Icons
              </Label>
            </div>
            <div className="text-xs text-muted-foreground">
              5,000+ free SVG icons. Highly customizable with consistent 24x24 grid.
            </div>
          </div>

          <div 
            className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
              currentLibrary === 'nucleo' 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border hover:border-primary/50 hover:bg-accent/5'
            }`}
            onClick={() => handleLibraryChange('nucleo')}
          >
            <div className="flex items-center space-x-3 mb-2">
              <RadioGroupItem value="nucleo" id="nucleo" />
              <Label 
                htmlFor="nucleo" 
                className="font-medium cursor-pointer text-sm"
              >
                Nucleo Icons
              </Label>
              <Badge variant="secondary" className="text-xs">Premium</Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              33,954+ premium-quality SVG icons. The ultimate icon bundle.
            </div>
            {currentLibrary === 'nucleo' && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGetNucleo();
                }}
                size="sm"
                className="flex items-center gap-2 w-full text-xs"
              >
                <ExternalLink className="h-3 w-3" />
                Get Nucleo
              </Button>
            )}
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <>
      {/* Right Sidebar with Library Selector */}
      <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border p-6 overflow-y-auto z-10">
        <LibrarySelector />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8 pr-80">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Icon Library</h1>
          <p className="text-muted-foreground">
            Choose an icon library for your design system. Each library has its own unique style and comprehensive set of icons.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-muted-foreground">Loading {currentLibrary} icons...</span>
            </div>
          </div>
        )}

        {/* Icon Preview */}
        {!isLoading && (
          <div className="border-t pt-8">
            <IconPreview searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </>
  );
};

export default Icons; 