import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconPreview } from '@/components/Display/IconPreview';
import { ExternalLink } from 'lucide-react';

const Icons: React.FC = () => {
  const { system, dispatch } = useDesignSystem();
  const currentLibrary = system.iconLibrary || 'lucide';

  const handleLibraryChange = (library: string) => {
    dispatch({ type: 'SET_ICON_LIBRARY', library: library as 'lucide' | 'heroicons' | 'tabler' | 'nucleo' });
  };

  const handleGetNucleo = () => {
    window.open('https://nucleoapp.com/?ref=20331', '_blank');
  };

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Icon Library</h1>
        <p className="text-muted-foreground">
          Choose an icon library for your design system. Each library has its own unique style and comprehensive set of icons.
        </p>
      </div>

      <div className="mb-8">
        <Label className="text-base font-medium mb-4 block">Select Icon Library</Label>
        <RadioGroup 
          value={currentLibrary} 
          onValueChange={handleLibraryChange}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex flex-col p-6 rounded-lg border hover:bg-accent/5 transition-colors h-full">
            <div className="flex items-center space-x-3 mb-3">
              <RadioGroupItem value="lucide" id="lucide" />
              <Label 
                htmlFor="lucide" 
                className="font-medium cursor-pointer"
              >
                Lucide (Default)
              </Label>
            </div>
            <div className="text-sm text-muted-foreground flex-1 mb-4">
              1500+ Clean and consistent icons with a 24x24 grid. Perfect for modern interfaces.
            </div>
            <div className="h-8">
              {/* Reserved space for button - empty for non-premium libraries */}
            </div>
          </div>
          
          <div className="flex flex-col p-6 rounded-lg border hover:bg-accent/5 transition-colors h-full">
            <div className="flex items-center space-x-3 mb-3">
              <RadioGroupItem value="heroicons" id="heroicons" />
              <Label 
                htmlFor="heroicons" 
                className="font-medium cursor-pointer"
              >
                Heroicons
              </Label>
            </div>
            <div className="text-sm text-muted-foreground flex-1 mb-4">
              300+ Beautiful hand-crafted SVG icons by the makers of Tailwind CSS. Available in outline and solid styles.
            </div>
            <div className="h-8">
              {/* Reserved space for button - empty for non-premium libraries */}
            </div>
          </div>
          
          <div className="flex flex-col p-6 rounded-lg border hover:bg-accent/5 transition-colors h-full">
            <div className="flex items-center space-x-3 mb-3">
              <RadioGroupItem value="tabler" id="tabler" />
              <Label 
                htmlFor="tabler" 
                className="font-medium cursor-pointer"
              >
                Tabler Icons
              </Label>
            </div>
            <div className="text-sm text-muted-foreground flex-1 mb-4">
              Over 5,000 free SVG icons. Highly customizable with consistent 24x24 grid.
            </div>
            <div className="h-8">
              {/* Reserved space for button - empty for non-premium libraries */}
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-lg border hover:bg-accent/5 transition-colors h-full">
            <div className="flex items-center space-x-3 mb-3">
              <RadioGroupItem value="nucleo" id="nucleo" />
              <Label 
                htmlFor="nucleo" 
                className="font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>Nucleo Icons</span>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </div>
              </Label>
            </div>
            <div className="text-sm text-muted-foreground flex-1 mb-4">
              33,954+ premium-quality SVG icons, regularly updated for UIs, presentations, and print projects. The ultimate icon bundle.
            </div>
            <div className="h-8">
              {currentLibrary === 'nucleo' && (
                <Button 
                  onClick={handleGetNucleo}
                  size="sm"
                  className="flex items-center gap-2 w-full h-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Nucleo
                </Button>
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t pt-8">
        <IconPreview />
      </div>
    </div>
  );
};

export default Icons; 