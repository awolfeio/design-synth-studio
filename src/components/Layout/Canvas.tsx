import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Laptop, Smartphone, Monitor } from 'lucide-react';

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

export const Canvas: React.FC = () => {
  const { system, componentVariant } = useDesignSystem();
  const [viewportSize, setViewportSize] = React.useState<string>('desktop');

  // Calculate the primary step lightness for the primary color
  const getPrimaryStepLightness = (): number => {
    const primary = system.colors.primary;
    const primaryStepIndex = primary.primaryStepIndex ?? 5;
    const steps = Math.round(primary.steps);
    
    // If primaryStepIndex is defined, use custom positioning logic
    if (primary.primaryStepIndex !== undefined) {
      return primary.lightness; // Use the actual lightness value for primary step
    }
    
    // Fallback to standard calculation if needed
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
    
    // Use white text if it has better contrast than black, and meets AA standards
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
    
    // For hover states, use a subtle version of primary color instead of bright accent
    const hoverLightness = system.isDark ? 
      Math.min(primary.lightness + 10, 95) : // Lighten in dark mode
      Math.max(primary.lightness - 5, 5);    // Darken in light mode
    
    // Use the actual primary step lightness for proper contrast calculation
    const primaryStepLightness = getPrimaryStepLightness();
    const useWhiteText = shouldUseWhiteTextOnPrimary();
    
    return {
      '--primary': `${primary.hue} ${primary.saturation}% ${primaryStepLightness}%`,
      '--primary-foreground': useWhiteText ? '0 0% 100%' : '0 0% 0%',
      '--secondary': `${secondary.hue} ${secondary.saturation}% ${secondary.lightness}%`,
      '--secondary-foreground': secondary.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--accent': `${primary.hue} ${Math.max(primary.saturation - 40, 5)}% ${system.isDark ? 15 : 96}%`, // Subtle hover color
      '--accent-foreground': system.isDark ? '0 0% 100%' : '0 0% 0%',
      '--destructive': `${destructive.hue} ${destructive.saturation}% ${destructive.lightness}%`,
      '--destructive-foreground': destructive.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--ring': `${primary.hue} ${primary.saturation}% ${primaryStepLightness}%`,
    } as React.CSSProperties;
  };

  // Use default values if background is undefined
  const background = system.colors.background || {
    hue: 210,
    saturation: 5,
    lightness: 98,
    alpha: 1,
    steps: 9,
    skewLightIntensity: 0,
    skewDarkIntensity: 0
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
      {/* Canvas Content */}
      <div 
        className="flex-1 overflow-auto p-6 flex justify-center"
        style={{ 
          background: system.isDark ? 'var(--background-dark, #121212)' : 'var(--background-light, #f8f9fa)',
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
              <Laptop className="h-4 w-4" />
            </Button>
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'outline'}
              size="sm"
              className="px-2"
              onClick={() => setViewportSize('desktop')}
              aria-label="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Sample Components Preview */}
          <div className="space-y-10 pt-12" style={{ color: system.isDark ? '#f8f9fa' : '#121212' }}>
            {/* Button Samples */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Buttons</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant={componentVariant} size="sm">Small Button</Button>
                <Button variant={componentVariant}>Default Button</Button>
                <Button variant={componentVariant} size="lg">Large Button</Button>
                <Button variant={componentVariant} disabled>Disabled</Button>
              </div>
            </section>

            {/* Card Sample */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Card</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a sample card component that shows how your design system looks with current settings.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button variant={componentVariant}>Action</Button>
                </CardFooter>
              </Card>
            </section>

            {/* Form Elements */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Form Elements</h2>
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
                  
                  <Button variant={componentVariant} className="w-full">Submit</Button>
                </CardContent>
              </Card>
            </section>

            {/* Tabs */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Tabs</h2>
              <Tabs defaultValue="account">
                <TabsList className="mb-2">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="p-4 border rounded-md">
                  <p>Account tab content</p>
                </TabsContent>
                <TabsContent value="settings" className="p-4 border rounded-md">
                  <p>Settings tab content</p>
                </TabsContent>
                <TabsContent value="notifications" className="p-4 border rounded-md">
                  <p>Notifications tab content</p>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
