
import React from 'react';
import { Button } from '../ui/button';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { PresetTheme } from '@/types/designTokens';
import { Sun, Moon, FileJson, RotateCcw, Download } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';

interface TopBarProps {
  onTokenViewerOpen: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onTokenViewerOpen }) => {
  const { system, dispatch, activatePreset, resetSystem } = useDesignSystem();

  const handleToggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const presets: PresetTheme[] = ['minimal', 'brutalist', 'neumorphic', 'glassmorphic', 'colorful'];

  // Create CSS variables from the design system
  const getCSSVariables = () => {
    const primary = system.colors.primary;
    const secondary = system.colors.secondary;
    const accent = system.colors.accent;
    const destructive = system.colors.destructive;
    
    return {
      '--primary': `${primary.hue} ${primary.saturation}% ${primary.lightness}%`,
      '--primary-foreground': primary.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--secondary': `${secondary.hue} ${secondary.saturation}% ${secondary.lightness}%`,
      '--secondary-foreground': secondary.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--accent': `${primary.hue} ${Math.max(primary.saturation - 40, 5)}% ${system.isDark ? 15 : 96}%`, // Subtle hover color
      '--accent-foreground': system.isDark ? '0 0% 100%' : '0 0% 0%',
      '--destructive': `${destructive.hue} ${destructive.saturation}% ${destructive.lightness}%`,
      '--destructive-foreground': destructive.lightness > 50 ? '0 0% 0%' : '0 0% 100%',
      '--ring': `${primary.hue} ${primary.saturation}% ${primary.lightness}%`,
    } as React.CSSProperties;
  };

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background" style={getCSSVariables()}>
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-bold">Preview</h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme presets */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Theme Presets</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Theme Preset</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {presets.map((preset) => (
              <DropdownMenuItem 
                key={preset}
                onClick={() => activatePreset(preset)}
                className="capitalize"
              >
                {preset}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Generate System */}
        <Button variant="default" size="sm">
          Generate System
        </Button>

        {/* Token Viewer Button */}
        <Button variant="outline" size="sm" onClick={onTokenViewerOpen}>
          <FileJson className="h-4 w-4 mr-1" />
          Tokens
        </Button>

        {/* Reset Button */}
        <Button variant="outline" size="sm" onClick={resetSystem}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>

        {/* Export Button */}
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>

        {/* Toggle Theme */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleToggleTheme}
          aria-label="Toggle theme"
        >
          {system.isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
