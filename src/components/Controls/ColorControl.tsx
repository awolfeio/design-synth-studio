import React, { useEffect } from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useContrastCheck } from '@/contexts/ContrastCheckContext';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ColorToken } from '@/types/designTokens';
import { HexColorPicker } from 'react-colorful';
import { hslaToHex, hexToHsla } from '@/lib/colorUtils';
import { ContrastColorPicker } from './ContrastColorPicker';
import { generateLchColorScale } from '@/lib/lchColorUtils';
import { generateEasedSteps, generateDualEasedSteps, generateSmartSaturationSteps } from '@/lib/easingUtils';
import { StepDistributionGraph } from '../Display/StepDistributionGraph';

// Helper function to calculate contrast ratio
// Convert hex to RGB
function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] 
    : [0, 0, 0];
}

// Convert HSLA to RGB
function hslaToRgb(h: number, s: number, l: number, a: number): number[] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Blend HSLA color with background color based on alpha
function blendWithBackground(h: number, s: number, l: number, a: number, backgroundRgb: number[] = [255, 255, 255]): number[] {
  // Convert HSLA to RGB
  const foregroundRgb = hslaToRgb(h, s, l, a);
  
  // Alpha blend with background
  const blendedRgb = foregroundRgb.map((fg, i) => {
    const bg = backgroundRgb[i];
    return Math.round(fg * a + bg * (1 - a));
  });
  
  return blendedRgb;
}

