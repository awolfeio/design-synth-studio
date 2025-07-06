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

// Enhanced version with offset controls
export function generateDualEasedStepsWithOffsets(
  steps: number,
  primaryIndex: number,
  primaryValue: number,
  minValue: number,
  maxValue: number,
  lightEasingCurve: EasingCurve = 'linear',
  darkEasingCurve: EasingCurve = 'linear',
  customLightCurve?: number[],
  customDarkCurve?: number[],
  primaryOffset: number = 0,
  whiteOffset: number = 0,
  blackOffset: number = 0,
  stepPadding: number = 1
): number[] {
  // Apply offsets to the range values
  const adjustedMinValue = applyBlackOffset(minValue, blackOffset);
  const adjustedMaxValue = applyWhiteOffset(maxValue, whiteOffset);
  
  // Generate base values
  const baseValues = generateDualEasedSteps(
    steps,
    primaryIndex,
    primaryValue,
    adjustedMinValue,
    adjustedMaxValue,
    lightEasingCurve,
    darkEasingCurve,
    customLightCurve,
    customDarkCurve
  );
  
  // Apply primary offset to sibling steps
  let finalValues = baseValues;
  if (primaryOffset > 0) {
    finalValues = applyPrimaryOffset(finalValues, primaryIndex, primaryOffset);
  }
  
  // Apply step padding enforcement
  finalValues = enforceStepPadding(finalValues, primaryIndex, stepPadding);
  
  return finalValues;
}

// Apply white offset (darkens the lightest step away from pure white)
function applyWhiteOffset(maxValue: number, whiteOffset: number): number {
  if (whiteOffset === 0) return maxValue;
  
  // Convert 0-100 offset to 0-1 multiplier, then apply as percentage reduction
  const offsetMultiplier = whiteOffset / 100;
  const reduction = offsetMultiplier * 20; // Max 20% reduction from pure white (100 -> 80)
  
  return Math.max(0, maxValue - reduction);
}

// Apply black offset (lightens the darkest step away from pure black)
function applyBlackOffset(minValue: number, blackOffset: number): number {
  if (blackOffset === 0) return minValue;
  
  // Convert 0-100 offset to 0-1 multiplier, then apply as percentage increase
  const offsetMultiplier = blackOffset / 100;
  const increase = offsetMultiplier * 20; // Max 20% increase from pure black (0 -> 20)
  
  return Math.min(100, minValue + increase);
}

// Apply primary offset (pushes neighboring steps away from primary with cascading effect)
function applyPrimaryOffset(values: number[], primaryIndex: number, primaryOffset: number): number[] {
  if (primaryOffset === 0 || values.length <= 1) return values;
  
  const offsetMultiplier = primaryOffset / 100;
  const adjustedValues = [...values];
  const primaryValue = values[primaryIndex];
  
  // Calculate base push distance - more aggressive than before
  const basePushDistance = offsetMultiplier * 15; // Up to 15% lightness units at max offset
  
  // Push lighter neighbors away from primary (towards lighter values)
  if (primaryIndex > 0) {
    for (let i = primaryIndex - 1; i >= 0; i--) {
      const distanceFromPrimary = primaryIndex - i;
      
      // Primary neighbor gets the full push, others get proportionally less
      // But still get a significant push to create the cascading effect
      const pushRatio = distanceFromPrimary === 1 ? 1.0 : // Immediate neighbor gets full effect
                        distanceFromPrimary === 2 ? 0.7 : // Second neighbor gets 70%
                        distanceFromPrimary === 3 ? 0.5 : // Third neighbor gets 50%
                        Math.max(0.3, 1.0 / distanceFromPrimary); // Further neighbors get at least 30%
      
      const stepPush = basePushDistance * pushRatio;
      
      // Push the step towards lighter values (increase lightness)
      adjustedValues[i] = Math.min(100, values[i] + stepPush);
    }
  }
  
  // Push darker neighbors away from primary (towards darker values)
  if (primaryIndex < values.length - 1) {
    for (let i = primaryIndex + 1; i < values.length; i++) {
      const distanceFromPrimary = i - primaryIndex;
      
      // Primary neighbor gets the full push, others get proportionally less
      // But still get a significant push to create the cascading effect
      const pushRatio = distanceFromPrimary === 1 ? 1.0 : // Immediate neighbor gets full effect
                        distanceFromPrimary === 2 ? 0.7 : // Second neighbor gets 70%
                        distanceFromPrimary === 3 ? 0.5 : // Third neighbor gets 50%
                        Math.max(0.3, 1.0 / distanceFromPrimary); // Further neighbors get at least 30%
      
      const stepPush = basePushDistance * pushRatio;
      
      // Push the step towards darker values (decrease lightness)
      adjustedValues[i] = Math.max(0, values[i] - stepPush);
    }
  }
  
  return adjustedValues;
}

