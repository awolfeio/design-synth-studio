import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DesignSystem, PresetTheme, ColorToken, ComponentVariant, ColorTokens, ColorHarmony, EasingCurve } from '@/types/designTokens';

// Default color token
const defaultColorToken: ColorToken = {
  hue: 210,
  saturation: 100,
  lightness: 50,
  alpha: 1,
  steps: 12,
  skewLightIntensity: 0,
  skewDarkIntensity: 0,
  // Dual easing curves with recommended defaults
  lightnessEasingLight: 'ease-out', // Better perceptual spacing in light range
  lightnessEasingDark: 'ease-in',   // Better perceptual spacing in dark range
  saturationEasingLight: 'linear',
  saturationEasingDark: 'linear',
  // Compression values for simple mode (aligned with default easing curves)
  lightnessCompression: 50,   // Maps to ease-out for light range
  darknessCompression: -50,   // Maps to ease-in for dark range
  // Offset controls with conservative defaults
  primaryOffset: 0,     // No offset by default
  whiteOffset: 0,       // Pure white by default
  blackOffset: 0,       // Pure black by default
  stepPadding: 1,       // Default 1% minimum separation between steps
  // Legacy properties for backward compatibility
  lightnessEasing: 'linear',
  saturationEasing: 'linear',
  harmonyType: 'none'
};

// Default design system
const defaultDesignSystem: DesignSystem = {
  name: 'Default System',
  colors: {
    primary: { ...defaultColorToken, hue: 246, saturation: 98, lightness: 58, primaryStepIndex: 5 },  // 412BFD
    secondary: { ...defaultColorToken, hue: 180, saturation: 75, lightness: 68, primaryStepIndex: 5 }, // 6FEDEE
    accent: { ...defaultColorToken, hue: 27, saturation: 100, lightness: 50, primaryStepIndex: 5 },  // FF7200
    neutrals: { ...defaultColorToken, hue: 210, saturation: 14, lightness: 11, steps: 12, primaryStepIndex: 11 }, // #181d20 at step 1000
    border: { ...defaultColorToken, saturation: 20, lightness: 85 },
    background: { ...defaultColorToken, saturation: 5, lightness: 98 }, // Background color
    success: { ...defaultColorToken, hue: 142, saturation: 70, steps: 4, primaryStepIndex: 1 }, // Green - fewer steps
    warning: { ...defaultColorToken, hue: 38, saturation: 90, steps: 4, primaryStepIndex: 1 },  // Yellow - fewer steps
    destructive: { ...defaultColorToken, hue: 0, saturation: 80, steps: 4, primaryStepIndex: 1 }, // Red - fewer steps
  },
  fonts: {
    base: {
      family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      size: 16,
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: 0
    },
    heading: {
      family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      size: 24,
      weight: 700,
      lineHeight: 1.2,
      letterSpacing: -0.5,
      headingScale: 1.25
    },
    mono: {
      family: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      size: 14,
      weight: 400, 
      lineHeight: 1.6,
      letterSpacing: 0
    }
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80],
  radius: {
    small: 4,
    medium: 8,
    large: 16,
    full: 9999
  },
  isDark: false,
  iconLibrary: 'lucide'
};

// Action types
type ActionType =
  | { type: 'UPDATE_COLOR'; tokenName: string; property: keyof ColorToken; value: number | string | number[] }
  | { type: 'UPDATE_COLOR_COMPRESSION'; tokenName: string; compressionType: 'light' | 'dark'; compressionValue: number }
  | { type: 'UPDATE_FONT'; fontName: string; property: string; value: string | number }
  | { type: 'UPDATE_SPACING'; index: number; value: number }
  | { type: 'UPDATE_SPACING_SCALE'; scale: number[] }
  | { type: 'UPDATE_RADIUS'; radiusName: string; value: number }
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOAD_PRESET'; preset: PresetTheme }
  | { type: 'RESET' }
  | { type: 'SET_SYSTEM'; system: DesignSystem }
  | { type: 'UPDATE_SYSTEM_NAME'; name: string }
  | { type: 'SET_COLOR_INTERPOLATION_MODE'; mode: 'hsl' | 'lch' }
  | { type: 'SET_ICON_LIBRARY'; library: 'lucide' | 'heroicons' | 'tabler' | 'nucleo' };

