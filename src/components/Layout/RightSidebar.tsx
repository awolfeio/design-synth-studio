
import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { ComponentVariant, ComponentSize } from '@/types/designTokens';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const RightSidebar: React.FC = () => {
  const { system, dispatch, componentVariant, setComponentVariant } = useDesignSystem();
  const [componentSize, setComponentSize] = React.useState<ComponentSize>('medium');
  const [enableAccessibility, setEnableAccessibility] = React.useState(false);
  const [enableCompactMode, setEnableCompactMode] = React.useState(false);

  // Handler for radius adjustment
  const handleRadiusChange = (radiusName: string, value: number) => {
    dispatch({ type: 'UPDATE_RADIUS', radiusName, value });
  };

  return (
    <div className="w-72 border-l border-border bg-background overflow-y-auto p-4">
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Controls</h3>

        {/* Component Style Controls */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Component Style</h4>
          
          <div className="mb-4">
            <Label htmlFor="component-variant" className="mb-2 block">Button Variant</Label>
            <Select
              value={componentVariant}
              onValueChange={(value) => setComponentVariant(value as ComponentVariant)}
            >
              <SelectTrigger id="component-variant">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="component-size" className="mb-2 block">Component Size</Label>
            <Select
              value={componentSize}
              onValueChange={(value) => setComponentSize(value as ComponentSize)}
            >
              <SelectTrigger id="component-size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Global Radius Controls */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Border Radius</h4>
          
          {Object.entries(system.radius).map(([name, value]) => (
            <div key={name} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor={`radius-${name}`} className="capitalize">{name}</Label>
                <span className="text-xs text-muted-foreground">{value}px</span>
              </div>
              <Slider
                id={`radius-${name}`}
                min={0}
                max={40}
                step={1}
                value={[value]}
                onValueChange={([newValue]) => handleRadiusChange(name, newValue)}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Accessibility and Layout Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Options</h4>
          
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="accessibility-toggle">Enable Accessible Contrast</Label>
            <Switch
              id="accessibility-toggle"
              checked={enableAccessibility}
              onCheckedChange={setEnableAccessibility}
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="compact-toggle">Compact Layout</Label>
            <Switch
              id="compact-toggle"
              checked={enableCompactMode}
              onCheckedChange={setEnableCompactMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