// Enforce minimum step padding between adjacent steps with proper cascading
function enforceStepPadding(values: number[], primaryIndex: number, stepPadding: number): number[] {
  if (stepPadding <= 0 || values.length <= 1) return values;
  
  const adjustedValues = [...values];
  const primaryValue = adjustedValues[primaryIndex];
  
  // First pass: Fix violations by cascading from primary outward
  // This ensures we never break the ordering constraint
  
  // Cascade lighter steps (indices 0 to primaryIndex-1)
  // Work backwards from primary to ensure each step is at least stepPadding lighter than the next
  for (let i = primaryIndex - 1; i >= 0; i--) {
    const nextStepValue = adjustedValues[i + 1]; // The step that should be darker
    const minRequiredValue = nextStepValue + stepPadding;
    
    if (adjustedValues[i] < minRequiredValue) {
      // This step is too dark, make it lighter
      adjustedValues[i] = Math.min(100, minRequiredValue);
    }
  }
  
  // Cascade darker steps (indices primaryIndex+1 to end)
  // Work forwards from primary to ensure each step is at least stepPadding darker than the previous
  for (let i = primaryIndex + 1; i < adjustedValues.length; i++) {
    const prevStepValue = adjustedValues[i - 1]; // The step that should be lighter
    const maxAllowedValue = prevStepValue - stepPadding;
    
    if (adjustedValues[i] > maxAllowedValue) {
      // This step is too light, make it darker
      adjustedValues[i] = Math.max(0, maxAllowedValue);
    }
  }
  
  // Second pass: If we hit boundaries (0 or 100), we need to redistribute
  // Check if we've pushed the lightest step beyond 100%
  if (adjustedValues[0] > 100) {
    // We need to compress the entire lighter range
    const overshoot = adjustedValues[0] - 100;
    const lighterSteps = primaryIndex;
    
    if (lighterSteps > 0) {
      // Redistribute the overshoot across all lighter steps
      const redistributionPerStep = overshoot / lighterSteps;
      
      for (let i = 0; i < primaryIndex; i++) {
        adjustedValues[i] = Math.min(100, adjustedValues[i] - redistributionPerStep);
      }
      
      // Re-enforce padding after redistribution
      for (let i = primaryIndex - 1; i >= 0; i--) {
        const nextStepValue = adjustedValues[i + 1];
        const minRequiredValue = nextStepValue + stepPadding;
        
        if (adjustedValues[i] < minRequiredValue) {
          // If we still can't maintain padding, reduce padding proportionally
          const availableSpace = 100 - nextStepValue;
          const requiredSpace = stepPadding;
          
          if (availableSpace < requiredSpace) {
            // Scale down the padding requirement for this step
            const scaledPadding = Math.max(0.1, availableSpace * 0.9); // Use 90% of available space
            adjustedValues[i] = Math.min(100, nextStepValue + scaledPadding);
          } else {
            adjustedValues[i] = Math.min(100, minRequiredValue);
          }
        }
      }
    }
  }
  
  // Check if we've pushed the darkest step below 0%
  if (adjustedValues[adjustedValues.length - 1] < 0) {
    // We need to compress the entire darker range
    const undershoot = Math.abs(adjustedValues[adjustedValues.length - 1]);
    const darkerSteps = adjustedValues.length - primaryIndex - 1;
    
    if (darkerSteps > 0) {
      // Redistribute the undershoot across all darker steps
      const redistributionPerStep = undershoot / darkerSteps;
      
      for (let i = primaryIndex + 1; i < adjustedValues.length; i++) {
        adjustedValues[i] = Math.max(0, adjustedValues[i] + redistributionPerStep);
      }
      
      // Re-enforce padding after redistribution
      for (let i = primaryIndex + 1; i < adjustedValues.length; i++) {
        const prevStepValue = adjustedValues[i - 1];
        const maxAllowedValue = prevStepValue - stepPadding;
        
        if (adjustedValues[i] > maxAllowedValue) {
          // If we still can't maintain padding, reduce padding proportionally
          const availableSpace = prevStepValue;
          const requiredSpace = stepPadding;
          
          if (availableSpace < requiredSpace) {
            // Scale down the padding requirement for this step
            const scaledPadding = Math.max(0.1, availableSpace * 0.9); // Use 90% of available space
            adjustedValues[i] = Math.max(0, prevStepValue - scaledPadding);
          } else {
            adjustedValues[i] = Math.max(0, maxAllowedValue);
          }
        }
      }
    }
  }
  
  // Final validation: Ensure primary step hasn't moved
  adjustedValues[primaryIndex] = primaryValue;
  
  return adjustedValues;
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