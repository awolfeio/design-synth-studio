import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ChevronLeft } from 'lucide-react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { TypographyGroup } from '@/types/designTokens';

interface TypographyGroupControlSidebarProps {
  groupName: string;
  label: string;
}

export const TypographyGroupControlSidebar: React.FC<TypographyGroupControlSidebarProps> = ({
  groupName,
  label
}) => {
  const { system, dispatch } = useDesignSystem();
  const { setActiveTypographyControl } = useTypographyControl();
  const group = system.fonts[groupName] as TypographyGroup;

  if (!group || !('scale_tokens' in group)) return null;

  const fontFamilies = [
    { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter' },
    { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times, serif', label: 'Times' },
    { value: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace', label: 'JetBrains Mono' },
    { value: 'SF Mono, Monaco, Consolas, monospace', label: 'SF Mono' }
  ];

  const updateGroupProperty = (property: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_TYPOGRAPHY_GROUP',
      groupName,
      property,
      value
    });
  };

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTypographyControl(null)}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">{label} Controls</h3>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Font Family</Label>
        <Select value={group.family} onValueChange={(value) => updateGroupProperty('family', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((family) => (
              <SelectItem key={family.value} value={family.value}>{family.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Base Size (px)</Label>
          <span className="text-xs text-muted-foreground">{group.baseSize}px</span>
        </div>
        <Slider
          min={8}
          max={32}
          step={1}
          value={[group.baseSize]}
          onValueChange={([value]) => updateGroupProperty('baseSize', value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Scale Multiplier</Label>
          <span className="text-xs text-muted-foreground">{group.scale.toFixed(3)}</span>
        </div>
        <Slider
          min={1.05}
          max={1.5}
          step={0.005}
          value={[group.scale]}
          onValueChange={([value]) => updateGroupProperty('scale', value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Weight</Label>
          <span className="text-xs text-muted-foreground">{group.weight}</span>
        </div>
        <Slider
          min={100}
          max={900}
          step={100}
          value={[group.weight]}
          onValueChange={([value]) => updateGroupProperty('weight', value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Line Height</Label>
          <span className="text-xs text-muted-foreground">{group.lineHeight.toFixed(1)}</span>
        </div>
        <Slider
          min={1}
          max={2}
          step={0.1}
          value={[group.lineHeight]}
          onValueChange={([value]) => updateGroupProperty('lineHeight', value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs">Letter Spacing</Label>
          <span className="text-xs text-muted-foreground">{group.letterSpacing.toFixed(1)}px</span>
        </div>
        <Slider
          min={-2}
          max={10}
          step={0.1}
          value={[group.letterSpacing]}
          onValueChange={([value]) => updateGroupProperty('letterSpacing', value)}
        />
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Generated Sizes
        </h4>
        <div className="space-y-2">
          {Object.entries(group.scale_tokens).map(([size, token]) => (
            <div key={size} className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground uppercase">{size}</span>
              <span className="text-muted-foreground">{token.size}px</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 