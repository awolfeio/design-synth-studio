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

export type FontTokens = {
  base: FontToken;
  heading: FontToken;
  mono: FontToken;
  [key: string]: FontToken;
};

export type SpacingScale = number[];

export type RadiusTokens = {
  small: number;
  medium: number;
  large: number;
  full: number;
};

export type ColorInterpolationMode = 'hsl' | 'lch';

export type IconLibrary = 'lucide' | 'heroicons' | 'tabler' | 'nucleo';

export type DesignSystem = {
  name: string;
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingScale;
  radius: RadiusTokens;
  isDark: boolean;
  colorInterpolationMode?: ColorInterpolationMode; // Default to 'hsl' if not specified
  iconLibrary?: IconLibrary; // Default to 'lucide' if not specified
};

export type ComponentVariant = 'default' | 'outline' | 'ghost' | 'link';
export type ComponentSize = 'small' | 'medium' | 'large';

export type PresetTheme = 'minimal' | 'brutalist' | 'neumorphic' | 'glassmorphic' | 'colorful';
