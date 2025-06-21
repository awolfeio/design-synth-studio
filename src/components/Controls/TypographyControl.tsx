
import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FontToken } from '@/types/designTokens';

interface TypographyControlProps {
  tokenName: string;
  label: string;
}

export const TypographyControl: React.FC<TypographyControlProps> = ({ tokenName, label }) => {
  const { system, dispatch } = useDesignSystem();
  const { setActiveTypographyControl, setControlProps } = useTypographyControl();
  const font = system.fonts[tokenName];

  const updateFontProperty = (property: keyof FontToken, value: string | number) => {
    dispatch({
      type: 'UPDATE_FONT',
      fontName: tokenName,  // Changed from tokenName to fontName to match the action type
      property,
      value: typeof value === 'string' ? value : Number(value)
    });
  };

  const fontFamilies = [
    { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter' },
    { value: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', label: 'Roboto' },
    { value: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Open Sans' },
    { value: '"Playfair Display", Georgia, serif', label: 'Playfair Display' },
    { value: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace', label: 'JetBrains Mono' },
    { value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'System UI' },
    { value: 'Georgia, "Times New Roman", Times, serif', label: 'Serif' },
    { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Sans Serif' },
    { value: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', label: 'Monospace' }
  ];

  // Function to activate this typography control in the sidebar
  const activateTypographyControl = () => {
    setActiveTypographyControl(tokenName);
    setControlProps({
      tokenName,
      label,
      updateFontProperty,
      fontFamilies,
      getHeadingSizes,
      getPreviewContent
    });
  };

  // Calculate heading sizes based on scale
  const getHeadingSizes = () => {
    const scale = font.headingScale || 1.25;
    const baseSize = font.size;
    
    return {
      h1: baseSize * Math.pow(scale, 4), // Largest
      h2: baseSize * Math.pow(scale, 3),
      h3: baseSize * Math.pow(scale, 2),
      h4: baseSize * Math.pow(scale, 1),
      h5: baseSize, // Base size
      h6: baseSize / scale // Smallest
    };
  };

  // Generate preview content based on font type
  const getPreviewContent = () => {
    const baseStyle = {
      fontFamily: font.family,
      fontWeight: font.weight,
      letterSpacing: `${font.letterSpacing}px`
    };

    switch (tokenName) {
      case 'heading': {
        const sizes = getHeadingSizes();
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">H1 ({Math.round(sizes.h1)}px)</Label>
              <h1 style={{ ...baseStyle, fontSize: `${sizes.h1}px`, lineHeight: font.lineHeight }}>
                The Quick Brown Fox
              </h1>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">H2 ({Math.round(sizes.h2)}px)</Label>
              <h2 style={{ ...baseStyle, fontSize: `${sizes.h2}px`, lineHeight: font.lineHeight }}>
                The Quick Brown Fox Jumps
              </h2>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">H3 ({Math.round(sizes.h3)}px)</Label>
              <h3 style={{ ...baseStyle, fontSize: `${sizes.h3}px`, lineHeight: font.lineHeight }}>
                The Quick Brown Fox Jumps Over
              </h3>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">H4 ({Math.round(sizes.h4)}px)</Label>
              <h4 style={{ ...baseStyle, fontSize: `${sizes.h4}px`, lineHeight: font.lineHeight }}>
                The Quick Brown Fox Jumps Over The Lazy
              </h4>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">H5 ({Math.round(sizes.h5)}px)</Label>
              <h5 style={{ ...baseStyle, fontSize: `${sizes.h5}px`, lineHeight: font.lineHeight }}>
                The Quick Brown Fox Jumps Over The Lazy Dog
              </h5>
            </div>
          </div>
        );
      }
      case 'mono':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
              <code 
                className="block p-3 bg-white border border-gray-300 rounded text-gray-900"
                style={{ ...baseStyle, fontSize: `${font.size}px`, lineHeight: font.lineHeight }}
              >
                {`const message = "Hello, World!";\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet("Developer"));`}
              </code>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
              <code 
                className="block p-3 bg-gray-900 border border-gray-700 rounded text-green-400"
                style={{ ...baseStyle, fontSize: `${font.size}px`, lineHeight: font.lineHeight }}
              >
                {`const message = "Hello, World!";\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet("Developer"));`}
              </code>
            </div>
          </div>
        );
      default:
        return (
          <div 
            style={{ ...baseStyle, fontSize: `${font.size}px`, lineHeight: font.lineHeight }}
          >
            The quick brown fox jumps over the lazy dog. This is a sample of body text that demonstrates how the font looks in a paragraph format with multiple lines of text.
          </div>
        );
    }
  };

  return (
    <div className="mb-8 w-full cursor-pointer rounded-xl p-4 transition-colors hover:bg-gray-50/80 active:bg-gray-100/80" onClick={activateTypographyControl}>
      <div className="flex items-center mb-4">
        <Label className="text-lg font-medium">{label}</Label>
      </div>
      
      {/* Preview display */}
      <div className="p-6 border border-border rounded-lg bg-background">
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground">Preview</Label>
        </div>
        <div className="text-foreground">
          {getPreviewContent()}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Family: {font.family}</div>
            <div>Size: {font.size}px</div>
            <div>Weight: {font.weight}</div>
            <div>Line Height: {font.lineHeight}</div>
            <div>Letter Spacing: {font.letterSpacing}px</div>
            {font.headingScale && (
              <div>Heading Scale: {font.headingScale.toFixed(2)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
