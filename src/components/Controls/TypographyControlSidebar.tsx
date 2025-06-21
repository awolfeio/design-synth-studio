import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { FontToken } from '@/types/designTokens';

interface TypographyControlSidebarProps {
  tokenName: string;
  label: string;
  updateFontProperty: (property: keyof FontToken, value: string | number) => void;
  fontFamilies: Array<{ value: string; label: string }>;
  getHeadingSizes: () => { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  getPreviewContent: () => React.ReactNode;
}

export const TypographyControlSidebar: React.FC<TypographyControlSidebarProps> = ({
  tokenName,
  label,
  updateFontProperty,
  fontFamilies,
  getHeadingSizes,
  getPreviewContent
}) => {
  const { system } = useDesignSystem();
  const font = system.fonts[tokenName as keyof typeof system.fonts] as FontToken;

  if (!font) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">{label} Controls</h3>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Font Family</Label>
        <Select value={font.family} onValueChange={(value) => updateFontProperty('family', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((family) => (
              <SelectItem key={family.value} value={family.value}>{family.label}</SelectItem>
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

      {tokenName === 'heading' && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Heading Scale</Label>
            <span className="text-xs text-muted-foreground">{(font.headingScale || 1.25).toFixed(2)}</span>
          </div>
          <Slider
            min={1.1}
            max={2.0}
            step={0.05}
            value={[font.headingScale || 1.25]}
            onValueChange={([value]) => updateFontProperty('headingScale', value)}
          />
        </div>
      )}
    </div>
  );
}; 