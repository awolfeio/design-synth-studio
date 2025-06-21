import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HexColorPicker } from 'react-colorful';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { ColorToken } from '@/types/designTokens';

interface ColorControlSidebarProps {
  tokenName: string;
  label: string;
  showSteps?: boolean;
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
  hexInputValue: string;
  setHexInputValue: (value: string) => void;
  colorHex: string;
  handleHexChange: (hex: string) => void;
  handleHexInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHexInputSubmit: () => void;
  handleHexInputKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  updateColorProperty: (property: keyof ColorToken, value: number | string) => void;
  handleInputChange: (property: keyof ColorToken, e: React.ChangeEvent<HTMLInputElement>) => void;
  getStepValue: (index: number) => number;
}

export const ColorControlSidebar: React.FC<ColorControlSidebarProps> = ({
  tokenName,
  label,
  showSteps = false,
  isPickerOpen,
  setIsPickerOpen,
  hexInputValue,
  setHexInputValue,
  colorHex,
  handleHexChange,
  handleHexInputChange,
  handleHexInputSubmit,
  handleHexInputKeyPress,
  updateColorProperty,
  handleInputChange,
  getStepValue
}) => {
  const { system } = useDesignSystem();
  const color = system.colors[tokenName as keyof typeof system.colors] as ColorToken;

  if (!color) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">{label} Controls</h3>
      </div>

      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full border border-border cursor-pointer"
          style={{ backgroundColor: colorHex }}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        />
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">HEX</Label>
          <Input
            type="text"
            value={hexInputValue}
            onChange={handleHexInputChange}
            onBlur={handleHexInputSubmit}
            onKeyPress={handleHexInputKeyPress}
            placeholder="#000000"
            className="w-20 h-8 text-xs font-mono"
            maxLength={7}
          />
        </div>
      </div>

      {/* Primary Step Position selector - for all colors with steps */}
      {showSteps && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Primary Step</Label>
          <Select
            value={String(color.primaryStepIndex ?? 5)}
            onValueChange={(value) => updateColorProperty('primaryStepIndex', parseInt(value))}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: Math.round(color.steps) }, (_, i) => (
                <SelectItem key={i} value={String(i)}>
                  {getStepValue(i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isPickerOpen && (
        <div className="mb-4 relative">
          <div className="z-10">
            <HexColorPicker color={colorHex} onChange={handleHexChange} />
          </div>
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Hue</Label>
          <span className="text-xs text-muted-foreground">{Math.round(color.hue)}°</span>
        </div>
        <div className="flex gap-3">
          <Slider 
            min={0} 
            max={360} 
            step={1}
            value={[color.hue]} 
            onValueChange={([value]) => updateColorProperty('hue', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={360}
            value={Math.round(color.hue)}
            onChange={(e) => handleInputChange('hue', e)}
            className="w-16 h-8 text-xs"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Saturation</Label>
          <span className="text-xs text-muted-foreground">{Math.round(color.saturation)}%</span>
        </div>
        <div className="flex gap-3">
          <Slider 
            min={0} 
            max={tokenName === 'neutrals' ? 15 : 100} 
            step={1}
            value={[color.saturation]} 
            onValueChange={([value]) => updateColorProperty('saturation', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={tokenName === 'neutrals' ? 15 : 100}
            value={Math.round(color.saturation)}
            onChange={(e) => handleInputChange('saturation', e)}
            className="w-16 h-8 text-xs"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Lightness</Label>
          <span className="text-xs text-muted-foreground">{Math.round(color.lightness)}%</span>
        </div>
        <div className="flex gap-3">
          <Slider 
            min={0} 
            max={100} 
            step={1}
            value={[color.lightness]} 
            onValueChange={([value]) => updateColorProperty('lightness', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={Math.round(color.lightness)}
            onChange={(e) => handleInputChange('lightness', e)}
            className="w-16 h-8 text-xs"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Alpha</Label>
          <span className="text-xs text-muted-foreground">{color.alpha.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={[color.alpha]} 
            onValueChange={([value]) => updateColorProperty('alpha', value)}
            className="flex-1"
          />
          <Input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={color.alpha}
            onChange={(e) => handleInputChange('alpha', e)}
            className="w-16 h-8 text-xs"
          />
        </div>
      </div>
      
      {showSteps && (
        <>
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Step Quantity</Label>
              <span className="text-xs text-muted-foreground">{Math.round(color.steps)}</span>
            </div>
            <div className="flex gap-3">
              <Slider 
                min={tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 3 : 6} 
                max={tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 7 : 14} 
                step={1}
                value={[color.steps]} 
                onValueChange={([value]) => updateColorProperty('steps', value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 3 : 6}
                max={tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 7 : 14}
                value={Math.round(color.steps)}
                onChange={(e) => handleInputChange('steps', e)}
                className="w-16 h-8 text-xs"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Skew Light Intensity</Label>
              <span className="text-xs text-muted-foreground">{Math.round(color.skewLightIntensity)}%</span>
            </div>
            <div className="flex gap-3">
              <Slider 
                min={0} 
                max={100} 
                step={1}
                value={[color.skewLightIntensity]} 
                onValueChange={([value]) => updateColorProperty('skewLightIntensity', value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={Math.round(color.skewLightIntensity)}
                onChange={(e) => handleInputChange('skewLightIntensity', e)}
                className="w-16 h-8 text-xs"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Skew Dark Intensity</Label>
              <span className="text-xs text-muted-foreground">{Math.round(color.skewDarkIntensity)}%</span>
            </div>
            <div className="flex gap-3">
              <Slider 
                min={0} 
                max={100} 
                step={1}
                value={[color.skewDarkIntensity]} 
                onValueChange={([value]) => updateColorProperty('skewDarkIntensity', value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={Math.round(color.skewDarkIntensity)}
                onChange={(e) => handleInputChange('skewDarkIntensity', e)}
                className="w-16 h-8 text-xs"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 