import React, { useState, useEffect, useRef } from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { ComponentVariant, ComponentSize } from '@/types/designTokens';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateLchColorScale } from '@/lib/lchColorUtils';
import { generateDualEasedStepsWithOffsets, generateSmartSaturationSteps } from '@/lib/easingUtils';
import { hslaToHex } from '@/lib/colorUtils';

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Laptop, Smartphone, Monitor, Calendar, Tag, Download, Palette, Type, Settings, Eye, Figma } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageSidebar } from '@/components/Layout/PageSidebar';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from '@/components/ui/payment-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from '@/components/ui/info-icon';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useContrastCheck } from '@/contexts/ContrastCheckContext';
import { ColorControl } from '@/components/Controls/ColorControl';

// Helper functions for contrast calculation
function hslaToRgb(h: number, s: number, l: number, a: number): number[] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex: string): number[] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] 
    : [0, 0, 0];
}

function getLuminance(rgb: number[]): number {
  const [r, g, b] = rgb.map(c => {
    const val = c / 255;
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(h: number, s: number, l: number, textColor: string): number {
  const bgRgb = hslaToRgb(h, s, l, 1);
  const textRgb = hexToRgb(textColor);
  
  const l1 = getLuminance(bgRgb);
  const l2 = getLuminance(textRgb);
  
  const ratio = l1 > l2 
    ? (l1 + 0.05) / (l2 + 0.05) 
    : (l2 + 0.05) / (l1 + 0.05);
  
  return parseFloat(ratio.toFixed(2));
}

const Preview: React.FC = () => {
  const { system, dispatch, componentVariant, setComponentVariant } = useDesignSystem();
  const { toast } = useToast();
  const [viewportSize, setViewportSize] = React.useState<string>('desktop');
  const [componentSize, setComponentSize] = React.useState<ComponentSize>('medium');
  const [enableAccessibility, setEnableAccessibility] = React.useState(false);
  const [enableCompactMode, setEnableCompactMode] = React.useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [exportType, setExportType] = React.useState<'design-system' | 'figma'>('design-system');
  const accentColorEnabled = system.accentColorEnabled ?? true;
  const [showSwatchData, setShowSwatchData] = useState(false);
  const { setActiveColorControl } = useColorControl();
  const { deltaECheckEnabled, setDeltaECheckEnabled } = useContrastCheck();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingProgrammatically = useRef(false);

  // Helper function to generate step names (e.g., primary-100, primary-200)
  const getStepName = (tokenName: string, stepIndex: number, totalSteps: number) => {
    const colorToken = system.colors[tokenName as keyof typeof system.colors];
    if (!colorToken) return `${tokenName}-${stepIndex + 1}`;
    
    const steps = Math.round(colorToken.steps);
    const extraSteps = Math.max(0, steps - 12);
    
    // Get the step value using the same logic as ColorControl
    const getStepValue = (index: number): number => {
      // If this is one of the extra steps (primary-50 or primary-25)
      if (index < extraSteps) {
        // For index 0 with 2 extra steps, return 25
        // For index 0 with 1 extra step, return 50
        // For index 1 with 2 extra steps, return 50
        return index === 0 && extraSteps === 2 ? 25 : 50;
      }
      
      // Otherwise, standard 100-based scale
      return (index - extraSteps + 1) * 100;
    };
    
    const stepValue = getStepValue(stepIndex);
    return `${tokenName}-${stepValue}`;
  };

  // Helper function to generate actual color steps using the same logic as Color page
  const generateActualColorSteps = (tokenName: string) => {
    const colorToken = system.colors[tokenName as keyof typeof system.colors];
    if (!colorToken) return [];

    const steps = Math.round(colorToken.steps);
    const primaryStepIndex = colorToken.primaryStepIndex ?? Math.floor(steps / 2);
    
    // Use the EXACT same logic as the Color System page
    if (system.colorInterpolationMode === 'lch') {
      // LCH mode - use generateLchColorScale
      const colorSteps = generateLchColorScale(
        colorToken.hue,
        colorToken.saturation,
        colorToken.lightness,
        colorToken.alpha,
        steps,
        primaryStepIndex,
        colorToken.lightnessEasingLight || 'ease-out',
        colorToken.lightnessEasingDark || 'ease-in',
        colorToken.saturationEasingLight || 'linear',
        colorToken.saturationEasingDark || 'linear',
        colorToken.customLightnessCurveLight,
        colorToken.customLightnessCurveDark,
        colorToken.customSaturationCurveLight,
        colorToken.customSaturationCurveDark,
        tokenName,
        colorToken.primaryOffset || 0,
        colorToken.whiteOffset || 0,
        colorToken.blackOffset || 0,
        colorToken.stepPadding || 1
      );
      
      return colorSteps;
    } else {
      // HSL mode - use the same fallback algorithm as Color System page
      const primaryLightness = colorToken.lightness;
      const minLightness = 12;   // Darkest possible - not too close to black
      const maxLightness = 98;  // Lightest possible
      
      // Special handling for utility colors (Success, Warning, Destructive) with limited steps
      const isUtilityColor = (tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive');
      const adjustedMinLightness = isUtilityColor ? 25 : minLightness;
      
      // Generate lightness values using dual easing curves with offset support
      const lightnessValues = generateDualEasedStepsWithOffsets(
        steps,
        primaryStepIndex,
        primaryLightness,
        adjustedMinLightness,
        maxLightness,
        colorToken.lightnessEasingLight || 'ease-out',
        colorToken.lightnessEasingDark || 'ease-in',
        colorToken.customLightnessCurveLight,
        colorToken.customLightnessCurveDark,
        colorToken.primaryOffset || 0,
        colorToken.whiteOffset || 0,
        colorToken.blackOffset || 0,
        colorToken.stepPadding || 1
      );
      
      // Generate saturation values using smart saturation scaling
      const saturationValues = generateSmartSaturationSteps(
        steps,
        primaryStepIndex,
        colorToken.saturation,
        tokenName === 'neutrals' ? 'neutral' : 
        isUtilityColor ? 'utility' : 'standard',
        colorToken.saturationEasingLight || 'linear',
        colorToken.saturationEasingDark || 'linear',
        colorToken.customSaturationCurveLight,
        colorToken.customSaturationCurveDark
      );
      
      // Generate the actual color steps with calculated values
      const colorSteps = [];
      for (let i = 0; i < steps; i++) {
        const stepLightness = lightnessValues[i];
        const stepSaturation = saturationValues[i];
        
        const swatchHex = hslaToHex(
          colorToken.hue, 
          stepSaturation, 
          stepLightness, 
          colorToken.alpha
        );
        
        colorSteps.push({
          h: colorToken.hue,
          s: stepSaturation,
          l: stepLightness,
          a: colorToken.alpha,
          hex: swatchHex
        });
      }
      
      return colorSteps;
    }
  };

  // Calculate the primary step lightness for the primary color
  const getPrimaryStepLightness = (): number => {
    const primary = system.colors.primary;
    const primaryStepIndex = primary.primaryStepIndex ?? 5;
    const steps = Math.round(primary.steps);
    
    if (primary.primaryStepIndex !== undefined) {
      return primary.lightness;
    }
    
    const extraSteps = Math.max(0, steps - 12);
    const standardPrimaryIndex = Math.ceil((steps - extraSteps) / 2) - 1 + extraSteps;
    const baseMinLightness = 5;
    const baseMaxLightness = 95;
    const baseLightnessRange = baseMaxLightness - baseMinLightness;
    
    return baseMaxLightness - (standardPrimaryIndex / (steps - 1)) * baseLightnessRange;
  };

  // Check if white text has good contrast on primary color background
  const shouldUseWhiteTextOnPrimary = (): boolean => {
    const primary = system.colors.primary;
    const primaryLightness = getPrimaryStepLightness();
    
    const whiteContrast = calculateContrastRatio(primary.hue, primary.saturation, primaryLightness, "#FFFFFF");
    const blackContrast = calculateContrastRatio(primary.hue, primary.saturation, primaryLightness, "#000000");
    
    return whiteContrast >= 4.5 && whiteContrast > blackContrast;
  };
  
  // Create CSS variables from the design system
  const getCSSVariables = () => {
    const primary = system.colors.primary;
    const secondary = system.colors.secondary;
    const accent = system.colors.accent;
    const destructive = system.colors.destructive;
    const success = system.colors.success;
    const warning = system.colors.warning;
    const neutrals = system.colors.neutrals;
    
    const hoverLightness = system.isDark ? 
      Math.min(primary.lightness + 10, 95) : 
      Math.max(primary.lightness - 5, 5);
    
    const primaryStepLightness = getPrimaryStepLightness();
    const useWhiteText = shouldUseWhiteTextOnPrimary();
    
    return {
      '--primary': `${primary.hue} ${primary.saturation}% ${primaryStepLightness}%`,
      '--primary-foreground': useWhiteText ? '0 0% 100%' : '0 0% 0%',
      '--secondary': `${secondary.hue} ${secondary.saturation}% ${secondary.lightness}%`,
      '--secondary-foreground': secondary.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--accent': `${primary.hue} ${Math.max(primary.saturation - 40, 5)}% ${system.isDark ? 15 : 96}%`,
      '--accent-foreground': system.isDark ? '0 0% 100%' : '0 0% 0%',
      '--destructive': `${destructive.hue} ${destructive.saturation}% ${destructive.lightness}%`,
      '--destructive-foreground': destructive.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--ring': `${primary.hue} ${primary.saturation}% ${primaryStepLightness}%`,
    } as React.CSSProperties;
  };

  // Handler for radius adjustment
  const handleRadiusChange = (stepName: string, value: number) => {
    dispatch({ type: 'UPDATE_RADIUS_SCALE', stepName, value });
  };

  // Handler for generating design system
  const handleGenerateDesignSystem = () => {
    setExportType('design-system');
    setPaymentModalOpen(true);
  };

  // Handler for Figma export
  const handleFigmaExport = () => {
    setExportType('figma');
    setPaymentModalOpen(true);
  };

  // Handler for successful payment
  const handlePaymentSuccess = () => {
    if (exportType === 'design-system') {
      // Generate design system files
      toast({
        title: "Design System Generated",
        description: "Your design system tokens have been generated and are downloading.",
      });
    } else {
      // Export to Figma
      toast({
        title: "Figma Export Complete",
        description: "Your design tokens have been exported to Figma successfully.",
      });
    }
  };

  const background = system.colors.background || {
    hue: 210,
    saturation: 5,
    lightness: 98,
    alpha: 1,
    steps: 9,
    skewLightIntensity: 0,
    skewDarkIntensity: 0
  };

  // Get primary color for active states
  const primaryStepLightness = getPrimaryStepLightness();
  const useWhiteText = shouldUseWhiteTextOnPrimary();
  const primaryColor = `hsl(${system.colors.primary.hue}, ${system.colors.primary.saturation}%, ${primaryStepLightness}%)`;
  const primaryTextColor = useWhiteText ? '#ffffff' : '#000000';

  // Sidebar content for Preview Settings
  const sidebarContent = (
    <div className="space-y-6 py-4">
      {/* Viewport Controls */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Viewport
        </h4>
        <div className="space-y-2">
          <Button
            variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setViewportSize('mobile')}
            style={viewportSize === 'mobile' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              borderColor: primaryColor
            } : {}}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
          <Button
            variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setViewportSize('tablet')}
            style={viewportSize === 'tablet' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              borderColor: primaryColor
            } : {}}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Tablet
          </Button>
          <Button
            variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setViewportSize('desktop')}
            style={viewportSize === 'desktop' ? {
              backgroundColor: primaryColor,
              color: primaryTextColor,
              borderColor: primaryColor
            } : {}}
          >
            <Laptop className="h-4 w-4 mr-2" />
            Desktop
          </Button>
        </div>
      </div>

      {/* Component Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Component Settings
        </h4>
        <div className="space-y-3">
                  <div className="flex items-center justify-between">
          <Label htmlFor="accessibility" className="text-sm">Accessibility Mode</Label>
          <Switch
            id="accessibility"
            checked={enableAccessibility}
            onCheckedChange={setEnableAccessibility}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="compact" className="text-sm">Compact Mode</Label>
          <Switch
            id="compact"
            checked={enableCompactMode}
            onCheckedChange={setEnableCompactMode}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Theme
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="dark-mode" className="text-sm">Dark Mode</Label>
            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
          </div>
          <Switch
            id="dark-mode"
            checked={system.isDark}
            onCheckedChange={() => dispatch({ type: 'TOGGLE_THEME' })}
            disabled={true}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Color Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Colors
        </h4>
        <div className="flex items-center justify-between">
          <Label htmlFor="accent-color-enabled" className="text-sm">Accent Color</Label>
          <Switch
            id="accent-color-enabled"
            checked={accentColorEnabled}
            onCheckedChange={() => dispatch({ type: 'TOGGLE_ACCENT_COLOR' })}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-contrast-data" className="text-sm">Show Contrast Compliance</Label>
          <Switch
            id="show-contrast-data"
            checked={showSwatchData}
            onCheckedChange={setShowSwatchData}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="delta-e-check" className="text-sm">ΔE Check</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Warns when ΔE (Delta E) is &lt; 10, which indicates redundancy of paired colors due to being too close in perceived difference.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="delta-e-check"
            checked={deltaECheckEnabled}
            onCheckedChange={setDeltaECheckEnabled}
            className="data-[state=checked]:bg-[var(--switch-primary)]"
            style={{
              '--switch-primary': primaryColor
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Eye className="h-4 w-4 mr-2" />
            Preview Mode
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Palette className="h-4 w-4 mr-2" />
            Color Contrast Check
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Type className="h-4 w-4 mr-2" />
            Typography Scale
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="pt-4 border-t space-y-3">
        <Button 
          onClick={handleGenerateDesignSystem}
          className="w-full"
          size="lg"
          style={{
            backgroundColor: primaryColor,
            color: primaryTextColor,
            borderColor: primaryColor
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Design System
        </Button>
        
        <Button 
          onClick={handleFigmaExport}
          className="w-full"
          size="lg"
          variant="outline"
          style={{
            borderColor: primaryColor,
            color: primaryColor
          }}
        >
          <Figma className="h-4 w-4 mr-2" />
          Export To Figma
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <PageSidebar>
        {sidebarContent}
      </PageSidebar>
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Canvas Content */}
        <div 
          className="flex-1 overflow-auto p-6 flex justify-center"
          style={{ 
            background: system.isDark ? 'var(--background-dark, #121212)' : '#ffffff',
            ...getCSSVariables()
          }}
        >
          <div 
            className={`${
              viewportSize === 'mobile' ? 'max-w-xs' : 
              viewportSize === 'tablet' ? 'max-w-md' : 
              'max-w-5xl'
            } w-full transition-all relative`}
            style={{ 
              '--background-light': `hsl(${background.hue}, ${background.saturation}%, ${background.lightness}%)`,
              '--background-dark': `hsl(${background.hue}, ${background.saturation}%, 10%)` 
            } as React.CSSProperties}
          >
            {/* Device Buttons - Top Right */}
            <div className="absolute top-0 right-0 flex items-center space-x-2 mb-6" style={getCSSVariables()}>
              <Button
                variant={viewportSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
                className="px-2"
                onClick={() => setViewportSize('mobile')}
                aria-label="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={viewportSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
                className="px-2"
                onClick={() => setViewportSize('tablet')}
                aria-label="Tablet view"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewportSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
                className="px-2"
                onClick={() => setViewportSize('desktop')}
                aria-label="Desktop view"
              >
                <Laptop className="h-4 w-4" />
              </Button>
            </div>

            {/* Component Showcase */}
            <div className="space-y-12 pt-16">
              {/* Color Swatches */}
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
                
                <div className={`grid gap-6 ${
                  accentColorEnabled 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 md:grid-cols-2'
                }`}>
                  {/* Primary Colors */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Primary</h3>
                    <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                      {generateActualColorSteps('primary').map((step, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                style={{
                                  backgroundColor: step.hex
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <div className="font-medium">{getStepName('primary', i, generateActualColorSteps('primary').length)}</div>
                                <div className="text-xs text-muted-foreground">{step.hex}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Colors */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Secondary</h3>
                    <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                      {generateActualColorSteps('secondary').map((step, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                style={{
                                  backgroundColor: step.hex
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <div className="font-medium">{getStepName('secondary', i, generateActualColorSteps('secondary').length)}</div>
                                <div className="text-xs text-muted-foreground">{step.hex}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors - only show when enabled */}
                  {accentColorEnabled && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">Accent</h3>
                      <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                        {generateActualColorSteps('accent').map((step, i) => (
                          <TooltipProvider key={i}>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                  style={{
                                    backgroundColor: step.hex
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-medium">{getStepName('accent', i, generateActualColorSteps('accent').length)}</div>
                                  <div className="text-xs text-muted-foreground">{step.hex}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Utility Colors - Success, Warning, Destructive */}
                  <div className={`space-y-3 ${!accentColorEnabled ? 'md:col-span-2' : 'lg:col-span-3'}`}>
                    <h3 className="text-sm font-medium text-muted-foreground">Utility Colors</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Success Colors */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Success</h4>
                        <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                          {generateActualColorSteps('success').map((step, i) => (
                            <TooltipProvider key={i}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                    style={{
                                      backgroundColor: step.hex
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <div className="font-medium">{getStepName('success', i, generateActualColorSteps('success').length)}</div>
                                    <div className="text-xs text-muted-foreground">{step.hex}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>

                      {/* Warning Colors */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Warning</h4>
                        <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                          {generateActualColorSteps('warning').map((step, i) => (
                            <TooltipProvider key={i}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                    style={{
                                      backgroundColor: step.hex
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <div className="font-medium">{getStepName('warning', i, generateActualColorSteps('warning').length)}</div>
                                    <div className="text-xs text-muted-foreground">{step.hex}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>

                      {/* Destructive Colors */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Destructive</h4>
                        <div className="flex h-12 rounded-lg overflow-hidden border border-border">
                          {generateActualColorSteps('destructive').map((step, i) => (
                            <TooltipProvider key={i}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="flex-1 cursor-pointer border border-transparent hover:border-foreground/20 transition-all duration-150"
                                    style={{
                                      backgroundColor: step.hex
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-center">
                                    <div className="font-medium">{getStepName('destructive', i, generateActualColorSteps('destructive').length)}</div>
                                    <div className="text-xs text-muted-foreground">{step.hex}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Detailed Color Controls - only show when contrast or ΔE check is enabled */}
              {(showSwatchData || deltaECheckEnabled) && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-4">Detailed Color Analysis</h2>
                  
                  <div className="space-y-8">
                    <ColorControl 
                      tokenName="primary" 
                      label="Primary Color"
                      showSteps={true}
                      showContrastData={showSwatchData}
                    />
                    
                    <ColorControl 
                      tokenName="secondary" 
                      label="Secondary Color"
                      showSteps={true}
                      showContrastData={showSwatchData}
                    />
                    
                    {accentColorEnabled && (
                      <ColorControl 
                        tokenName="accent" 
                        label="Accent Color"
                        showSteps={true}
                        showContrastData={showSwatchData}
                      />
                    )}
                    
                    <ColorControl 
                      tokenName="success" 
                      label="Success Color"
                      showSteps={true}
                      showContrastData={showSwatchData}
                    />
                    
                    <ColorControl 
                      tokenName="warning" 
                      label="Warning Color"
                      showSteps={true}
                      showContrastData={showSwatchData}
                    />
                    
                    <ColorControl 
                      tokenName="destructive" 
                      label="Destructive Color"
                      showSteps={true}
                      showContrastData={showSwatchData}
                    />
                  </div>
                </section>
              )}

              {/* Button Showcase */}
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Button Components</h2>
                
                {/* Default Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Default</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button>Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>

                {/* Outline Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Outline</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="outline">Medium</Button>
                    <Button variant="outline" size="lg">Large</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                  </div>
                </div>

                {/* Ghost Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Ghost</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" size="sm">Small</Button>
                    <Button variant="ghost">Medium</Button>
                    <Button variant="ghost" size="lg">Large</Button>
                    <Button variant="ghost" disabled>Disabled</Button>
                  </div>
                </div>

                {/* Link Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Link</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="link" size="sm">Small</Button>
                    <Button variant="link">Medium</Button>
                    <Button variant="link" size="lg">Large</Button>
                    <Button variant="link" disabled>Disabled</Button>
                  </div>
                </div>

                {/* Destructive Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-muted-foreground">Destructive</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="destructive" size="sm">Delete</Button>
                    <Button variant="destructive">Remove</Button>
                    <Button variant="destructive" size="lg">Destroy</Button>
                    <Button variant="destructive" disabled>Disabled</Button>
                  </div>
                </div>
              </section>

              {/* Card Samples with Date and Tags */}
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Card Components</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Blog Post Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Getting Started with Design Systems</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Dec 15, 2024</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              Design, Tutorial
                            </span>
                          </span>
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Learn how to create consistent and scalable design systems for your projects with this comprehensive guide.</p>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button variant="outline">Read Later</Button>
                      <Button>Read Now</Button>
                    </CardFooter>
                  </Card>

                  {/* Product Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Premium Design Package</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated Dec 12, 2024</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              Premium, UI Kit
                            </span>
                          </span>
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Complete design system with 200+ components, tokens, and documentation for modern web applications.</p>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button variant="outline">Preview</Button>
                      <Button>Purchase</Button>
                    </CardFooter>
                  </Card>

                  {/* Event Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Design System Workshop</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Jan 20, 2025</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              Workshop, Live
                            </span>
                          </span>
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Join our interactive workshop to learn advanced design system techniques and best practices.</p>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button variant="outline">Learn More</Button>
                      <Button>Register</Button>
                    </CardFooter>
                  </Card>

                  {/* Project Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Mobile App Redesign</CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due Dec 28, 2024</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              Mobile, In Progress
                            </span>
                          </span>
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Complete redesign of the mobile application using our new design system components and patterns.</p>
                    </CardContent>
                    <CardFooter className="flex gap-3">
                      <Button variant="outline">View Progress</Button>
                      <Button>Open Project</Button>
                    </CardFooter>
                  </Card>
                </div>
              </section>

              {/* Form Elements */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Enter your name" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch id="terms" />
                      <Label htmlFor="terms">Accept terms and conditions</Label>
                    </div>
                    
                    <Button className="w-full">Submit</Button>
                  </CardContent>
                </Card>
              </section>

              {/* Tabs */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Tabs</h2>
                <Tabs defaultValue="account">
                  <TabsList className="mb-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="p-4 border rounded-md">
                    <p>Account tab content with user profile settings and preferences.</p>
                  </TabsContent>
                  <TabsContent value="settings" className="p-4 border rounded-md">
                    <p>Settings tab content with application configuration options.</p>
                  </TabsContent>
                  <TabsContent value="notifications" className="p-4 border rounded-md">
                    <p>Notifications tab content with alert and messaging preferences.</p>
                  </TabsContent>
                </Tabs>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        exportType={exportType}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Preview;
