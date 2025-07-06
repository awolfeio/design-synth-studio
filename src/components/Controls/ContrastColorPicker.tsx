import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { useContrastCheck } from '@/contexts/ContrastCheckContext';
import { hslaToHex } from '@/lib/colorUtils';
import { X, Pipette } from 'lucide-react';
import { ColorToken } from '@/types/designTokens';

interface ContrastColorPickerProps {
  tokenName: string;
  stepIndex: number;
  currentColor: string;
  useWhiteIcon?: boolean; // Whether to use white icon color (for dark backgrounds)
}

export const ContrastColorPicker: React.FC<ContrastColorPickerProps> = ({ 
  tokenName, 
  stepIndex,
  currentColor,
  useWhiteIcon = false
}) => {
  const { system } = useDesignSystem();
  const { comparisonColors, setComparisonColor, clearComparisonColor, hasCustomComparison } = useContrastCheck();
  const [isOpen, setIsOpen] = useState(false);
  
  const comparisonKey = `${tokenName}-${stepIndex}`;
  const hasComparison = hasCustomComparison(comparisonKey);
  const comparisonColor = comparisonColors[comparisonKey];

  // Helper functions (moved before useMemo to avoid initialization errors)
  const getStepValue = React.useCallback((index: number, color: ColorToken): number => {
    const extraSteps = Math.max(0, Math.round(color.steps) - 12);
    if (index < extraSteps) {
      return index === 0 && extraSteps === 2 ? 25 : 50;
    }
    return (index - extraSteps + 1) * 100;
  }, []);

  const getLightnessForStep = React.useCallback((stepIndex: number, totalSteps: number, color: ColorToken): number => {
    const primaryIndex = color.primaryStepIndex ?? Math.ceil(totalSteps / 2) - 1;
    const baseMinLightness = 5;
    const baseMaxLightness = 95;
    const baseLightnessRange = baseMaxLightness - baseMinLightness;
    
    return baseMaxLightness - (stepIndex / (totalSteps - 1)) * baseLightnessRange;
  }, []);

  const getSaturationForStep = React.useCallback((stepIndex: number, totalSteps: number, color: ColorToken): number => {
    return color.saturation; // Simplified for now
  }, []);

  // Generate all available colors from the design system
  const availableColors = React.useMemo(() => {
    const colors: { label: string; hex: string; group: string }[] = [];
    
    // Add white and black
    colors.push({ label: 'White', hex: '#FFFFFF', group: 'Basic' });
    colors.push({ label: 'Black', hex: '#000000', group: 'Basic' });
    
    // Add all color steps from the design system
    Object.entries(system.colors).forEach(([colorName, colorToken]) => {
      if (colorToken.steps && colorToken.steps > 1) {
        const steps = Math.round(colorToken.steps);
        for (let i = 0; i < steps; i++) {
          const stepValue = getStepValue(i, colorToken);
          const stepLightness = getLightnessForStep(i, steps, colorToken);
          const stepSaturation = getSaturationForStep(i, steps, colorToken);
          
          const hex = hslaToHex(
            colorToken.hue,
            stepSaturation,
            stepLightness,
            colorToken.alpha
          );
          
          colors.push({
            label: `${colorName}-${stepValue}`,
            hex,
            group: colorName.charAt(0).toUpperCase() + colorName.slice(1)
          });
        }
      } else {
        // For colors without steps (border, background)
        const hex = hslaToHex(
          colorToken.hue,
          colorToken.saturation,
          colorToken.lightness,
          colorToken.alpha
        );
        colors.push({
          label: colorName,
          hex,
          group: 'Other'
        });
      }
    });
    
    return colors;
  }, [system.colors, getStepValue, getLightnessForStep, getSaturationForStep]);

  const handleColorSelect = (hex: string) => {
    setComparisonColor(comparisonKey, hex);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearComparisonColor(comparisonKey);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${hasComparison ? 'bg-primary/10' : ''} group`}
          title={hasComparison ? `Comparing with ${comparisonColor}` : 'Select comparison color'}
        >
          {hasComparison ? (
            <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: comparisonColor }} />
          ) : (
            <Pipette className={`h-3 w-3 drop-shadow-sm transition-colors ${
              useWhiteIcon 
                ? 'text-white group-hover:text-black' 
                : 'text-black group-hover:text-black'
            }`} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Select Comparison Color</h4>
            {hasComparison && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(
              availableColors.reduce((groups, color) => {
                if (!groups[color.group]) groups[color.group] = [];
                groups[color.group].push(color);
                return groups;
              }, {} as Record<string, typeof availableColors>)
            ).map(([group, colors]) => (
              <div key={group}>
                <div className="text-xs font-medium text-muted-foreground mb-1">{group}</div>
                <div className="grid grid-cols-6 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color.label}
                      onClick={() => handleColorSelect(color.hex)}
                      className={`
                        w-full aspect-square rounded border transition-all
                        ${color.hex === currentColor ? 'border-destructive cursor-not-allowed opacity-50' : 'border-border hover:border-primary'}
                        ${color.hex === comparisonColor ? 'ring-2 ring-primary ring-offset-1' : ''}
                      `}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                      disabled={color.hex === currentColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 