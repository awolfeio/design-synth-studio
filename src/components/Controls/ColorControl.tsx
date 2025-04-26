import React, { useEffect } from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { ColorToken } from '@/types/designTokens';
import { HexColorPicker } from 'react-colorful';
import { hslaToHex, hexToHsla } from '@/lib/colorUtils';

// Import components for the radio buttons
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface ColorControlProps {
  tokenName: string;
  label: string;
  showSteps?: boolean;
}

export const ColorControl: React.FC<ColorControlProps> = ({ 
  tokenName, 
  label, 
  showSteps = false 
}) => {
  const { system, dispatch } = useDesignSystem();
  const color = system.colors[tokenName];
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  
  // Convert current HSL values to hex for the color picker
  const colorHex = hslaToHex(color.hue, color.saturation, color.lightness, color.alpha);
  
  // Compute the primary step index (middle-most, rounding up)
  const getPrimaryStepIndex = (): number => {
    const steps = Math.round(color.steps);
    return Math.ceil(steps / 2) - 1; // 0-based index, so subtract 1
  };
  
  // Get the primary step value (e.g., 500, 600, 700)
  const getPrimaryStepValue = (): number => {
    return (getPrimaryStepIndex() + 1) * 100;
  };

  // Calculate lightness for a specific step with intensity adjustments
  const getLightnessForStep = (stepIndex: number, totalSteps: number): number => {
    const steps = totalSteps;
    const primaryIndex = getPrimaryStepIndex();
    
    // Base lightness scale with expanded range for lighter steps (95%-5% instead of 90%-10%)
    // This creates a wider spread to avoid duplicate colors
    const baseMinLightness = 5;  // Darkest step
    const baseMaxLightness = 95; // Lightest step
    const baseLightnessRange = baseMaxLightness - baseMinLightness;
    
    // Standard lightness before any skew adjustments
    const standardLightness = baseMaxLightness - (stepIndex / (steps - 1)) * baseLightnessRange;
    
    // If this is a step below the primary and skew light intensity is active
    if (stepIndex < primaryIndex && color.skewLightIntensity > 0) {
      // Calculate normalized position from primary to lightest (0 at primary, 1 at lightest/first step)
      const distanceFromPrimary = (primaryIndex - stepIndex) / primaryIndex;
      
      // Use a modified curve that provides more impact on steps closer to primary
      // while still maintaining stronger effect on lightest steps
      const linearComponent = distanceFromPrimary * 0.3; // Linear portion ensures all steps get some effect
      const exponentialComponent = Math.pow(distanceFromPrimary, 2) * 0.7; // Exponential portion for dramatic effect on lightest steps
      const modifiedCurve = linearComponent + exponentialComponent;
      
      // Calculate the boost amount based on intensity
      const intensityNormalized = color.skewLightIntensity / 100;
      
      // Ensure minimum boost for steps close to primary, even at lower intensities
      const minBoost = 5 * intensityNormalized * (1 - Math.pow(stepIndex / primaryIndex, 2));
      
      // Calculate the full boost with dynamic scaling for lighter steps
      // The boost gets stronger for the very lightest steps, going up to 99% lightness
      // But scales down for other steps to maintain distinction
      const maxPossibleBoost = 99 - standardLightness; // How much room we have to increase lightness
      
      // Scale the boost based on step position - first step can go much lighter
      const boostScalingFactor = stepIndex === 0 ? 1 : 
                                stepIndex === 1 ? 0.85 : 
                                Math.max(0.7 - (stepIndex / primaryIndex) * 0.3, 0.4);
      
      const curveBoost = maxPossibleBoost * intensityNormalized * modifiedCurve * boostScalingFactor;
      let boost = Math.min(minBoost + curveBoost, maxPossibleBoost);
      
      // Ensure each step is at least 1.5% different from adjacent steps to avoid duplicates
      if (stepIndex > 0) {
        // Get the lightness of the previous (lighter) step
        const previousStepLightness = getLightnessForStep(stepIndex - 1, totalSteps);
        
        // Ensure minimum difference (make this step dark enough to be distinct)
        const minDifference = 1.5;
        const maxAllowedLightness = previousStepLightness - minDifference;
        
        // Adjust boost to respect minimum difference
        if (standardLightness + boost > maxAllowedLightness) {
          boost = Math.max(0, maxAllowedLightness - standardLightness);
        }
      }
      
      // Apply the adjusted boost
      return Math.min(standardLightness + boost, 99); // Cap at 99% to keep a hint of color
      
    } else if (stepIndex > primaryIndex && color.skewDarkIntensity > 0) {
      // For dark steps, similar approach with improved distinction
      const stepsAfterPrimary = steps - primaryIndex - 1;
      if (stepsAfterPrimary > 0) {
        const distanceFromPrimary = (stepIndex - primaryIndex) / stepsAfterPrimary;
        
        // Use similar blend of linear and exponential for dark steps
        const linearComponent = distanceFromPrimary * 0.3;
        const exponentialComponent = Math.pow(distanceFromPrimary, 2) * 0.7;
        const modifiedCurve = linearComponent + exponentialComponent;
        
        const intensityNormalized = color.skewDarkIntensity / 100;
        
        // Ensure minimum effect for steps close to primary
        const minDarken = 5 * intensityNormalized * (1 - Math.pow((stepsAfterPrimary - (stepIndex - primaryIndex)) / stepsAfterPrimary, 2));
        
        // Max possible darkening 
        const maxPossibleDarken = standardLightness - 1; // How dark can we go (down to 1%)
        
        // Scale darken effect by position - darker steps can go much darker
        const darkenScalingFactor = stepIndex === steps - 1 ? 1 : 
                                   stepIndex === steps - 2 ? 0.85 : 
                                   Math.max(0.7 - ((steps - 1 - stepIndex) / stepsAfterPrimary) * 0.3, 0.4);
        
        const curveDarken = maxPossibleDarken * intensityNormalized * modifiedCurve * darkenScalingFactor;
        let darken = Math.min(minDarken + curveDarken, maxPossibleDarken);
        
        // Ensure each step is at least 1.5% different from adjacent steps
        if (stepIndex < steps - 1) {
          // Get the lightness of the next (darker) step
          const nextStepLightness = getLightnessForStep(stepIndex + 1, totalSteps);
          
          // Ensure minimum difference (make this step light enough to be distinct)
          const minDifference = 1.5;
          const minAllowedLightness = nextStepLightness + minDifference;
          
          // Adjust darkening to respect minimum difference
          if (standardLightness - darken < minAllowedLightness) {
            darken = Math.max(0, standardLightness - minAllowedLightness);
          }
        }
        
        return Math.max(standardLightness - darken, 1); // Don't go below 1% lightness
      }
    }
    
    // Return standard lightness if no adjustments apply
    return standardLightness;
  };
  
  // Handle direct hex color changes from the picker
  const handleHexChange = (newHex: string) => {
    const { h, s, l, a } = hexToHsla(newHex);
    updateColorProperty('hue', h);
    updateColorProperty('saturation', s);
    updateColorProperty('lightness', l);
  };
  
  // Update a specific property of the color token
  const updateColorProperty = (property: keyof ColorToken, value: number | string) => {
    dispatch({ 
      type: 'UPDATE_COLOR', 
      tokenName, 
      property, 
      value 
    });
  };

  // Handle input change for HSL values
  const handleInputChange = (property: keyof ColorToken, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const max = property === 'hue' ? 360 : 
                  property === 'alpha' ? 1 : 
                  property === 'steps' ? 12 : 
                  (property === 'saturation' && tokenName === 'neutrals') ? 5 : 100;
      const min = property === 'steps' ? 6 : 0;
      const clampedValue = Math.min(Math.max(value, min), max);
      updateColorProperty(property, clampedValue);
    }
  };

  // Generate color swatches based on step quantity
  const generateColorSwatches = () => {
    const steps = Math.round(color.steps);
    const swatches = [];
    const primaryStepIndex = getPrimaryStepIndex();
    
    // Calculate the base lightness and saturation values for all steps first
    const baseValues = [];
    
    // First pass - calculate standard distribution without adjustments
    for (let i = 0; i < steps; i++) {
      // Calculate lightness - start with the baseline distribution
      const baseMinLightness = 5;  // Darkest step
      const baseMaxLightness = 95; // Lightest step
      const baseLightnessRange = baseMaxLightness - baseMinLightness;
      const standardLightness = baseMaxLightness - (i / (steps - 1)) * baseLightnessRange;
      
      // Calculate saturation - ensure proper progression (lighter steps get less saturated)
      // For steps lighter than primary, reduce saturation progressively
      // For steps darker than primary, maintain or slightly increase saturation
      let stepSaturation = color.saturation;
      
      if (i < primaryStepIndex) {
        // For steps lighter than primary, reduce saturation progressively
        // The lightest step will have saturation reduced the most
        const saturationReductionFactor = 1 - ((primaryStepIndex - i) / primaryStepIndex) * 0.7;
        stepSaturation = color.saturation * saturationReductionFactor;
      } else if (i > primaryStepIndex) {
        // For steps darker than primary, maintain or slightly increase saturation
        // Avoid oversaturation by capping at 100%
        const darkStepIndex = i - primaryStepIndex;
        const totalDarkSteps = steps - primaryStepIndex - 1;
        const saturationBoostFactor = 1 + (darkStepIndex / totalDarkSteps) * 0.2; // Max 20% boost
        stepSaturation = Math.min(color.saturation * saturationBoostFactor, 100);
      }
      
      baseValues.push({ lightness: standardLightness, saturation: stepSaturation });
    }
    
    // Apply skew adjustments to lightness values
    const adjustedValues = [];
    
    // Second pass - apply skew adjustments to lightness
    for (let i = 0; i < steps; i++) {
      let adjustedLightness = baseValues[i].lightness;
      
      // Apply skew light intensity for steps below primary
      if (i < primaryStepIndex && color.skewLightIntensity > 0) {
        // Calculate normalized position from primary, scaled 0-1
        const distanceFromPrimary = (primaryStepIndex - i) / primaryStepIndex;
        
        // Curve effect gets stronger for lighter steps
        const curveExponent = 2.2;
        const curvedDistance = Math.pow(distanceFromPrimary, curveExponent);
        
        // Calculate boost amount based on intensity and position
        const intensityFactor = color.skewLightIntensity / 100;
        
        // Maximum possible lightness is 99% - prevents pure white
        const maxLightnessAllowed = 99;
        
        // Calculate the max possible boost (without hitting ceiling)
        const maxBoost = maxLightnessAllowed - baseValues[i].lightness;
        
        // Scale boost by position - first steps can get closer to max
        const positionScaleFactor = 
          i === 0 ? 0.95 :  // First step can reach 95% of max boost
          i === 1 ? 0.8 :   // Second step can reach 80% of max boost
          Math.max(0.7 - (i / primaryStepIndex) * 0.3, 0.4); // Others scaled down
        
        const boost = maxBoost * intensityFactor * curvedDistance * positionScaleFactor;
        adjustedLightness = baseValues[i].lightness + boost;
      }
      // Apply skew dark intensity for steps above primary
      else if (i > primaryStepIndex && color.skewDarkIntensity > 0) {
        const stepsAfterPrimary = steps - primaryStepIndex - 1;
        const distanceFromPrimary = (i - primaryStepIndex) / stepsAfterPrimary;
        
        // Curve effect gets stronger for darker steps
        const curveExponent = 2.2;
        const curvedDistance = Math.pow(distanceFromPrimary, curveExponent);
        
        // Calculate darkening amount based on intensity and position
        const intensityFactor = color.skewDarkIntensity / 100;
        
        // Minimum possible lightness is 1% - prevents pure black
        const minLightnessAllowed = 1;
        
        // Calculate the max possible darkening (without hitting floor)
        const maxDarken = baseValues[i].lightness - minLightnessAllowed;
        
        // Scale darkening by position - last steps can get closer to min
        const positionScaleFactor = 
          i === steps - 1 ? 0.95 :  // Last step can reach 95% of max darkening
          i === steps - 2 ? 0.8 :   // Second-to-last step can reach 80%
          Math.max(0.7 - ((steps - 1 - i) / stepsAfterPrimary) * 0.3, 0.4); // Others scaled
        
        const darken = maxDarken * intensityFactor * curvedDistance * positionScaleFactor;
        adjustedLightness = baseValues[i].lightness - darken;
      }
      
      adjustedValues.push({
        lightness: adjustedLightness,
        saturation: baseValues[i].saturation
      });
    }
    
    // Third pass - ensure proper progression and minimum differences
    // Each step must be darker and more saturated than the previous step
    for (let i = 1; i < steps; i++) {
      // Ensure each step is darker than the previous step
      const minLightnessDifference = 1.5; // Minimum 1.5% difference in lightness
      const maxLightness = adjustedValues[i-1].lightness - minLightnessDifference;
      
      if (adjustedValues[i].lightness > maxLightness) {
        adjustedValues[i].lightness = maxLightness;
      }
      
      // Ensure each step is more saturated than the previous step (for steps above primary)
      // For steps below primary, ensure decreasing saturation
      if (i > primaryStepIndex) {
        const minSaturationDifference = 1; // Minimum 1% difference in saturation
        const minSaturation = adjustedValues[i-1].saturation + minSaturationDifference;
        
        // Cap at 100% saturation
        adjustedValues[i].saturation = Math.min(Math.max(adjustedValues[i].saturation, minSaturation), 100);
      } else if (i < primaryStepIndex) {
        const minSaturationDifference = 1; // Minimum 1% difference in saturation
        const maxSaturation = adjustedValues[i+1].saturation - minSaturationDifference;
        
        // Ensure saturation stays positive
        adjustedValues[i].saturation = Math.max(Math.min(adjustedValues[i].saturation, maxSaturation), 0);
      }
    }
    
    // Generate the actual color swatches with calculated values
    for (let i = 0; i < steps; i++) {
      const stepLightness = adjustedValues[i].lightness;
      const stepSaturation = adjustedValues[i].saturation;
      
      const swatchHex = hslaToHex(
        color.hue, 
        stepSaturation, 
        stepLightness, 
        color.alpha
      );
      
      // Generate step number in hundreds (100, 200, 300, etc.)
      const stepValue = 100 * (i + 1);
      const stepLabel = `${tokenName}-${stepValue}`;
      const isPrimaryStep = i === primaryStepIndex;
      
      swatches.push(
        <div 
          key={i} 
          className="flex flex-col items-center" 
          style={{ flex: "1 0 calc(100% / Math.min(steps, 6) - 8px)" }}
        >
          <div 
            className={`w-full aspect-square rounded-md border mb-1 ${isPrimaryStep ? 'border-primary border-2' : 'border-border'}`}
            style={{ backgroundColor: swatchHex }}
          />
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground truncate max-w-full">{stepLabel}</span>
            {isPrimaryStep && (
              <span className="text-xs text-primary font-medium mt-0.5">Primary Step</span>
            )}
          </div>
        </div>
      );
    }
    
    return swatches;
  };
  
  return (
    <div className="mb-8 w-full">
      <div className="flex items-center mb-4">
        <Label className="text-lg font-medium">{label}</Label>
        <div 
          className="w-8 h-8 rounded-full border border-border cursor-pointer ml-3"
          style={{ backgroundColor: colorHex }}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        />
        {showSteps && (
          <span className="text-sm text-muted-foreground ml-auto">
            Primary: {tokenName}-{getPrimaryStepValue()}
          </span>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Controls column - 33% width */}
        <div className="w-full md:w-1/3 space-y-4">
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
                className="w-20 h-8 text-sm"
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
                max={tokenName === 'neutrals' ? 5 : 100} 
                step={1}
                value={[color.saturation]} 
                onValueChange={([value]) => updateColorProperty('saturation', value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={tokenName === 'neutrals' ? 5 : 100}
                value={Math.round(color.saturation)}
                onChange={(e) => handleInputChange('saturation', e)}
                className="w-20 h-8 text-sm"
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
                className="w-20 h-8 text-sm"
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
                className="w-20 h-8 text-sm"
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
                    min={6} 
                    max={12} 
                    step={1}
                    value={[color.steps]} 
                    onValueChange={([value]) => updateColorProperty('steps', value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={6}
                    max={12}
                    value={Math.round(color.steps)}
                    onChange={(e) => handleInputChange('steps', e)}
                    className="w-20 h-8 text-sm"
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
                    className="w-20 h-8 text-sm"
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
                    className="w-20 h-8 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Color swatches column - 67% width */}
        {showSteps && (
          <div className="w-full md:w-2/3">
            <div className="grid gap-4 p-2" 
                 style={{ 
                   gridTemplateColumns: `repeat(${Math.min(Math.round(color.steps), 6)}, 1fr)`, 
                   width: '100%' 
                 }}>
              {generateColorSwatches()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
