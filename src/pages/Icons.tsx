import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { IconPreview } from '@/components/Display/IconPreview';

const Icons: React.FC = () => {
  const { system, dispatch } = useDesignSystem();
  const currentLibrary = system.iconLibrary || 'lucide';

  const handleLibraryChange = (library: string) => {
    dispatch({ type: 'SET_ICON_LIBRARY', library: library as 'lucide' | 'heroicons' | 'tabler' });
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
          className="flex flex-col space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="lucide" id="lucide" />
            <Label 
              htmlFor="lucide" 
              className="flex-1 cursor-pointer"
            >
              <div className="font-medium">Lucide (Default)</div>
              <div className="text-sm text-muted-foreground">
                Clean and consistent icons with a 24x24 grid. Perfect for modern interfaces.
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="heroicons" id="heroicons" />
            <Label 
              htmlFor="heroicons" 
              className="flex-1 cursor-pointer"
            >
              <div className="font-medium">Heroicons</div>
              <div className="text-sm text-muted-foreground">
                Beautiful hand-crafted SVG icons by the makers of Tailwind CSS. Available in outline and solid styles.
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="tabler" id="tabler" />
            <Label 
              htmlFor="tabler" 
              className="flex-1 cursor-pointer"
            >
              <div className="font-medium">Tabler Icons</div>
              <div className="text-sm text-muted-foreground">
                Over 5,000 free SVG icons. Highly customizable with consistent 24x24 grid.
              </div>
            </Label>
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