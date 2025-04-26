export type StepCurve = 'none' | 'skew-light' | 'skew-dark';

export type ColorToken = {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  steps: number;
  skewLightIntensity: number;
  skewDarkIntensity: number;
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

export type DesignSystem = {
  name: string;
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingScale;
  radius: RadiusTokens;
  isDark: boolean;
};

export type ComponentVariant = 'default' | 'outline' | 'ghost' | 'link';
export type ComponentSize = 'small' | 'medium' | 'large';

export type PresetTheme = 'minimal' | 'brutalist' | 'neumorphic' | 'glassmorphic' | 'colorful';