// Context type
type DesignSystemContextType = {
  system: DesignSystem;
  dispatch: React.Dispatch<ActionType>;
  getCSS: () => string;
  getTailwindConfig: () => Record<string, unknown>;
  activatePreset: (preset: PresetTheme) => void;
  resetSystem: () => void;
  componentVariant: ComponentVariant;
  setComponentVariant: (variant: ComponentVariant) => void;
  leftColumnWidth: number;
  setLeftColumnWidth: (width: number) => void;
};

// Create context
const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

// Reducer function
function designSystemReducer(state: DesignSystem, action: ActionType): DesignSystem {
  switch (action.type) {
    case 'UPDATE_COLOR': {
      const newColors = { ...state.colors };
      const targetToken = { ...newColors[action.tokenName] };
      let numValue: number;
      
      // Update the specified property with the new value
      if (typeof action.property === 'string' && action.property in targetToken) {
        // Handle the property type correctly based on the ColorToken properties
        if (action.property === 'hue' || 
            action.property === 'saturation' || 
            action.property === 'lightness' || 
            action.property === 'alpha' || 
            action.property === 'steps' ||
            action.property === 'skewLightIntensity' ||
            action.property === 'skewDarkIntensity' ||
            action.property === 'primaryStepIndex') {
          // Ensure we're assigning a number
          numValue = typeof action.value === 'string' ? parseFloat(action.value) : 
                     typeof action.value === 'number' ? action.value : 0;
          
          // Special handling for neutrals saturation - cap at 15%
          if (action.tokenName === 'neutrals' && action.property === 'saturation') {
            numValue = Math.min(numValue, 15);
          }
          
          targetToken[action.property] = numValue;
        } else if (action.property === 'harmonySource' || action.property === 'harmonyType') {
          // Handle harmony properties
          if (action.property === 'harmonySource') {
            targetToken.harmonySource = action.value as string | undefined;
          } else if (action.property === 'harmonyType') {
            targetToken.harmonyType = action.value as ColorHarmony | undefined;
          }
          
          // If harmony is being set up and both source and type are now defined, calculate the harmony
          if (targetToken.harmonySource === 'primary' && targetToken.harmonyType && targetToken.harmonyType !== 'none') {
            const primaryColor = newColors.primary;
            let newHue = primaryColor.hue;
            
            // Calculate the harmony hue based on the harmony type
            switch (targetToken.harmonyType) {
              case 'complementary':
                newHue = (primaryColor.hue + 180) % 360;
                break;
              case 'triadic':
                // For secondary, use +120, for accent use +240
                newHue = action.tokenName === 'secondary' 
                  ? (primaryColor.hue + 120) % 360 
                  : (primaryColor.hue + 240) % 360;
                break;
              case 'analogous':
                // For secondary, use +30, for accent use -30
                newHue = action.tokenName === 'secondary'
                  ? (primaryColor.hue + 30) % 360
                  : (primaryColor.hue - 30 + 360) % 360;
                break;
              case 'split-complementary':
                // For secondary, use +150, for accent use +210
                newHue = action.tokenName === 'secondary'
                  ? (primaryColor.hue + 150) % 360
                  : (primaryColor.hue + 210) % 360;
                break;
            }
            
            // Apply the calculated hue
            targetToken.hue = newHue;
            
            // Apply initial saturation and lightness inheritance for certain harmony types
            if (targetToken.harmonyType === 'complementary') {
              // Complementary colors inherit saturation and lightness for visual consistency
              targetToken.saturation = primaryColor.saturation;
              targetToken.lightness = primaryColor.lightness;
            } else if (targetToken.harmonyType === 'analogous') {
              // Analogous colors work well with similar saturation and lightness
              targetToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.9));
              const variation = action.tokenName === 'secondary' ? 0.9 : 1.1;
              targetToken.lightness = Math.max(0, Math.min(100, primaryColor.lightness * variation));
            } else if (targetToken.harmonyType === 'triadic') {
              // Triadic colors can have slightly different saturation
              targetToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.85));
            } else if (targetToken.harmonyType === 'split-complementary') {
              // Split-complementary colors can inherit some properties
              targetToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.95));
              const variation = action.tokenName === 'secondary' ? 0.95 : 1.05;
              targetToken.lightness = Math.max(0, Math.min(100, primaryColor.lightness * variation));
            }
          }
        } else if (action.property === 'lightnessEasing' || action.property === 'saturationEasing' ||
                   action.property === 'lightnessEasingLight' || action.property === 'lightnessEasingDark' ||
                   action.property === 'saturationEasingLight' || action.property === 'saturationEasingDark') {
          // Handle all easing curve properties
          targetToken[action.property] = action.value as EasingCurve;
        } else if (action.property === 'customLightnessCurve' || action.property === 'customSaturationCurve' ||
                   action.property === 'customLightnessCurveLight' || action.property === 'customLightnessCurveDark' ||
                   action.property === 'customSaturationCurveLight' || action.property === 'customSaturationCurveDark') {
          // Handle all custom curve arrays
          targetToken[action.property] = Array.isArray(action.value) ? action.value : undefined;
        } else if (action.property === 'lightnessCompression' || action.property === 'darknessCompression' ||
                   action.property === 'primaryOffset' || action.property === 'whiteOffset' || action.property === 'blackOffset' ||
                   action.property === 'stepPadding') {
          // Handle compression and offset values
          targetToken[action.property] = typeof action.value === 'string' ? parseFloat(action.value) : 
                                        typeof action.value === 'number' ? action.value : 0;
        }
      }
      
      // Update the token in the colors object
      newColors[action.tokenName] = targetToken;
      
      // If primary color changed, update harmonized colors
      if (action.tokenName === 'primary' && (action.property === 'hue' || action.property === 'saturation' || action.property === 'lightness')) {
        const primaryColor = newColors.primary;
        
        Object.entries(newColors).forEach(([colorName, colorToken]) => {
          if (colorToken.harmonySource === 'primary' && colorToken.harmonyType && colorToken.harmonyType !== 'none') {
            let newHue = primaryColor.hue;
            
            // Calculate the harmony hue based on the harmony type
            switch (colorToken.harmonyType) {
              case 'complementary':
                newHue = (primaryColor.hue + 180) % 360;
                break;
              case 'triadic':
                // For secondary, use +120, for accent use +240
                newHue = colorName === 'secondary' 
                  ? (primaryColor.hue + 120) % 360 
                  : (primaryColor.hue + 240) % 360;
                break;
              case 'analogous':
                // For secondary, use +30, for accent use -30
                newHue = colorName === 'secondary'
                  ? (primaryColor.hue + 30) % 360
                  : (primaryColor.hue - 30 + 360) % 360;
                break;
              case 'split-complementary':
                // For secondary, use +150, for accent use +210
                newHue = colorName === 'secondary'
                  ? (primaryColor.hue + 150) % 360
                  : (primaryColor.hue + 210) % 360;
                break;
            }
            
            // Start with the updated hue
            const updatedToken = { ...colorToken, hue: newHue };
            
            // Handle saturation and lightness inheritance based on harmony type and changed property
            if (colorToken.harmonyType === 'complementary') {
              // Complementary colors can inherit saturation and lightness for visual consistency
              if (action.property === 'saturation') {
                updatedToken.saturation = primaryColor.saturation;
              }
              if (action.property === 'lightness') {
                updatedToken.lightness = primaryColor.lightness;
              }
            } else if (colorToken.harmonyType === 'analogous') {
              // Analogous colors work well with similar saturation and lightness
              if (action.property === 'saturation') {
                // Slightly vary saturation for analogous colors
                updatedToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.9));
              }
              if (action.property === 'lightness') {
                // Slightly vary lightness for analogous colors
                const variation = colorName === 'secondary' ? 0.9 : 1.1;
                updatedToken.lightness = Math.max(0, Math.min(100, primaryColor.lightness * variation));
              }
            } else if (colorToken.harmonyType === 'triadic') {
              // Triadic colors maintain their own saturation/lightness but can be influenced
              if (action.property === 'saturation') {
                // Triadic colors can have slightly different saturation
                updatedToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.85));
              }
            } else if (colorToken.harmonyType === 'split-complementary') {
              // Split-complementary colors can inherit some properties
              if (action.property === 'saturation') {
                // Slightly vary saturation for split-complementary colors
                updatedToken.saturation = Math.max(0, Math.min(100, primaryColor.saturation * 0.95));
              }
              if (action.property === 'lightness') {
                // Slightly vary lightness for split-complementary colors
                const variation = colorName === 'secondary' ? 0.95 : 1.05;
                updatedToken.lightness = Math.max(0, Math.min(100, primaryColor.lightness * variation));
              }
            }
            
            newColors[colorName] = updatedToken;
          }
        });
      }
      
      // Bind step quantities for primary, secondary, and accent
      if (action.property === 'steps' && 
          (action.tokenName === 'primary' || 
           action.tokenName === 'secondary' || 
           action.tokenName === 'accent')) {
        // Update all three core colors to have the same number of steps
        const stepsValue = targetToken.steps;
        newColors.primary = { ...newColors.primary, steps: stepsValue };
        newColors.secondary = { ...newColors.secondary, steps: stepsValue };
        newColors.accent = { ...newColors.accent, steps: stepsValue };
      }
      
      // Bind step quantities for utility colors (success, warning, destructive)
      if (action.property === 'steps' && 
          (action.tokenName === 'success' || 
           action.tokenName === 'warning' || 
           action.tokenName === 'destructive')) {
        // Update all three utility colors to have the same number of steps
        const stepsValue = targetToken.steps;
        newColors.success = { ...newColors.success, steps: stepsValue };
        newColors.warning = { ...newColors.warning, steps: stepsValue };
        newColors.destructive = { ...newColors.destructive, steps: stepsValue };
      }
      
      // Bind primary step positioning for core colors (primary, secondary, accent)
      if (action.property === 'primaryStepIndex' && 
          (action.tokenName === 'primary' || 
           action.tokenName === 'secondary' || 
           action.tokenName === 'accent')) {
        // Update all three core colors to have the same primary step position
        const primaryStepValue = targetToken.primaryStepIndex;
        newColors.primary = { ...newColors.primary, primaryStepIndex: primaryStepValue };
        newColors.secondary = { ...newColors.secondary, primaryStepIndex: primaryStepValue };
        newColors.accent = { ...newColors.accent, primaryStepIndex: primaryStepValue };
      }
      
      // Bind primary step positioning for utility colors (success, warning, destructive)
      if (action.property === 'primaryStepIndex' && 
          (action.tokenName === 'success' || 
           action.tokenName === 'warning' || 
           action.tokenName === 'destructive')) {
        // Update all three utility colors to have the same primary step position
        const primaryStepValue = targetToken.primaryStepIndex;
        newColors.success = { ...newColors.success, primaryStepIndex: primaryStepValue };
        newColors.warning = { ...newColors.warning, primaryStepIndex: primaryStepValue };
        newColors.destructive = { ...newColors.destructive, primaryStepIndex: primaryStepValue };
      }
      
      return {
        ...state,
        colors: newColors
      };
    }
    
    case 'UPDATE_COLOR_COMPRESSION': {
      const newColors = { ...state.colors };
      const targetToken = { ...newColors[action.tokenName] };
      
      // Import compressionToBezier function inline to avoid circular dependency
      const compressionToBezier = (compression: number): number[] => {
        compression = Math.max(-100, Math.min(100, compression));
        
        if (compression === 0) {
          return [0, 0, 1, 1];
        }
        
        const absCompression = Math.abs(compression);
        const intensity = absCompression / 100;
        
        if (compression > 0) {
          const x1 = 0;
          const y1 = 0;
          const x2 = 1 - (0.42 * intensity);
          const y2 = 1;
          return [x1, y1, x2, y2];
        } else {
          const x1 = 0.42 * intensity;
          const y1 = 0;
          const x2 = 1;
          const y2 = 1;
          return [x1, y1, x2, y2];
        }
      };
      
      // Update the specified compression property with the new value
      if (action.compressionType === 'light') {
        targetToken.lightnessCompression = action.compressionValue;
        targetToken.lightnessEasingLight = 'custom';
        targetToken.customLightnessCurveLight = compressionToBezier(action.compressionValue);
      } else if (action.compressionType === 'dark') {
        targetToken.darknessCompression = action.compressionValue;
        targetToken.lightnessEasingDark = 'custom';
        targetToken.customLightnessCurveDark = compressionToBezier(action.compressionValue);
      }
      
      // Update the token in the colors object
      newColors[action.tokenName] = targetToken;
      
      return {
        ...state,
        colors: newColors
      };
    }
    
    case 'UPDATE_FONT':
      return {
        ...state,
        fonts: {
          ...state.fonts,
          [action.fontName]: {
            ...state.fonts[action.fontName],
            [action.property]: action.value
          }
        }
      };
    
    case 'UPDATE_SPACING': {
      const newSpacing = [...state.spacing];
      newSpacing[action.index] = action.value;
      return {
        ...state,
        spacing: newSpacing
      };
    }
    
    case 'UPDATE_SPACING_SCALE':
      return {
        ...state,
        spacing: action.scale
      };
    
    case 'UPDATE_RADIUS':
      return {
        ...state,
        radius: {
          ...state.radius,
          [action.radiusName]: action.value
        }
      };
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        isDark: !state.isDark
      };
    
    case 'LOAD_PRESET':
      // This would be implemented to load predefined presets
      return { ...getPreset(action.preset) };
    
    case 'RESET':
      return { ...defaultDesignSystem };
    
    case 'SET_SYSTEM':
      return { ...action.system };
    
    case 'UPDATE_SYSTEM_NAME':
      return {
        ...state,
        name: action.name
      };
    
    case 'SET_COLOR_INTERPOLATION_MODE':
      return {
        ...state,
        colorInterpolationMode: action.mode
      };
    
    case 'SET_ICON_LIBRARY':
      return {
        ...state,
        iconLibrary: action.library
      };
    
    default:
      return state;
  }
}

