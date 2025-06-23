import BezierEasing from 'bezier-easing';
import { EasingCurve } from '@/types/designTokens';

// Predefined easing curves
const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': BezierEasing(0.42, 0, 1, 1),
  'ease-out': BezierEasing(0, 0, 0.58, 1),
  'ease-in-out': BezierEasing(0.42, 0, 0.58, 1),
  'ease-in-cubic': BezierEasing(0.55, 0.055, 0.675, 0.19),
  'ease-out-cubic': BezierEasing(0.215, 0.61, 0.355, 1),
};

// Get easing function
export function getEasingFunction(
  curve: EasingCurve = 'linear',
  customCurve?: number[]
): (t: number) => number {
  if (curve === 'custom' && customCurve && customCurve.length === 4) {
    return BezierEasing(customCurve[0], customCurve[1], customCurve[2], customCurve[3]);
  }
  
  return easingFunctions[curve] || easingFunctions.linear;
}

// Apply easing to a value range
export function applyEasing(
  t: number, // 0 to 1
  min: number,
  max: number,
  easingFn: (t: number) => number
): number {
  const easedT = easingFn(t);
  return min + (max - min) * easedT;
}

// Generate eased values for color steps
export function generateEasedSteps(
  steps: number,
  primaryIndex: number,
  primaryValue: number,
  minValue: number,
  maxValue: number,
  easingCurve: EasingCurve = 'linear',
  customCurve?: number[]
): number[] {
  const easingFn = getEasingFunction(easingCurve, customCurve);
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    if (i === primaryIndex) {
      // Use the primary value for the primary step
      values.push(primaryValue);
    } else if (i < primaryIndex) {
      // Steps lighter than primary
      const t = i / primaryIndex; // 0 to 1 from lightest to primary
      const easedValue = applyEasing(t, maxValue, primaryValue, easingFn);
      values.push(easedValue);
    } else {
      // Steps darker than primary
      const t = (i - primaryIndex) / (steps - primaryIndex - 1); // 0 to 1 from primary to darkest
      const easedValue = applyEasing(t, primaryValue, minValue, easingFn);
      values.push(easedValue);
    }
  }
  
  return values;
}

// Generate eased values with dual curves for light and dark ranges
export function generateDualEasedSteps(
  steps: number,
  primaryIndex: number,
  primaryValue: number,
  minValue: number,
  maxValue: number,
  lightEasingCurve: EasingCurve = 'linear',
  darkEasingCurve: EasingCurve = 'linear',
  customLightCurve?: number[],
  customDarkCurve?: number[]
): number[] {
  const lightEasingFn = getEasingFunction(lightEasingCurve, customLightCurve);
  const darkEasingFn = getEasingFunction(darkEasingCurve, customDarkCurve);
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    if (i === primaryIndex) {
      // Use the primary value for the primary step
      values.push(primaryValue);
    } else if (i < primaryIndex) {
      // Steps lighter than primary - use light range easing
      const t = i / primaryIndex; // 0 to 1 from lightest to primary
      const easedValue = applyEasing(t, maxValue, primaryValue, lightEasingFn);
      values.push(easedValue);
    } else {
      // Steps darker than primary - use dark range easing
      const t = (i - primaryIndex) / (steps - primaryIndex - 1); // 0 to 1 from primary to darkest
      const easedValue = applyEasing(t, primaryValue, minValue, darkEasingFn);
      values.push(easedValue);
    }
  }
  
  return values;
}

