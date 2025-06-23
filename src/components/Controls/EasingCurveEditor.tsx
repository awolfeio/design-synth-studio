import React from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EasingCurve } from '@/types/designTokens';
import { getEasingCurvePoints } from '@/lib/easingUtils';

interface EasingCurveEditorProps {
  label: string;
  value: EasingCurve;
  customCurve?: number[];
  onChange: (curve: EasingCurve) => void;
  onCustomCurveChange?: (curve: number[]) => void;
}

export const EasingCurveEditor: React.FC<EasingCurveEditorProps> = ({
  label,
  value,
  customCurve,
  onChange,
  onCustomCurveChange
}) => {
  const curvePoints = getEasingCurvePoints(value, customCurve);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label className="text-xs">{label}</Label>
      </div>
      
      <Select value={value} onValueChange={(v) => onChange(v as EasingCurve)}>
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="linear">Linear</SelectItem>
          <SelectItem value="ease-in">Ease In</SelectItem>
          <SelectItem value="ease-out">Ease Out</SelectItem>
          <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
          <SelectItem value="ease-in-cubic">Ease In Cubic</SelectItem>
          <SelectItem value="ease-out-cubic">Ease Out Cubic</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Visual curve preview */}
      <div className="mt-2 p-2 bg-muted/50 rounded">
        <svg width="100%" height="60" viewBox="0 0 100 100" className="w-full">
          {/* Grid lines */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeOpacity="0.1" />
          
          {/* Diagonal reference line */}
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2,2" />
          
          {/* Easing curve */}
          <polyline
            points={curvePoints}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          
          {/* Start and end points */}
          <circle cx="0" cy="100" r="3" fill="hsl(var(--primary))" />
          <circle cx="100" cy="0" r="3" fill="hsl(var(--primary))" />
        </svg>
        
        <div className="text-xs text-muted-foreground text-center mt-1">
          {value === 'linear' && 'Uniform distribution'}
          {value === 'ease-in' && 'Slow start, fast end'}
          {value === 'ease-out' && 'Fast start, slow end'}
          {value === 'ease-in-out' && 'Slow start and end'}
          {value === 'ease-in-cubic' && 'Very slow start'}
          {value === 'ease-out-cubic' && 'Very slow end'}
        </div>
      </div>
    </div>
  );
}; 