// Utility function to convert HSL to CSS format
function hslToCSS(color: ColorToken): string {
  return `hsla(${color.hue}, ${color.saturation}%, ${color.lightness}%, ${color.alpha})`;
}

// Helper to create a consistent design system with proper step counts
function createConsistentColorSteps(colors: ColorTokens): ColorTokens {
  // Ensure we have a copy to work with
  const newColors = { ...colors };
  
  // Set primary/secondary/accent to the same step count (use primary's value or default to 9)
  const primarySteps = newColors.primary?.steps || 9;
  newColors.primary = { ...newColors.primary, steps: primarySteps };
  newColors.secondary = { ...newColors.secondary, steps: primarySteps };
  newColors.accent = { ...newColors.accent, steps: primarySteps };
  
  // Set neutrals to 12 steps if not already specified
  newColors.neutrals = { ...newColors.neutrals, steps: newColors.neutrals?.steps || 12 };
  
  // Set utility colors to 4 steps (unless already specified)
  newColors.success = { ...newColors.success, steps: newColors.success?.steps || 4 };
  newColors.warning = { ...newColors.warning, steps: newColors.warning?.steps || 4 };
  newColors.destructive = { ...newColors.destructive, steps: newColors.destructive?.steps || 4 };
  
  return newColors;
}

