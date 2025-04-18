
import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FontToken } from '@/types/designTokens';

interface TypographyControlProps {
  tokenName: string;
  label: string;
}

export const TypographyControl: React.FC<TypographyControlProps> = ({ tokenName, label }) => {
  const { system, dispatch } = useDesignSystem();
  const font = system.fonts[tokenName];

  const updateFontProperty = (property: keyof FontToken, value: string | number) => {
    dispatch({
      type: 'UPDATE_FONT',
      fontName: tokenName,  // Changed from tokenName to fontName to match the action type
      property,
      value: typeof value === 'string' ? value : Number(value)
    });
  };

  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Playfair Display',
    'system-ui',
    'serif',
    'sans-serif',
    'monospace'
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs mb-2 block">Font Family</Label>
          <Select value={font.family} onValueChange={(value) => updateFontProperty('family', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((family) => (
                <SelectItem key={family} value={family}>{family}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Size (px)</Label>
            <span className="text-xs text-muted-foreground">{font.size}px</span>
          </div>
          <Slider
            min={8}
            max={72}
            step={1}
            value={[font.size]}
            onValueChange={([value]) => updateFontProperty('size', value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Weight</Label>
            <span className="text-xs text-muted-foreground">{font.weight}</span>
          </div>
          <Slider
            min={100}
            max={900}
            step={100}
            value={[font.weight]}
            onValueChange={([value]) => updateFontProperty('weight', value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Line Height</Label>
            <span className="text-xs text-muted-foreground">{font.lineHeight.toFixed(1)}</span>
          </div>
          <Slider
            min={1}
            max={2}
            step={0.1}
            value={[font.lineHeight]}
            onValueChange={([value]) => updateFontProperty('lineHeight', value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Letter Spacing</Label>
            <span className="text-xs text-muted-foreground">{font.letterSpacing.toFixed(1)}px</span>
          </div>
          <Slider
            min={-2}
            max={10}
            step={0.1}
            value={[font.letterSpacing]}
            onValueChange={([value]) => updateFontProperty('letterSpacing', value)}
          />
        </div>
      </div>
    </div>
  );
};
