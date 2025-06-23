import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HexColorPicker } from 'react-colorful';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { ColorToken, ColorHarmony } from '@/types/designTokens';
import { Button } from '../ui/button';
import { Link, Unlink, ChevronLeft } from 'lucide-react';

import { EasingCurveEditor } from './EasingCurveEditor';
import { EasingCurve } from '@/types/designTokens';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { compressionToEasing, getCompressionNotches } from '@/lib/easingUtils';
import { useColorControl } from '@/contexts/ColorControlContext';

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
  const { system, dispatch } = useDesignSystem();
  const { setActiveColorControl } = useColorControl();
  const color = system.colors[tokenName as keyof typeof system.colors] as ColorToken;

  if (!color) return null;

  // Handle harmony changes
  const handleHarmonyChange = (harmonyType: ColorHarmony) => {
    if (harmonyType === 'none') {
      // Remove harmony - set to 'none' instead of undefined
      updateColorProperty('harmonySource', undefined);
      updateColorProperty('harmonyType', 'none');
    } else {
      // Apply harmony from primary color
      updateColorProperty('harmonySource', 'primary');
      updateColorProperty('harmonyType', harmonyType);
      
      // Calculate and apply the new hue based on harmony type
      const primaryHue = system.colors.primary.hue;
      let newHue = primaryHue;
      
      switch (harmonyType) {
        case 'complementary':
          newHue = (primaryHue + 180) % 360;
          break;
        case 'triadic':
          // For secondary, use +120, for accent use +240
          newHue = tokenName === 'secondary' 
            ? (primaryHue + 120) % 360 
            : (primaryHue + 240) % 360;
          break;
        case 'analogous':
          // For secondary, use +30, for accent use -30
          newHue = tokenName === 'secondary'
            ? (primaryHue + 30) % 360
            : (primaryHue - 30 + 360) % 360;
          break;
        case 'split-complementary':
          // For secondary, use +150, for accent use +210
          newHue = tokenName === 'secondary'
            ? (primaryHue + 150) % 360
            : (primaryHue + 210) % 360;
          break;
      }
      
      updateColorProperty('hue', newHue);
    }
  };

  const isHarmonized = color.harmonySource && color.harmonyType && color.harmonyType !== 'none';

  // Magnetic snapping function for compression sliders
  const applyMagneticSnapping = (value: number): number => {
    const notches = getCompressionNotches(); // [-66, -33, 0, 33, 66]
    const snapThreshold = 6; // Snap within 6 units of a notch (reduced by 25%)
    
    // Find the closest notch
    const closest = notches.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    
    // If within snap threshold, return the notch value
    if (Math.abs(closest - value) <= snapThreshold) {
      return closest;
    }
    
    // Otherwise return the original value
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveColorControl(null)}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">{label} Controls</h3>
        </div>
      </div>

      {/* Color Interpolation Mode - show only for colors with steps */}
      {showSteps && tokenName === 'primary' && (
        <div>
          <Label className="text-xs mb-2 block">Color Interpolation Mode</Label>
          <Tabs 
            value={system.colorInterpolationMode || 'hsl'} 
            onValueChange={(value) => dispatch({ type: 'SET_COLOR_INTERPOLATION_MODE', mode: value as 'hsl' | 'lch' })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="hsl" className="text-xs h-6 py-1">HSL</TabsTrigger>
              <TabsTrigger value="lch" className="text-xs h-6 py-1">LCH</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-muted-foreground mt-1">
            LCH mode creates more natural color transitions
          </p>
        </div>
      )}

      {/* Only show harmony controls for secondary and accent colors */}
      {(tokenName === 'secondary' || tokenName === 'accent') && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs">Color Harmony</Label>
            {isHarmonized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHarmonyChange('none')}
                className="h-5 px-2 text-xs"
              >
                <Unlink className="h-3 w-3 mr-1" />
                Unlink
              </Button>
            )}
          </div>
          <Select
            value={color.harmonyType || 'none'}
            onValueChange={(value) => handleHarmonyChange(value as ColorHarmony)}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="triadic">Triadic</SelectItem>
              <SelectItem value="analogous">Analogous</SelectItem>
              <SelectItem value="split-complementary">Split Complementary</SelectItem>
            </SelectContent>
          </Select>
          {isHarmonized && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              <span>Linked to {color.harmonySource}</span>
            </div>
          )}
        </div>
      )}

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
            value={colorHex}
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
          
          {/* Easing Curves */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-medium mb-3">Distribution Curves</h4>
            
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="simple" className="text-xs h-6 py-1">Simple</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs h-6 py-1">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="space-y-4 mt-4">
                {/* Compression sliders for intuitive control */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs">Light Step Compression</Label>
                    <Input
                      type="number"
                      min={-100}
                      max={100}
                      value={color.lightnessCompression || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        // Clamp value to valid range
                        const clampedValue = Math.max(-100, Math.min(100, value));
                        dispatch({ 
                          type: 'UPDATE_COLOR_COMPRESSION', 
                          tokenName, 
                          compressionType: 'light',
                          compressionValue: clampedValue 
                        });
                      }}
                      className="w-16 h-6 text-xs"
                    />
                  </div>
                  <div className="relative mt-2">
                    <Slider
                      min={-100}
                      max={100}
                      step={1}
                      value={[color.lightnessCompression || 0]}
                      onValueChange={([value]) => {
                        // Apply magnetic snapping to compression value
                        const snappedValue = applyMagneticSnapping(value);
                        
                        // Use the new compound action
                        dispatch({ 
                          type: 'UPDATE_COLOR_COMPRESSION', 
                          tokenName, 
                          compressionType: 'light',
                          compressionValue: snappedValue 
                        });
                      }}
                      className="flex-1"
                    />
                    {/* Notches for key compression values */}
                    <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
                      {getCompressionNotches().map((notch) => {
                        // Account for slider internal padding (typically ~10px on each side)
                        // Slider track doesn't span full width due to thumb size and padding
                        const trackPadding = 5; // percentage equivalent of slider padding
                        const trackWidth = 100 - (trackPadding * 2);
                        const normalizedPosition = (notch - (-100)) / (100 - (-100));
                        const position = trackPadding + (normalizedPosition * trackWidth);
                        return (
                          <div
                            key={notch}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-3 bg-border"
                            style={{ left: `${position}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Expanded</span>
                    <span>Linear</span>
                    <span>Compressed</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs">Dark Step Compression</Label>
                    <Input
                      type="number"
                      min={-100}
                      max={100}
                      value={color.darknessCompression || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        // Clamp value to valid range
                        const clampedValue = Math.max(-100, Math.min(100, value));
                        dispatch({ 
                          type: 'UPDATE_COLOR_COMPRESSION', 
                          tokenName, 
                          compressionType: 'dark',
                          compressionValue: clampedValue 
                        });
                      }}
                      className="w-16 h-6 text-xs"
                    />
                  </div>
                  <div className="relative mt-2">
                    <Slider
                      min={-100}
                      max={100}
                      step={1}
                      value={[color.darknessCompression || 0]}
                      onValueChange={([value]) => {
                        // Apply magnetic snapping to compression value
                        const snappedValue = applyMagneticSnapping(value);
                        
                        // Use the new compound action
                        dispatch({ 
                          type: 'UPDATE_COLOR_COMPRESSION', 
                          tokenName, 
                          compressionType: 'dark',
                          compressionValue: snappedValue 
                        });
                      }}
                      className="flex-1"
                    />
                    {/* Notches for key compression values */}
                    <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
                      {getCompressionNotches().map((notch) => {
                        // Account for slider internal padding (typically ~10px on each side)
                        // Slider track doesn't span full width due to thumb size and padding
                        const trackPadding = 5; // percentage equivalent of slider padding
                        const trackWidth = 100 - (trackPadding * 2);
                        const normalizedPosition = (notch - (-100)) / (100 - (-100));
                        const position = trackPadding + (normalizedPosition * trackWidth);
                        return (
                          <div
                            key={notch}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-3 bg-border"
                            style={{ left: `${position}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Expanded</span>
                    <span>Linear</span>
                    <span>Compressed</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Adjust how tightly color steps cluster near the extremes
                </p>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 mt-4">
                {/* Dual easing curves for precise control */}
                <div className="space-y-3">
                  <h5 className="text-xs font-medium text-muted-foreground">Lightness Curves</h5>
                  
                  <EasingCurveEditor
                    label="Light Range (Steps before primary)"
                    value={color.lightnessEasingLight || 'ease-out'}
                    customCurve={color.customLightnessCurveLight}
                    onChange={(curve) => updateColorProperty('lightnessEasingLight', curve)}
                  />
                  
                  <EasingCurveEditor
                    label="Dark Range (Steps after primary)"
                    value={color.lightnessEasingDark || 'ease-in'}
                    customCurve={color.customLightnessCurveDark}
                    onChange={(curve) => updateColorProperty('lightnessEasingDark', curve)}
                  />
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-xs font-medium text-muted-foreground">Saturation Curves</h5>
                  
                  <EasingCurveEditor
                    label="Light Range (Steps before primary)"
                    value={color.saturationEasingLight || 'linear'}
                    customCurve={color.customSaturationCurveLight}
                    onChange={(curve) => updateColorProperty('saturationEasingLight', curve)}
                  />
                  
                  <EasingCurveEditor
                    label="Dark Range (Steps after primary)"
                    value={color.saturationEasingDark || 'linear'}
                    customCurve={color.customSaturationCurveDark}
                    onChange={(curve) => updateColorProperty('saturationEasingDark', curve)}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Fine-tune distribution curves for each range independently
                </p>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Legacy Skew Controls - Hidden but kept for backwards compatibility */}
          <div className="hidden">
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
          </div>
        </>
      )}
    </div>
  );
}; 