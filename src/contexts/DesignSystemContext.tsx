import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DesignSystem, PresetTheme, ColorToken, ComponentVariant, ColorTokens } from '@/types/designTokens';

// Default color token
const defaultColorToken: ColorToken = {
  hue: 210,
  saturation: 100,
  lightness: 50,
  alpha: 1,
  steps: 12,
  skewLightIntensity: 0,
  skewDarkIntensity: 0
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
  isDark: false
};

// Action types
type ActionType =
  | { type: 'UPDATE_COLOR'; tokenName: string; property: keyof ColorToken; value: number | string }
  | { type: 'UPDATE_FONT'; fontName: string; property: string; value: string | number }
  | { type: 'UPDATE_SPACING'; index: number; value: number }
  | { type: 'UPDATE_SPACING_SCALE'; scale: number[] }
  | { type: 'UPDATE_RADIUS'; radiusName: string; value: number }
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOAD_PRESET'; preset: PresetTheme }
  | { type: 'RESET' }
  | { type: 'SET_SYSTEM'; system: DesignSystem }
  | { type: 'UPDATE_SYSTEM_NAME'; name: string };

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
          numValue = typeof action.value === 'string' ? parseFloat(action.value) : action.value;
          
          // Special handling for neutrals saturation - cap at 15%
          if (action.tokenName === 'neutrals' && action.property === 'saturation') {
            numValue = Math.min(numValue, 15);
          }
          
          targetToken[action.property] = numValue;
        }
      }
      
      // Update the token in the colors object
      newColors[action.tokenName] = targetToken;
      
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