// Generate smart saturation values that scale proportionally with primary saturation
export function generateSmartSaturationSteps(
  steps: number,
  primaryIndex: number,
  primarySaturation: number,
  colorType: 'standard' | 'neutral' | 'utility',
  lightEasingCurve: EasingCurve = 'linear',
  darkEasingCurve: EasingCurve = 'linear',
  customLightCurve?: number[],
  customDarkCurve?: number[]
): number[] {
  // Special handling for neutrals - always cap at 15%
  if (colorType === 'neutral') {
    primarySaturation = Math.min(primarySaturation, 15);
  }
  
  // Determine min and max saturation based on primary saturation value
  let minSaturation: number;
  let maxSaturation: number;
  
  if (primarySaturation <= 10) {
    // Very low saturation: create near-grayscale with subtle variations
    minSaturation = 0;
    maxSaturation = Math.min(15, primarySaturation * 1.5);
  } else if (primarySaturation <= 30) {
    // Low saturation: scale proportionally for muted colors
    minSaturation = primarySaturation * 0.3;
    maxSaturation = primarySaturation * 1.5;
  } else if (primarySaturation <= 70) {
    // Medium saturation: balanced range
    minSaturation = primarySaturation * 0.5;
    maxSaturation = Math.min(100, primarySaturation + 30);
  } else {
    // High saturation: allow full range but keep minimum relatively high
    minSaturation = primarySaturation * 0.6;
    maxSaturation = 100;
  }
  
  // For utility colors, use tighter ranges for consistency
  if (colorType === 'utility') {
    const range = maxSaturation - minSaturation;
    const tighterRange = range * 0.6; // Reduce range by 40%
    const midpoint = (minSaturation + maxSaturation) / 2;
    minSaturation = midpoint - tighterRange / 2;
    maxSaturation = midpoint + tighterRange / 2;
  }
  
  // Cap values for neutrals
  if (colorType === 'neutral') {
    maxSaturation = Math.min(maxSaturation, 15);
    minSaturation = Math.min(minSaturation, 15);
  }
  
  // Use the existing dual easing logic with our calculated range
  const lightEasingFn = getEasingFunction(lightEasingCurve, customLightCurve);
  const darkEasingFn = getEasingFunction(darkEasingCurve, customDarkCurve);
  const values: number[] = [];
  
  for (let i = 0; i < steps; i++) {
    if (i === primaryIndex) {
      // Use the primary value for the primary step
      values.push(primarySaturation);
    } else if (i < primaryIndex) {
      // Steps lighter than primary - typically less saturated
      const t = i / primaryIndex; // 0 to 1 from lightest to primary
      const easedValue = applyEasing(t, minSaturation, primarySaturation, lightEasingFn);
      values.push(Math.max(0, Math.min(100, easedValue)));
    } else {
      // Steps darker than primary - can be more saturated
      const t = (i - primaryIndex) / (steps - primaryIndex - 1); // 0 to 1 from primary to darkest
      const easedValue = applyEasing(t, primarySaturation, maxSaturation, darkEasingFn);
      values.push(Math.max(0, Math.min(100, easedValue)));
    }
  }
  
  return values;
}

// Convert compression value (-100 to 100) to easing curve
export function compressionToEasing(compression: number): EasingCurve {
  // Map compression values to appropriate easing curves
  if (compression === 0) return 'linear';
  if (compression > 0) {
    // Positive compression = more steps near extreme
    if (compression > 66) return 'ease-out-cubic';
    if (compression > 33) return 'ease-out';
    return 'linear'; // Small compression
  } else {
    // Negative compression = more steps near primary
    if (compression < -66) return 'ease-in-cubic';
    if (compression < -33) return 'ease-in';
    return 'linear'; // Small expansion
  }
}

// Convert compression to custom bezier curve for finer control
export function compressionToBezier(compression: number): number[] {
  // Clamp compression to valid range
  compression = Math.max(-100, Math.min(100, compression));
  
  // For linear (0), return linear bezier
  if (compression === 0) {
    return [0, 0, 1, 1];
  }
  
  // Normalize to 0-1 for calculations
  const absCompression = Math.abs(compression);
  const intensity = absCompression / 100;
  
  if (compression > 0) {
    // Positive compression = ease-out style (more steps near extreme)
    // As compression increases, the curve becomes more pronounced
    const x1 = 0;
    const y1 = 0;
    const x2 = 1 - (0.42 * intensity); // From 1 (linear) to 0.58 (strong ease-out)
    const y2 = 1;
    return [x1, y1, x2, y2];
  } else {
    // Negative compression = ease-in style (more steps near primary)
    // As compression decreases, the curve becomes more pronounced
    const x1 = 0.42 * intensity; // From 0 (linear) to 0.42 (strong ease-in)
    const y1 = 0;
    const x2 = 1;
    const y2 = 1;
    return [x1, y1, x2, y2];
  }
}

// Get the key compression values that map to distinct easing curves
export function getCompressionNotches(): number[] {
  return [-66, -33, 0, 33, 66];
}

// Visual representation of easing curve for UI
export function getEasingCurvePoints(
  easingCurve: EasingCurve,
  customCurve?: number[]
): string {
  const easingFn = getEasingFunction(easingCurve, customCurve);
  const points: string[] = [];
  
  // Generate 50 points for smooth curve
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const value = easingFn(t);
    points.push(`${t * 100},${(1 - value) * 100}`);
  }
  
  return points.join(' ');
}