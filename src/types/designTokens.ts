export type StepCurve = 'none' | 'skew-light' | 'skew-dark';

export type ColorHarmony = 'none' | 'complementary' | 'triadic' | 'analogous' | 'split-complementary';

export type EasingCurve = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'ease-in-cubic' | 'ease-out-cubic' | 'custom';

export type ColorToken = {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  steps: number;
  skewLightIntensity: number;
  skewDarkIntensity: number;
  primaryStepIndex?: number; // Optional - only used for neutrals
  harmonySource?: string; // The color token this color is harmonized from
  harmonyType?: ColorHarmony; // The type of harmony applied
  // Dual easing curves for light and dark ranges
  lightnessEasingLight?: EasingCurve; // Easing curve for lightness distribution (light range)
  lightnessEasingDark?: EasingCurve; // Easing curve for lightness distribution (dark range)
  saturationEasingLight?: EasingCurve; // Easing curve for saturation distribution (light range)
  saturationEasingDark?: EasingCurve; // Easing curve for saturation distribution (dark range)
  // Compression values for simple mode
  lightnessCompression?: number; // -100 to 100, controls light range density
  darknessCompression?: number; // -100 to 100, controls dark range density
  // Offset controls for fine-tuning
  primaryOffset?: number; // 0 to 100, moves sibling steps away from primary
  whiteOffset?: number; // 0 to 100, darkens the lightest step away from pure white
  blackOffset?: number; // 0 to 100, lightens the darkest step away from pure black
  stepPadding?: number; // 0 to 100, minimum separation between adjacent steps (default: 1%)
  // Custom curves for advanced control
  customLightnessCurveLight?: number[]; // Custom curve control points [x1, y1, x2, y2] for light range
  customLightnessCurveDark?: number[]; // Custom curve control points [x1, y1, x2, y2] for dark range
  customSaturationCurveLight?: number[]; // Custom curve control points [x1, y1, x2, y2] for light range
  customSaturationCurveDark?: number[]; // Custom curve control points [x1, y1, x2, y2] for dark range
  // Legacy properties (kept for backward compatibility, will be removed later)
  lightnessEasing?: EasingCurve; 
  saturationEasing?: EasingCurve;
  customLightnessCurve?: number[];
  customSaturationCurve?: number[];
};

export type ColorTokens = {
  primary: ColorToken;
  secondary: ColorToken;
  accent: ColorToken;
  neutrals: ColorToken;
  border: ColorToken;
  background: ColorToken;
  success: ColorToken;
  warning: ColorToken;
  destructive: ColorToken;
  [key: string]: ColorToken;
};

export type FontToken = {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
  headingScale?: number; // Only applies to heading fonts
};

export type TypographyScale = {
  [key: string]: FontToken; // e.g., { 'sm': FontToken, 'md': FontToken, 'lg': FontToken }
};

export type TypographyGroup = {
  baseSize: number; // Base size in pixels
  scale: number; // Scale multiplier between sizes
  steps: number; // Number of steps (default 3)
  family: string; // Font family
  weight: number; // Font weight
  lineHeight: number; // Line height
  letterSpacing: number; // Letter spacing
  scale_tokens: TypographyScale; // Generated scale tokens
};

export type FontTokens = {
  // Legacy single tokens (kept for backward compatibility)
  base: FontToken;
  heading: FontToken;
  mono: FontToken;
  
  // New typography groups with multiple sizes
  paragraph: TypographyGroup;
  span: TypographyGroup;
  
  [key: string]: FontToken | TypographyGroup;
};

export type SpacingToken = {
  baseSize: number; // Base size in pixels (e.g., 16px)
  scale: number; // Multiplier for each step (e.g., 1.5)
  steps: number; // Number of steps to generate (e.g., 10)
  unit: 'px' | 'rem'; // Unit type
};

export type SpacingScale = {
  [key: string]: number; // e.g., { 'xs': 4, 'sm': 8, 'md': 16, 'lg': 24, 'xl': 32, ... }
};

export type RadiusToken = {
  baseSize: number; // Base radius in pixels (e.g., 8px)
  scale: number; // Multiplier for each step (e.g., 1.5)
  steps: number; // Number of steps to generate (e.g., 6)
  unit: 'px' | 'rem'; // Unit type
};

export type RadiusScale = {
  [key: string]: number; // e.g., { 'xs': 2, 'sm': 4, 'md': 8, 'lg': 12, 'xl': 16, '2xl': 24 }
};

export type ColorInterpolationMode = 'hsl' | 'lch';

export type IconLibrary = 'lucide' | 'heroicons' | 'tabler' | 'nucleo';

export type DesignSystem = {
  name: string;
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: {
    token: SpacingToken;
    scale: SpacingScale;
  };
  radius: {
    token: RadiusToken;
    scale: RadiusScale;
  };
  isDark: boolean;
  colorInterpolationMode?: ColorInterpolationMode; // Default to 'hsl' if not specified
  iconLibrary?: IconLibrary; // Default to 'lucide' if not specified
  accentColorEnabled?: boolean; // Whether accent color is enabled in the system
};

export type ComponentVariant = 'default' | 'outline' | 'ghost' | 'link';
export type ComponentSize = 'small' | 'medium' | 'large';

export type PresetTheme = 'minimal' | 'brutalist' | 'neumorphic' | 'glassmorphic' | 'colorful';
