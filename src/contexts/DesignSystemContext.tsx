import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DesignSystem, PresetTheme, ColorToken, ComponentVariant } from '@/types/designTokens';

// Default color token
const defaultColorToken: ColorToken = {
  hue: 210,
  saturation: 100,
  lightness: 50,
  alpha: 1,
  steps: 9,
  skewLightIntensity: 0,
  skewDarkIntensity: 0
};

// Default design system
const defaultDesignSystem: DesignSystem = {
  name: 'Default System',
  colors: {
    primary: { ...defaultColorToken, hue: 210 },  // Blue
    secondary: { ...defaultColorToken, hue: 250, saturation: 80 }, // Purple
    accent: { ...defaultColorToken, hue: 330, saturation: 90 },  // Pink
    neutrals: { ...defaultColorToken, saturation: 10, lightness: 50 },
    border: { ...defaultColorToken, saturation: 20, lightness: 85 },
    background: { ...defaultColorToken, saturation: 5, lightness: 98 }, // Background color
    success: { ...defaultColorToken, hue: 142, saturation: 70 }, // Green
    warning: { ...defaultColorToken, hue: 38, saturation: 90 },  // Yellow 
    destructive: { ...defaultColorToken, hue: 0, saturation: 80 }, // Red
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
      letterSpacing: -0.5
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
            action.property === 'skewDarkIntensity') {
          // Ensure we're assigning a number
          numValue = typeof action.value === 'string' ? parseFloat(action.value) : action.value;
          targetToken[action.property] = numValue;
        }
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
    
    default:
      return state;
  }
}

// Utility function to convert HSL to CSS format
function hslToCSS(color: ColorToken): string {
  return `hsla(${color.hue}, ${color.saturation}%, ${color.lightness}%, ${color.alpha})`;
}

// Get a specific preset design system
function getPreset(preset: PresetTheme): DesignSystem {
  if (preset === 'minimal') {
    return {
      ...defaultDesignSystem,
      name: 'Minimal',
      colors: {
        ...defaultDesignSystem.colors,
        background: { ...defaultColorToken, saturation: 3, lightness: 98 },
      },
      radius: {
        small: 2,
        medium: 4,
        large: 8,
        full: 9999
      }
    };
  } else if (preset === 'brutalist') {
    return {
      ...defaultDesignSystem,
      name: 'Brutalist',
      colors: {
        ...defaultDesignSystem.colors,
        background: { ...defaultColorToken, saturation: 0, lightness: 100 },
      },
      radius: {
        small: 0,
        medium: 0,
        large: 0, 
        full: 0
      },
      fonts: {
        ...defaultDesignSystem.fonts,
        base: {
          ...defaultDesignSystem.fonts.base,
          family: 'Courier New, monospace',
          letterSpacing: 0.5
        },
        heading: {
          ...defaultDesignSystem.fonts.heading,
          family: 'Courier New, monospace',
          weight: 800,
          letterSpacing: 0
        }
      }
    };
  } else if (preset === 'neumorphic') {
    return {
      ...defaultDesignSystem,
      name: 'Neumorphic',
      colors: {
        ...defaultDesignSystem.colors,
        neutrals: { ...defaultColorToken, hue: 210, saturation: 10, lightness: 95 },
        border: { ...defaultColorToken, hue: 210, saturation: 5, lightness: 85 },
        background: { ...defaultColorToken, hue: 210, saturation: 5, lightness: 98 },
      },
      radius: {
        small: 12,
        medium: 16,
        large: 24,
        full: 9999
      }
    };
  } else if (preset === 'glassmorphic') {
    return {
      ...defaultDesignSystem,
      name: 'Glassmorphic',
      colors: {
        ...defaultDesignSystem.colors,
        primary: { ...defaultColorToken, hue: 210, alpha: 0.8 },
        neutrals: { ...defaultColorToken, lightness: 95, alpha: 0.8 },
        border: { ...defaultColorToken, lightness: 80, alpha: 0.3 },
        background: { ...defaultColorToken, saturation: 5, lightness: 98, alpha: 0.9 },
      },
      radius: {
        small: 8,
        medium: 12,
        large: 20,
        full: 9999
      }
    };
  } else if (preset === 'colorful') {
    return {
      ...defaultDesignSystem,
      name: 'Colorful',
      colors: {
        ...defaultDesignSystem.colors,
        primary: { ...defaultColorToken, hue: 250 }, // Purple
        secondary: { ...defaultColorToken, hue: 190 }, // Teal
        accent: { ...defaultColorToken, hue: 40 }, // Gold
        neutrals: { ...defaultColorToken, saturation: 5, lightness: 95 },
        border: { ...defaultColorToken, hue: 210, saturation: 15, lightness: 85 },
        background: { ...defaultColorToken, hue: 210, saturation: 5, lightness: 98 },
        success: { ...defaultColorToken, hue: 142, saturation: 80 },
        warning: { ...defaultColorToken, hue: 38, saturation: 100 },
        destructive: { ...defaultColorToken, hue: 0, saturation: 90 },
      }
    };
  } else {
    return { ...defaultDesignSystem };
  }
}

// Provider component
export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [system, dispatch] = useReducer(designSystemReducer, defaultDesignSystem);
  const [componentVariant, setComponentVariant] = React.useState<ComponentVariant>('default');

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
        setComponentVariant
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
