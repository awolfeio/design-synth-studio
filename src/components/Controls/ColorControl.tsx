
import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { ColorToken } from '@/types/designTokens';
import { HexColorPicker } from 'react-colorful';
import { hslaToHex, hexToHsla } from '@/lib/colorUtils';

interface ColorControlProps {
  tokenName: string;
  label: string;
}

export const ColorControl: React.FC<ColorControlProps> = ({ tokenName, label }) => {
  const { system, dispatch } = useDesignSystem();
  const color = system.colors[tokenName];
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  
  // Convert current HSL values to hex for the color picker
  const colorHex = hslaToHex(color.hue, color.saturation, color.lightness, color.alpha);
  
  // Handle direct hex color changes from the picker
  const handleHexChange = (newHex: string) => {
    const { h, s, l, a } = hexToHsla(newHex);
    updateColorProperty('hue', h);
    updateColorProperty('saturation', s);
    updateColorProperty('lightness', l);
  };
  
  // Update a specific property of the color token
  const updateColorProperty = (property: keyof ColorToken, value: number) => {
    dispatch({ 
      type: 'UPDATE_COLOR', 
      tokenName, 
      property, 
      value 
    });
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Label className="font-medium">{label}</Label>
        <div 
          className="w-8 h-8 rounded-full border border-border cursor-pointer"
          style={{ backgroundColor: colorHex }}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        />
      </div>
      
      {isPickerOpen && (
        <div className="mb-4 relative">
          <div className="absolute z-10 right-0">
            <HexColorPicker color={colorHex} onChange={handleHexChange} />
          </div>
        </div>
      )}
      
      <div className="space-y-4 mt-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Hue</Label>
            <span className="text-xs text-muted-foreground">{Math.round(color.hue)}°</span>
          </div>
          <Slider 
            min={0} 
            max={360} 
            step={1}
            value={[color.hue]} 
            onValueChange={([value]) => updateColorProperty('hue', value)}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Saturation</Label>
            <span className="text-xs text-muted-foreground">{Math.round(color.saturation)}%</span>
          </div>
          <Slider 
            min={0} 
            max={100} 
            step={1}
            value={[color.saturation]} 
            onValueChange={([value]) => updateColorProperty('saturation', value)}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Lightness</Label>
            <span className="text-xs text-muted-foreground">{Math.round(color.lightness)}%</span>
          </div>
          <Slider 
            min={0} 
            max={100} 
            step={1}
            value={[color.lightness]} 
            onValueChange={([value]) => updateColorProperty('lightness', value)}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Alpha</Label>
            <span className="text-xs text-muted-foreground">{color.alpha.toFixed(2)}</span>
          </div>
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={[color.alpha]} 
            onValueChange={([value]) => updateColorProperty('alpha', value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
