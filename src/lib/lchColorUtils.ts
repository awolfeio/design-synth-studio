import { formatHex, hsl, lch, rgb } from 'culori';
import { generateDualEasedSteps, generateSmartSaturationSteps } from './easingUtils';
import { EasingCurve } from '@/types/designTokens';

// Convert HSL to LCH
export function hslToLch(h: number, s: number, l: number, a: number = 1) {
  const hslColor = hsl({ h, s: s / 100, l: l / 100, alpha: a });
  const lchColor = lch(hslColor);
  return {
    l: lchColor?.l ?? 0,
    c: lchColor?.c ?? 0,
    h: lchColor?.h ?? 0,
    alpha: lchColor?.alpha ?? 1
  };
}

// Convert LCH to HSL
export function lchToHsl(l: number, c: number, h: number, a: number = 1) {
  const lchColor = lch({ l, c, h, alpha: a });
  const hslColor = hsl(lchColor);
  return {
    h: hslColor?.h ?? 0,
    s: (hslColor?.s ?? 0) * 100,
    l: (hslColor?.l ?? 0) * 100,
    alpha: hslColor?.alpha ?? 1
  };
}

// Convert LCH to hex
export function lchToHex(l: number, c: number, h: number, a: number = 1): string {
  const lchColor = lch({ l, c, h, alpha: a });
  const rgbColor = rgb(lchColor);
  return formatHex(rgbColor) ?? '#000000';
}

// Interpolate between two colors in LCH space
export function interpolateLch(
  color1: { l: number; c: number; h: number; alpha: number },
  color2: { l: number; c: number; h: number; alpha: number },
  t: number // 0 to 1
) {
  // Handle hue interpolation (shortest path around the color wheel)
  let h1 = color1.h;
  let h2 = color2.h;
  
  if (Math.abs(h2 - h1) > 180) {
    if (h2 > h1) {
      h1 += 360;
    } else {
      h2 += 360;
    }
  }
  
  return {
    l: color1.l + (color2.l - color1.l) * t,
    c: color1.c + (color2.c - color1.c) * t,
    h: ((h1 + (h2 - h1) * t) % 360 + 360) % 360,
    alpha: color1.alpha + (color2.alpha - color1.alpha) * t
  };
}

// Generate color scale in LCH space with easing curve support
export function generateLchColorScale(
  baseHue: number,
  baseSaturation: number,
  baseLightness: number,
  baseAlpha: number,
  steps: number,
  primaryStepIndex: number,
  lightnessEasingLight: EasingCurve,
  lightnessEasingDark: EasingCurve,
  saturationEasingLight: EasingCurve,
  saturationEasingDark: EasingCurve,
  customLightnessCurveLight?: number[],
  customLightnessCurveDark?: number[],
  customSaturationCurveLight?: number[],
  customSaturationCurveDark?: number[],
  tokenName?: string
): Array<{ h: number; s: number; l: number; a: number; hex: string }> {
  // Convert base color to LCH
  const baseLch = hslToLch(baseHue, baseSaturation, baseLightness, baseAlpha);
  
  // Define the lightness range in LCH (0-100)
  const minL = tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive' ? 25 : 5;
  const maxL = 95;
  
  // Generate lightness values using the same easing logic as HSL mode
  const lightnessValues = generateDualEasedSteps(
    steps,
    primaryStepIndex,
    baseLch.l, // Use LCH lightness instead of HSL
    minL,
    maxL,
    lightnessEasingLight,
    lightnessEasingDark,
    customLightnessCurveLight,
    customLightnessCurveDark
  );
  
  // Generate chroma values using smart saturation scaling
  // Convert saturation to chroma space for proper LCH handling
  const colorType = tokenName === 'neutrals' ? 'neutral' : 
                   (tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive') ? 'utility' : 'standard';
  
  const saturationValues = generateSmartSaturationSteps(
    steps,
    primaryStepIndex,
    baseSaturation,
    colorType,
    saturationEasingLight,
    saturationEasingDark,
    customSaturationCurveLight,
    customSaturationCurveDark
  );
  
  const result = [];
  
  for (let i = 0; i < steps; i++) {
    const stepL = lightnessValues[i];
    const stepSaturation = saturationValues[i];
    
    let stepC: number;
    
    if (i === primaryStepIndex) {
      // Use the base chroma for the primary step
      stepC = baseLch.c;
    } else {
      // Convert saturation to chroma based on lightness
      // Create a temporary HSL color to get the LCH chroma
      const tempLch = hslToLch(baseHue, stepSaturation, stepL, baseAlpha);
      stepC = tempLch.c;
      
      // Apply chroma adjustments based on lightness position
      // Lighter and darker colors typically have less chroma in perceptual color space
      const lightnessRatio = Math.abs(stepL - 50) / 50; // 0 at L=50, 1 at L=0 or L=100
      
      // For neutrals, reduce chroma more aggressively
      const chromaReduction = tokenName === 'neutrals' ? 0.8 : 0.3;
      stepC = stepC * (1 - lightnessRatio * chromaReduction);
      
      // Ensure chroma doesn't go negative
      stepC = Math.max(0, stepC);
    }
    
    // Convert back to HSL for consistency with existing system
    const hslColor = lchToHsl(stepL, stepC, baseLch.h, baseLch.alpha);
    const hex = lchToHex(stepL, stepC, baseLch.h, baseLch.alpha);
    
    result.push({
      h: hslColor.h,
      s: hslColor.s,
      l: hslColor.l,
      a: hslColor.alpha,
      hex
    });
  }
  
  return result;
} 