// Get a specific preset design system
function getPreset(theme: PresetTheme): DesignSystem {
  let preset: DesignSystem = { ...defaultDesignSystem };

  switch (theme) {
    case 'minimal': {
      preset = {
        ...defaultDesignSystem,
        colors: createConsistentColorSteps({
          ...defaultDesignSystem.colors,
          primary: { 
            hue: 210, 
            saturation: 80, 
            lightness: 55, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          secondary: { 
            hue: 260, 
            saturation: 60, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          accent: { 
            hue: 30, 
            saturation: 90, 
            lightness: 65, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          neutrals: { 
            hue: 210, 
            saturation: 10, 
            lightness: 50, 
            steps: 12,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          }
        }),
        radius: {
          small: 4,
          medium: 8,
          large: 16,
          full: 9999
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80]
      };
      break;
    }
    
    case 'brutalist': {
      preset = {
        ...defaultDesignSystem,
        colors: createConsistentColorSteps({
          ...defaultDesignSystem.colors,
          primary: { 
            hue: 0, 
            saturation: 0, 
            lightness: 0, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          secondary: { 
            hue: 0, 
            saturation: 0, 
            lightness: 30, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          accent: { 
            hue: 0, 
            saturation: 80, 
            lightness: 50, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          neutrals: { 
            hue: 0, 
            saturation: 0, 
            lightness: 50, 
            steps: 12,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          }
        }),
        radius: {
          small: 0,
          medium: 0,
          large: 0,
          full: 9999
        },
        spacing: [0, 4, 8, 16, 24, 32, 48, 64, 80, 96, 128]
      };
      break;
    }
    
    case 'neumorphic': {
      preset = {
        ...defaultDesignSystem,
        colors: createConsistentColorSteps({
          ...defaultDesignSystem.colors,
          primary: { 
            hue: 210, 
            saturation: 30, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          secondary: { 
            hue: 240, 
            saturation: 30, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          accent: { 
            hue: 280, 
            saturation: 30, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          neutrals: { 
            hue: 220, 
            saturation: 10, 
            lightness: 85, 
            steps: 12,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          }
        }),
        radius: {
          small: 16,
          medium: 24,
          large: 32,
          full: 9999
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80]
      };
      break;
    }
    
    case 'glassmorphic': {
      preset = {
        ...defaultDesignSystem,
        colors: createConsistentColorSteps({
          ...defaultDesignSystem.colors,
          primary: { 
            hue: 200, 
            saturation: 70, 
            lightness: 50, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          secondary: { 
            hue: 250, 
            saturation: 70, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          accent: { 
            hue: 300, 
            saturation: 70, 
            lightness: 50, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          neutrals: { 
            hue: 220, 
            saturation: 20, 
            lightness: 90, 
            steps: 12,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          }
        }),
        radius: {
          small: 12,
          medium: 16,
          large: 24,
          full: 9999
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80]
      };
      break;
    }
    
    case 'colorful': {
      preset = {
        ...defaultDesignSystem,
        colors: createConsistentColorSteps({
          ...defaultDesignSystem.colors,
          primary: { 
            hue: 210, 
            saturation: 100, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          secondary: { 
            hue: 280, 
            saturation: 100, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          accent: { 
            hue: 30, 
            saturation: 100, 
            lightness: 60, 
            steps: 9,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          neutrals: { 
            hue: 220, 
            saturation: 5, 
            lightness: 50, 
            steps: 12,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          success: {
            hue: 120,
            saturation: 100,
            lightness: 35,
            steps: 6,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          warning: {
            hue: 40,
            saturation: 100,
            lightness: 50,
            steps: 6,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          },
          destructive: {
            hue: 0,
            saturation: 100,
            lightness: 50,
            steps: 6,
            alpha: 1,
            skewLightIntensity: 0,
            skewDarkIntensity: 0
          }
        }),
        radius: {
          small: 8,
          medium: 12,
          large: 20,
          full: 9999
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80]
      };
      break;
    }
  }

  return preset;
}

// Provider component
export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, dispatch] = useReducer(designSystemReducer, defaultDesignSystem);
  const [componentVariant, setComponentVariant] = React.useState<ComponentVariant>('default');
  const [leftColumnWidth, setLeftColumnWidth] = React.useState<number>(33);

  // Generate CSS variables from design system
  const getCSS = (): string => {
    let cssVars = `:root {\n`;
    
    // Colors
    Object.entries(system.colors).forEach(([name, color]) => {
      cssVars += `  --color-${name}: ${hslToCSS(color)};\n`;
    });
    
    // Fonts
    Object.entries(system.fonts).forEach(([name, font]) => {
      cssVars += `  --font-family-${name}: ${font.family};\n`;
      cssVars += `  --font-size-${name}: ${font.size}px;\n`;
      cssVars += `  --font-weight-${name}: ${font.weight};\n`;
      cssVars += `  --line-height-${name}: ${font.lineHeight};\n`;
      cssVars += `  --letter-spacing-${name}: ${font.letterSpacing}px;\n`;
    });
    
    // Spacing
    system.spacing.forEach((space, index) => {
      cssVars += `  --space-${index}: ${space}px;\n`;
    });
    
    // Radius
    Object.entries(system.radius).forEach(([name, value]) => {
      cssVars += `  --radius-${name}: ${value}px;\n`;
    });
    
    cssVars += `}\n`;
    return cssVars;
  };
  
  // Generate Tailwind config from design system
  const getTailwindConfig = () => {
    const colors: Record<string, Record<string, string>> = {};
    
    // Convert colors to Tailwind format
    Object.entries(system.colors).forEach(([name, color]) => {
      colors[name] = { DEFAULT: hslToCSS(color) };
    });
    
    // Create spacing scale for Tailwind
    const spacing: Record<string, string> = {};
    system.spacing.forEach((space, index) => {
      spacing[index.toString()] = `${space}px`;
    });
    
    // Create border radius config
    const borderRadius: Record<string, string> = {};
    Object.entries(system.radius).forEach(([name, value]) => {
      borderRadius[name] = `${value}px`;
    });
    
    // Create font family config
    const fontFamily: Record<string, string[]> = {};
    Object.entries(system.fonts).forEach(([name, font]) => {
      fontFamily[name] = font.family.split(',').map(f => f.trim());
    });
    
    return {
      theme: {
        colors,
        spacing,
        borderRadius,
        fontFamily,
      }
    };
  };

  // Effect to update document with dark mode
  useEffect(() => {
    if (system.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [system.isDark]);

  // Activate preset theme
  const activatePreset = (preset: PresetTheme) => {
    dispatch({ type: 'LOAD_PRESET', preset });
  };

  // Reset to default
  const resetSystem = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <DesignSystemContext.Provider 
      value={{ 
        system, 
        dispatch, 
        getCSS, 
        getTailwindConfig, 
        activatePreset,
        resetSystem,
        componentVariant,
        setComponentVariant,
        leftColumnWidth,
        setLeftColumnWidth
      }}
    >
      {children}
    </DesignSystemContext.Provider>
  );
};

// Custom hook to use the design system context
export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};
