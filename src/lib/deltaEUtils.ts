// Custom Delta E implementation using CIE76 formula
// This avoids dependency issues with external packages

// Convert hex color to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

// Convert RGB to XYZ color space
export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB values
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ using sRGB matrix
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return [x * 100, y * 100, z * 100];
}

// Convert XYZ to LAB color space
export function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // Reference white D65
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  x = x / xn;
  y = y / yn;
  z = z / zn;

  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [l, a, b];
}

// Convert hex color to LAB
export function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

// Calculate ΔE (Delta E) using CIE76 formula
export function calculateDeltaE(hex1: string, hex2: string): number {
  try {
    const [l1, a1, b1] = hexToLab(hex1);
    const [l2, a2, b2] = hexToLab(hex2);
    
    const deltaL = l1 - l2;
    const deltaA = a1 - a2;
    const deltaB = b1 - b2;
    
    // CIE76 Delta E formula
    const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    
    return Math.round(deltaE * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating Delta E:', error);
    return 0;
  }
}

// Check if two colors are too similar (ΔE <= 4.0 indicates redundancy)
export function areColorsTooSimilar(hex1: string, hex2: string, threshold: number = 4.0): boolean {
  const deltaEValue = calculateDeltaE(hex1, hex2);
  return deltaEValue <= threshold;
}

// Check color step similarity for an array of colors
export function checkColorStepSimilarity(colors: string[], stepIndex: number, threshold: number = 4.0) {
  const currentColor = colors[stepIndex];
  const similarIndices: number[] = [];
  const deltaEValues: number[] = [];
  
  // Check against all other colors in the array
  for (let i = 0; i < colors.length; i++) {
    if (i === stepIndex) continue; // Skip self
    
    const deltaEValue = calculateDeltaE(currentColor, colors[i]);
    deltaEValues.push(deltaEValue);
    
    if (deltaEValue <= threshold) {
      similarIndices.push(i);
    }
  }
  
  return {
    hasSimilarSibling: similarIndices.length > 0,
    similarIndices,
    deltaEValues: deltaEValues.filter(value => value <= threshold)
  };
} 