// Calculate relative luminance
function getLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map(c => {
    const val = c / 255;
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  
  const ratio = l1 > l2 
    ? (l1 + 0.05) / (l2 + 0.05) 
    : (l2 + 0.05) / (l1 + 0.05);
  
  return parseFloat(ratio.toFixed(2));
}

// Calculate contrast ratio for HSLA color with alpha blending
function calculateContrastRatioHSLA(h: number, s: number, l: number, a: number, textColor: string): number {
  // Get the actual perceived color after alpha blending with white background
  const blendedRgb = blendWithBackground(h, s, l, a);
  const textRgb = hexToRgb(textColor);
  
  const l1 = getLuminance(blendedRgb);
  const l2 = getLuminance(textRgb);
  
  const ratio = l1 > l2 
    ? (l1 + 0.05) / (l2 + 0.05) 
    : (l2 + 0.05) / (l1 + 0.05);
  
  return parseFloat(ratio.toFixed(2));
}

// Helper function to determine WCAG compliance level
function getWCAGCompliance(contrastRatio: number): { 
  AA: boolean; 
  AAA: boolean; 
} {
  return {
    AA: contrastRatio >= 4.5,
    AAA: contrastRatio >= 7.0
  };
}

// Import components for the radio buttons
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface ColorControlProps {
  tokenName: string;
  label: string;
  showSteps?: boolean;
  showContrastData?: boolean;
}

export const ColorControl: React.FC<ColorControlProps> = ({ 
  tokenName, 
  label, 
  showSteps = false,
  showContrastData = true
}) => {
  const { system, dispatch, leftColumnWidth, setLeftColumnWidth } = useDesignSystem();
  const { activeColorControl, setActiveColorControl, setControlProps } = useColorControl();
  const { comparisonColors } = useContrastCheck();
  const color = system.colors[tokenName];
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hexInputValue, setHexInputValue] = React.useState('');
  const [swatchWidth, setSwatchWidth] = React.useState(0);
  const swatchContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Check if this control is active
  const isActive = activeColorControl === tokenName;
  
  // Memoize the colorHex calculation to prevent unnecessary recomputation
  const colorHex = React.useMemo(() => {
    return hslaToHex(color.hue, color.saturation, color.lightness, color.alpha);
  }, [color.hue, color.saturation, color.lightness, color.alpha]);
  
  // Track if we're currently updating from hex picker to prevent feedback loops
  const isUpdatingFromHexRef = React.useRef(false);
  
  // Update hex input when color changes (but not when we're updating from hex picker)
  React.useEffect(() => {
    if (!isUpdatingFromHexRef.current) {
      setHexInputValue(colorHex);
    }
  }, [colorHex]);
  
  // Update control props when color or other values change
  React.useEffect(() => {
    if (isActive) {
      setControlProps({
        tokenName,
        label,
        showSteps,
        isPickerOpen,
        setIsPickerOpen,
        hexInputValue: colorHex, // Use colorHex directly instead of hexInputValue
        setHexInputValue,
        colorHex,
        handleHexChange,
        handleHexInputChange,
        handleHexInputSubmit,
        handleHexInputKeyPress,
        updateColorProperty,
        handleInputChange,
        getStepValue
      });
    }
  }, [isActive, colorHex, color, isPickerOpen]); // Update when color changes

  // Monitor swatch container dimensions
  React.useEffect(() => {
    if (!swatchContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setSwatchWidth(width);
      }
    });

    resizeObserver.observe(swatchContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [showSteps]);

  // Function to activate this color control in the sidebar
  const activateColorControl = () => {
    setActiveColorControl(tokenName);
    setControlProps({
      tokenName,
      label,
      showSteps,
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
    });
  };
  
  // Compute the primary step index (middle-most, rounding up)
  const getPrimaryStepIndex = (): number => {
    const steps = Math.round(color.steps);
    
    // If primaryStepIndex is defined, use it (applies to all colors now)
    if (color.primaryStepIndex !== undefined) {
      return Math.max(0, Math.min(color.primaryStepIndex, steps - 1));
    }
    
    // Fallback logic for colors without primaryStepIndex defined
    // Special handling for utility colors (Success, Warning, Destructive)
    const isUtilityColor = tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive';
    
    if (isUtilityColor) {
      // For utility colors, ensure at most 2 steps are darker than primary
      // This means primary should be at position where there are at most 2 steps after it
      const maxDarkerSteps = 2;
      const primaryIndex = Math.max(0, steps - maxDarkerSteps - 1);
      return primaryIndex;
    }
    
    // Standard logic for other colors
    // Account for extra steps (primary-50 and primary-25)
    const extraSteps = Math.max(0, steps - 12);
    
    return Math.ceil((steps - extraSteps) / 2) - 1 + extraSteps; // 0-based index, so subtract 1
  };
  
  // Get the primary step value (e.g., 500, 600, 700)
  const getPrimaryStepValue = (): number => {
    return (getPrimaryStepIndex() - getExtraStepsCount() + 1) * 100;
  };
  
  // Get the number of extra steps added (primary-50, primary-25)
  const getExtraStepsCount = (): number => {
    const steps = Math.round(color.steps);
    return Math.max(0, steps - 12);
  };
  
  // Get the step value (e.g., 25, 50, 100, 200...) for a given index
  const getStepValue = (index: number): number => {
    const extraSteps = getExtraStepsCount();
    
    // If this is one of the extra steps (primary-50 or primary-25)
    if (index < extraSteps) {
      // For index 0 with 2 extra steps, return 25
      // For index 0 with 1 extra step, return 50
      // For index 1 with 2 extra steps, return 50
      return index === 0 && extraSteps === 2 ? 25 : 50;
    }
    
    // Otherwise, standard 100-based scale
    return (index - extraSteps + 1) * 100;
  };
  
  // Get the step label (e.g., primary-25, primary-50, primary-100, etc.) for a given index
  const getStepLabel = (index: number): string => {
    const stepValue = getStepValue(index);
    return `${tokenName}-${stepValue}`;
  };

  const getColumnsPerRow = (): number => {
    const steps = Math.round(color.steps);
    
    // Special handling for utility colors - always single row
    const isUtilityColor = tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive';
    if (isUtilityColor) {
      return steps; // Always single row for utility colors (3-7 steps)
    }
    
    // Custom column layout based on step quantity for other colors
    switch (steps) {
      case 9:
        return 5; // 5 swatches per row (2 rows: 5+4)
      case 10:
        return 5; // 5 swatches per row (2 rows: 5+5)
      case 11:
        return 6; // 6 swatches per row (2 rows: 6+5)
      case 12:
        return 6; // 6 swatches per row (2 rows: 6+6)
      case 13:
        return 7; // 7 swatches per row (2 rows: 7+6)
      case 14:
        return 7; // 7 swatches per row (2 rows: 7+7)
      default:
        // For other step quantities, use reasonable defaults
        if (steps <= 6) return steps; // Single row for 6 or fewer
        if (steps <= 8) return 4;     // 4 per row for 7-8 steps
        return Math.ceil(steps / 2);  // Two rows for larger quantities
    }
  };

  // Calculate lightness for a specific step with intensity adjustments
  const getLightnessForStep = (stepIndex: number, totalSteps: number): number => {
    const steps = totalSteps;
    const primaryIndex = getPrimaryStepIndex();
    
    // Special handling for colors with custom primary step positioning
    if (color.primaryStepIndex !== undefined) {
      const primaryLightness = color.lightness;
      const minLightness = 5;   // Darkest possible
      const maxLightness = 95;  // Lightest possible
      
      if (stepIndex === primaryIndex) {
        // This is the primary step, use the actual lightness value
        return primaryLightness;
      } else if (stepIndex < primaryIndex) {
        // Steps lighter than primary - distribute evenly from primary to max
        const lighterSteps = primaryIndex;
        const availableRange = maxLightness - primaryLightness;
        const stepSize = lighterSteps > 0 ? availableRange / lighterSteps : 0;
        return primaryLightness + (primaryIndex - stepIndex) * stepSize;
      } else {
        // Steps darker than primary - distribute evenly from primary to min
        const darkerSteps = steps - primaryIndex - 1;
        const availableRange = primaryLightness - minLightness;
        const stepSize = darkerSteps > 0 ? availableRange / darkerSteps : 0;
        return primaryLightness - (stepIndex - primaryIndex) * stepSize;
      }
    }
    
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
  
  // Debounced hex change handler to prevent rapid updates
  const debouncedHexChangeRef = React.useRef<NodeJS.Timeout>();

  // Handle hex input field changes
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHexInputValue(inputValue);
  };

  // Handle hex input field blur/enter to apply the color
  const handleHexInputSubmit = () => {
    let hexValue = hexInputValue.trim();
    
    // Add # if not present
    if (hexValue && !hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }
    
    // Validate hex format (3 or 6 characters after #)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (hexRegex.test(hexValue)) {
      // Convert 3-digit hex to 6-digit
      if (hexValue.length === 4) {
        hexValue = '#' + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2] + hexValue[3] + hexValue[3];
      }
      
      try {
        const { h, s, l, a } = hexToHsla(hexValue);
        updateColorProperty('hue', h);
        // Cap saturation at 15% for neutrals
        const saturation = tokenName === 'neutrals' ? Math.min(s, 15) : s;
        updateColorProperty('saturation', saturation);
        updateColorProperty('lightness', l);
      } catch (error) {
        // If conversion fails, revert to current color
        setHexInputValue(colorHex);
      }
    } else {
      // Invalid hex, revert to current color
      setHexInputValue(colorHex);
    }
  };

  // Handle Enter key press in hex input
  const handleHexInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHexInputSubmit();
      e.currentTarget.blur();
    }
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

  // Handle direct hex color changes from the picker
  const handleHexChange = React.useCallback((newHex: string) => {
    // Clear any pending debounced updates
    if (debouncedHexChangeRef.current) {
      clearTimeout(debouncedHexChangeRef.current);
    }
    
    // Set flag to prevent feedback loop
    isUpdatingFromHexRef.current = true;
    
    // Debounce the actual update to prevent jittering
    debouncedHexChangeRef.current = setTimeout(() => {
      try {
        const { h, s, l, a } = hexToHsla(newHex);
        
        // Only update if the values are actually different (with tolerance for rounding)
        const tolerance = 0.3; // Slightly more sensitive
        const hueChanged = Math.abs(color.hue - h) > tolerance;
        const saturationChanged = Math.abs(color.saturation - (tokenName === 'neutrals' ? Math.min(s, 15) : s)) > tolerance;
        const lightnessChanged = Math.abs(color.lightness - l) > tolerance;
        
        if (hueChanged || saturationChanged || lightnessChanged) {
          // Batch the updates to prevent multiple re-renders
          const updates: Array<{ property: keyof ColorToken; value: number }> = [];
          
          if (hueChanged) {
            updates.push({ property: 'hue', value: h });
          }
          
          if (saturationChanged) {
            const saturation = tokenName === 'neutrals' ? Math.min(s, 15) : s;
            updates.push({ property: 'saturation', value: saturation });
          }
          
          if (lightnessChanged) {
            updates.push({ property: 'lightness', value: l });
          }
          
          // Apply all updates at once
          updates.forEach(({ property, value }) => {
            updateColorProperty(property, value);
          });
        }
      } catch (error) {
        console.warn('Failed to parse hex color:', newHex, error);
      } finally {
        // Reset the flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isUpdatingFromHexRef.current = false;
        }, 25); // Faster reset for more responsiveness
      }
    }, 8); // ~120fps debouncing for more responsive feel
  }, [color.hue, color.saturation, color.lightness, tokenName, updateColorProperty]);

  // Handle input change for HSL values
  const handleInputChange = (property: keyof ColorToken, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      let max, min;
      
      if (property === 'hue') {
        max = 360;
        min = 0;
      } else if (property === 'alpha') {
        max = 1;
        min = 0;
      } else if (property === 'steps') {
        // Different step limits for different color types
        if (tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive') {
          max = 7;  // Utility colors max 7 steps
          min = 3;  // Minimum 3 steps to have at least primary + 1 lighter + 1 darker
        } else {
          max = 14; // Standard colors
          min = 6;
        }
      } else if (property === 'saturation' && tokenName === 'neutrals') {
        max = 15;
        min = 0;
      } else {
        max = 100;
        min = 0;
      }
      
      const clampedValue = Math.min(Math.max(value, min), max);
      updateColorProperty(property, clampedValue);
    }
  };

  // Handle draggable splitter
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Get the container element
    const container = document.querySelector(`[data-color-control="${tokenName}"]`) as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate new width percentage (with constraints)
    let newLeftWidth = (mouseX / containerWidth) * 100;
    newLeftWidth = Math.max(20, Math.min(40, newLeftWidth)); // Constrain between 20% and 40%
    
    setLeftColumnWidth(newLeftWidth);
  }, [isDragging, tokenName]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup debounced hex changes on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedHexChangeRef.current) {
        clearTimeout(debouncedHexChangeRef.current);
      }
    };
  }, []);

  // Generate color swatches based on step quantity
  const generateColorSwatches = () => {
    const steps = Math.round(color.steps);
    const swatches = [];
    const primaryStepIndex = getPrimaryStepIndex();
    const extraSteps = getExtraStepsCount();
    
    // Use LCH mode if enabled
    if (system.colorInterpolationMode === 'lch' && showSteps) {
      const lchScale = generateLchColorScale(
        color.hue,                                    // 1. baseHue
        color.saturation,                             // 2. baseSaturation
        color.lightness,                              // 3. baseLightness
        color.alpha,                                  // 4. baseAlpha
        steps,                                        // 5. steps
        primaryStepIndex,                             // 6. primaryStepIndex
        color.lightnessEasingLight || 'ease-out',     // 7. lightnessEasingLight
        color.lightnessEasingDark || 'ease-in',       // 8. lightnessEasingDark
        color.saturationEasingLight || 'linear',      // 9. saturationEasingLight
        color.saturationEasingDark || 'linear',       // 10. saturationEasingDark
        color.customLightnessCurveLight,              // 11. customLightnessCurveLight
        color.customLightnessCurveDark,               // 12. customLightnessCurveDark
        color.customSaturationCurveLight,             // 13. customSaturationCurveLight
        color.customSaturationCurveDark,              // 14. customSaturationCurveDark
        tokenName                                     // 15. tokenName
      );
      
      // Generate swatches from LCH scale
      for (let i = 0; i < steps; i++) {
        const stepColor = lchScale[i];
        const swatchHex = stepColor.hex;
        
        // Check for custom comparison color
        const comparisonKey = `${tokenName}-${i}`;
        const customComparisonColor = comparisonColors[comparisonKey];
        
        // Calculate contrast ratios
        let contrastData;
        if (customComparisonColor) {
          const customContrast = calculateContrastRatio(swatchHex, customComparisonColor);
          const customCompliance = getWCAGCompliance(customContrast);
          contrastData = {
            color: customComparisonColor,
            contrast: customContrast,
            compliance: customCompliance,
            isCustom: true
          };
        } else {
          const whiteContrast = calculateContrastRatio(swatchHex, "#FFFFFF");
          const blackContrast = calculateContrastRatio(swatchHex, "#000000");
          
          const whiteCompliance = getWCAGCompliance(whiteContrast);
          const blackCompliance = getWCAGCompliance(blackContrast);
          
          contrastData = {
            whiteContrast,
            blackContrast,
            whiteCompliance,
            blackCompliance,
            isCustom: false
          };
        }
        
        // Generate step number
        const stepValue = getStepValue(i);
        const stepLabel = `${tokenName}-${stepValue}`;
        const isPrimaryStep = i === primaryStepIndex;
        
        swatches.push(
          <div 
            key={i} 
            className="flex flex-col items-center" 
            style={{ flex: "1 0 calc(100% / Math.min(steps, 6) - 4px)" }}
          >
            <div 
              className={`w-full aspect-square mb-1 ${isPrimaryStep ? 'p-0.5' : ''}`}
              style={isPrimaryStep ? { 
                border: '2px solid black',
                borderRadius: '18px'
              } : {}}
            >
              <div 
                className={`w-full h-full border relative p-4 ${isPrimaryStep ? 'border-transparent' : 'border-border'}`}
                style={{ backgroundColor: swatchHex, borderRadius: '16px' }}
              >
              {/* Contrast color picker - only show when showContrastData is true */}
              {showContrastData && (
                <div className="absolute top-2 left-2">
                  <ContrastColorPicker 
                    tokenName={tokenName}
                    stepIndex={i}
                    currentColor={swatchHex}
                    useWhiteIcon={!(!contrastData.isCustom && contrastData.blackCompliance.AA)}
                  />
                </div>
              )}
              
              {/* Contrast labels - only show when showContrastData is true */}
              {showContrastData && (
                <div className="absolute top-4 right-4 flex flex-col gap-1 text-xs font-mono">
                  {contrastData.isCustom ? (
                    // Custom comparison color
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-border" 
                        style={{ backgroundColor: contrastData.color }}
                      />
                      <div className="flex gap-1">
                        {contrastData.compliance.AA && (
                          <span className="text-black bg-white/90 px-1 rounded">
                            AA ✓
                          </span>
                        )}
                        {contrastData.compliance.AAA && (
                          <span className="text-black bg-white/90 px-1 rounded">
                            AAA ✓
                          </span>
                        )}
                        {!contrastData.compliance.AA && (
                          <span className="text-black bg-white/90 px-1 rounded">
                            {contrastData.contrast.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* White text indicators */}
                      {(contrastData.whiteCompliance.AA || contrastData.whiteCompliance.AAA) && (
                        <div className="flex gap-1">
                          {contrastData.whiteCompliance.AA && (
                            <span className="text-white">
                              AA ✓
                            </span>
                          )}
                          {contrastData.whiteCompliance.AAA && (
                            <span className="text-white">
                              AAA ✓
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Black text indicators */}
                      {(contrastData.blackCompliance.AA || contrastData.blackCompliance.AAA) && (
                        <div className="flex gap-1">
                          {contrastData.blackCompliance.AA && (
                            <span className="text-black">
                              AA ✓
                            </span>
                          )}
                          {contrastData.blackCompliance.AAA && (
                            <span className="text-black">
                              AAA ✓
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Color values overlay */}
              <div className="absolute bottom-2 left-2 flex flex-col text-xs font-mono leading-tight">
                <span className={`${!contrastData.isCustom && contrastData.blackCompliance.AA ? 'text-black' : 'text-white'} drop-shadow-sm`}>{swatchHex}</span>
                <span className={`${!contrastData.isCustom && contrastData.blackCompliance.AA ? 'text-black' : 'text-white'} drop-shadow-sm`}>
                  {(() => {
                    const columnsPerRow = getColumnsPerRow();
                    const individualSwatchWidth = swatchWidth / columnsPerRow;
                    const showPercentage = individualSwatchWidth >= 200;
                    
                    return showPercentage
                      ? `hsla(${Math.round(stepColor.h)}, ${Math.round(stepColor.s)}%, ${Math.round(stepColor.l)}%, ${stepColor.a.toFixed(2)})`
                      : `hsla(${Math.round(stepColor.h)}, ${Math.round(stepColor.s)}, ${Math.round(stepColor.l)}, ${stepColor.a.toFixed(2)})`;
                  })()}
                </span>
              </div>
              </div>
            </div>
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
    }
    
    // NEW APPROACH: Use primary color's actual lightness as anchor point
    // and ensure each step has unique lightness values with proper spacing
    
    const primaryLightness = color.lightness;
    const minLightness = 2;   // Darkest possible
    const maxLightness = 98;  // Lightest possible
    const minStepDifference = 1; // Minimum 1% difference between steps
    
    // Calculate how much lightness space we have for steps
    const lighterSteps = primaryStepIndex; // Steps lighter than primary
    const darkerSteps = steps - primaryStepIndex - 1; // Steps darker than primary
    
    // Special handling for utility colors (Success, Warning, Destructive) with limited steps
    const isUtilityColor = (tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive');
    let adjustedMinLightness = minLightness;
    
    if (isUtilityColor) {
      // For utility colors, don't let the darkest step go below 25% lightness
      // This ensures the darkest step is only as dark as what would be the second-darkest
      adjustedMinLightness = 25;
    }
    
    // Calculate available lightness ranges
    const lighterRange = maxLightness - primaryLightness; // Space above primary
    const darkerRange = primaryLightness - adjustedMinLightness;  // Space below primary
    
    // Check if we have enough space for all steps with minimum differences
    const requiredLighterSpace = lighterSteps * minStepDifference;
    const requiredDarkerSpace = darkerSteps * minStepDifference;
    
    // Calculate actual step sizes, adjusting if we don't have enough space
    let lighterStepSize = lighterSteps > 0 ? Math.max(lighterRange / lighterSteps, minStepDifference) : 0;
    let darkerStepSize = darkerSteps > 0 ? Math.max(darkerRange / darkerSteps, minStepDifference) : 0;
    
    // If we don't have enough space, compress step sizes but maintain minimum differences
    if (requiredLighterSpace > lighterRange && lighterSteps > 0) {
      lighterStepSize = Math.max(lighterRange / lighterSteps, minStepDifference);
    }
    
    if (requiredDarkerSpace > darkerRange && darkerSteps > 0) {
      darkerStepSize = Math.max(darkerRange / darkerSteps, minStepDifference);
    }
    
    // Generate lightness values using dual easing curves if available
    // Always use dual easing since we have defaults
    const lightnessValues = generateDualEasedSteps(
      steps,
      primaryStepIndex,
      primaryLightness,
      adjustedMinLightness,
      maxLightness,
      color.lightnessEasingLight || 'ease-out',
      color.lightnessEasingDark || 'ease-in',
      color.customLightnessCurveLight,
      color.customLightnessCurveDark
    );
    
    // Generate saturation values using smart saturation scaling
    const saturationValues = generateSmartSaturationSteps(
      steps,
      primaryStepIndex,
      color.saturation,
      tokenName === 'neutrals' ? 'neutral' : 
      isUtilityColor ? 'utility' : 'standard',
      color.saturationEasingLight || 'linear',
      color.saturationEasingDark || 'linear',
      color.customSaturationCurveLight,
      color.customSaturationCurveDark
    );
    
    // Use the easing-based values directly
    const adjustedValues = [];
    
    for (let i = 0; i < steps; i++) {
      adjustedValues.push({
        lightness: lightnessValues[i],
        saturation: saturationValues[i]
      });
    }
    
    // The easing curves should already produce valid values, but let's ensure minimum differences
    // for edge cases where the range is too small
    for (let i = 1; i < steps; i++) {
      const currentLightness = adjustedValues[i].lightness;
      const previousLightness = adjustedValues[i-1].lightness;
      
      // Ensure each step is at least minStepDifference darker than the previous
      if (currentLightness >= previousLightness - minStepDifference) {
        adjustedValues[i].lightness = Math.max(
          previousLightness - minStepDifference,
          adjustedMinLightness
        );
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
      
      // Check for custom comparison color
      const comparisonKey = `${tokenName}-${i}`;
      const customComparisonColor = comparisonColors[comparisonKey];
      
      // Calculate contrast ratios using alpha-aware method
      let contrastData;
      if (customComparisonColor) {
        // Use custom comparison color
        const customContrast = calculateContrastRatio(swatchHex, customComparisonColor);
        const customCompliance = getWCAGCompliance(customContrast);
        contrastData = {
          color: customComparisonColor,
          contrast: customContrast,
          compliance: customCompliance,
          isCustom: true
        };
      } else {
        // Default to white and black
        const whiteContrast = calculateContrastRatioHSLA(color.hue, stepSaturation, stepLightness, color.alpha, "#FFFFFF");
        const blackContrast = calculateContrastRatioHSLA(color.hue, stepSaturation, stepLightness, color.alpha, "#000000");
        
        const whiteCompliance = getWCAGCompliance(whiteContrast);
        const blackCompliance = getWCAGCompliance(blackContrast);
        
        contrastData = {
          whiteContrast,
          blackContrast,
          whiteCompliance,
          blackCompliance,
          isCustom: false
        };
      }
      
      // Generate step number (25, 50, 100, 200, 300, etc.)
      const stepValue = getStepValue(i);
      const stepLabel = `${tokenName}-${stepValue}`;
      const isPrimaryStep = i === primaryStepIndex;
      
      swatches.push(
        <div 
          key={i} 
          className="flex flex-col items-center" 
          style={{ flex: "1 0 calc(100% / Math.min(steps, 6) - 4px)" }}
        >
          <div 
            className={`w-full aspect-square mb-1 ${isPrimaryStep ? 'p-0.5' : ''}`}
            style={isPrimaryStep ? { 
              border: '2px solid black',
              borderRadius: '18px'
            } : {}}
          >
            <div 
              className={`w-full h-full border relative p-4 ${isPrimaryStep ? 'border-transparent' : 'border-border'}`}
              style={{ backgroundColor: swatchHex, borderRadius: '16px' }}
            >
            {/* Contrast color picker - only show when showContrastData is true */}
            {showContrastData && (
              <div className="absolute top-2 left-2">
                <ContrastColorPicker 
                  tokenName={tokenName}
                  stepIndex={i}
                  currentColor={swatchHex}
                  useWhiteIcon={!(!contrastData.isCustom && contrastData.blackCompliance.AA)}
                />
              </div>
            )}
            
            {/* Contrast labels - only show when showContrastData is true */}
            {showContrastData && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs font-mono">
                {contrastData.isCustom ? (
                  // Custom comparison color
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-border" 
                      style={{ backgroundColor: contrastData.color }}
                    />
                    <div className="flex gap-1">
                      {contrastData.compliance.AA && (
                        <span className="text-black bg-white/90 px-1 rounded">
                          AA ✓
                        </span>
                      )}
                      {contrastData.compliance.AAA && (
                        <span className="text-black bg-white/90 px-1 rounded">
                          AAA ✓
                        </span>
                      )}
                      {!contrastData.compliance.AA && (
                        <span className="text-black bg-white/90 px-1 rounded">
                          {contrastData.contrast.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* White text indicators */}
                    {(contrastData.whiteCompliance.AA || contrastData.whiteCompliance.AAA) && (
                      <div className="flex gap-1">
                        {contrastData.whiteCompliance.AA && (
                          <span className="text-white">
                            AA ✓
                          </span>
                        )}
                        {contrastData.whiteCompliance.AAA && (
                          <span className="text-white">
                            AAA ✓
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Black text indicators */}
                    {(contrastData.blackCompliance.AA || contrastData.blackCompliance.AAA) && (
                      <div className="flex gap-1">
                        {contrastData.blackCompliance.AA && (
                          <span className="text-black">
                            AA ✓
                          </span>
                        )}
                        {contrastData.blackCompliance.AAA && (
                          <span className="text-black">
                            AAA ✓
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Color values overlay */}
            <div className="absolute bottom-2 left-2 flex flex-col text-xs font-mono leading-tight">
              <span className={`${!contrastData.isCustom && contrastData.blackCompliance.AA ? 'text-black' : 'text-white'} drop-shadow-sm`}>{swatchHex}</span>
              <span className={`${!contrastData.isCustom && contrastData.blackCompliance.AA ? 'text-black' : 'text-white'} drop-shadow-sm`}>
                {(() => {
                  // Calculate individual swatch width - divide container width by columns per row
                  const columnsPerRow = getColumnsPerRow();
                  const individualSwatchWidth = swatchWidth / columnsPerRow;
                  const showPercentage = individualSwatchWidth >= 200;
                  
                  return showPercentage
                    ? `hsla(${Math.round(color.hue)}, ${Math.round(stepSaturation)}%, ${Math.round(stepLightness)}%, ${color.alpha.toFixed(2)})`
                    : `hsla(${Math.round(color.hue)}, ${Math.round(stepSaturation)}, ${Math.round(stepLightness)}, ${color.alpha.toFixed(2)})`;
                })()}
              </span>
            </div>
            </div>
          </div>
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
    <div 
      className={`mb-8 w-full cursor-pointer rounded-xl p-4 transition-all hover:bg-gray-50/80 active:bg-gray-100/80 ${
        isActive ? 'outline outline-2 outline-black outline-offset-2' : ''
      }`} 
      data-color-control={tokenName} 
      onClick={activateColorControl}
    >
      <div className="flex items-center mb-4">
        <Label className="text-lg font-medium">{label}</Label>
        <div className="flex items-center gap-3 ml-3">
          <div 
            className="w-8 h-8 rounded-full border border-border"
            style={{ backgroundColor: colorHex }}
          />
          <span className="text-xs text-muted-foreground font-mono">{colorHex}</span>
        </div>
      </div>
      
      {/* Color swatches display */}
      {showSteps && (
        <>
          <div ref={swatchContainerRef}
               className="grid gap-2 p-2" 
               style={{ 
                 gridTemplateColumns: `repeat(${getColumnsPerRow()}, 1fr)`, 
                 width: '100%' 
               }}
               key={`${color.lightnessCompression}-${color.darknessCompression}-${color.lightnessEasingLight}-${color.lightnessEasingDark}-${JSON.stringify(color.customLightnessCurveLight)}-${JSON.stringify(color.customLightnessCurveDark)}`}>
            {generateColorSwatches()}
          </div>
          
          {/* Step distribution graph */}
          <div className="w-full px-2 mt-4" key={`graph-${color.lightnessCompression}-${color.darknessCompression}-${color.lightnessEasingLight}-${color.lightnessEasingDark}-${JSON.stringify(color.customLightnessCurveLight)}-${JSON.stringify(color.customLightnessCurveDark)}`}>
            <StepDistributionGraph
              lightnessValues={(() => {
                const steps = Math.round(color.steps);
                const primaryStepIndex = getPrimaryStepIndex();
                
                // Generate the same lightness values as used in the swatches
                // Always use dual easing since we have defaults
                return generateDualEasedSteps(
                  steps,
                  primaryStepIndex,
                  color.lightness,
                  tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 25 : 2,
                  98,
                  color.lightnessEasingLight || 'ease-out',
                  color.lightnessEasingDark || 'ease-in',
                  color.customLightnessCurveLight,
                  color.customLightnessCurveDark
                );
              })()}
              primaryStepIndex={getPrimaryStepIndex()}
              primaryColor={(() => {
                // Use the current color's primary step for the primary dot color
                switch (tokenName) {
                  case 'secondary':
                    return hslaToHex(system.colors.secondary.hue, system.colors.secondary.saturation, system.colors.secondary.lightness, system.colors.secondary.alpha);
                  case 'accent':
                    return hslaToHex(system.colors.accent.hue, system.colors.accent.saturation, system.colors.accent.lightness, system.colors.accent.alpha);
                  case 'neutrals':
                    return hslaToHex(system.colors.neutrals.hue, system.colors.neutrals.saturation, system.colors.neutrals.lightness, system.colors.neutrals.alpha);
                  case 'success':
                    return hslaToHex(system.colors.success.hue, system.colors.success.saturation, system.colors.success.lightness, system.colors.success.alpha);
                  case 'warning':
                    return hslaToHex(system.colors.warning.hue, system.colors.warning.saturation, system.colors.warning.lightness, system.colors.warning.alpha);
                  case 'destructive':
                    return hslaToHex(system.colors.destructive.hue, system.colors.destructive.saturation, system.colors.destructive.lightness, system.colors.destructive.alpha);
                  default:
                    return hslaToHex(system.colors.primary.hue, system.colors.primary.saturation, system.colors.primary.lightness, system.colors.primary.alpha);
                }
              })()}
              secondaryColor={hslaToHex(system.colors.secondary.hue, system.colors.secondary.saturation, system.colors.secondary.lightness, system.colors.secondary.alpha)}
            />
          </div>
        </>
      )}
    </div>
  );
};
