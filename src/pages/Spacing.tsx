import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PageSidebar } from '@/components/Layout/PageSidebar';
import { useDesignSystem } from '@/contexts/DesignSystemContext';

const Spacing = () => {
  const [baseSize, setBaseSize] = useState(16);
  const [scale, setScale] = useState(1.5);
  const [unit, setUnit] = useState<'px' | 'rem'>('px');
  const { system } = useDesignSystem();

  // Calculate primary color
  const getPrimaryColor = () => {
    const primary = system.colors.primary;
    const primaryStepIndex = primary.primaryStepIndex ?? 5;
    const steps = Math.round(primary.steps);
    
    let primaryLightness = primary.lightness;
    if (primary.primaryStepIndex === undefined) {
      const extraSteps = Math.max(0, steps - 12);
      const standardPrimaryIndex = Math.ceil((steps - extraSteps) / 2) - 1 + extraSteps;
      const baseMinLightness = 5;
      const baseMaxLightness = 95;
      const baseLightnessRange = baseMaxLightness - baseMinLightness;
      
      primaryLightness = baseMaxLightness - (standardPrimaryIndex / (steps - 1)) * baseLightnessRange;
    }
    
    return `hsl(${primary.hue}, ${primary.saturation}%, ${primaryLightness}%)`;
  };

  // Generate spacing scale with 10 steps
  const generateSpacingScale = () => {
    const steps = [
      { name: 'xxs', multiplier: 0.25 },
      { name: 'xs', multiplier: 0.5 },
      { name: 'sm', multiplier: 0.75 },
      { name: 'md', multiplier: 1 },
      { name: 'lg', multiplier: 1.5 },
      { name: 'xl', multiplier: 2 },
      { name: '2xl', multiplier: 3 },
      { name: '3xl', multiplier: 4 },
      { name: '4xl', multiplier: 5 },
      { name: '5xl', multiplier: 6 }
    ];

    // First pass: calculate raw values
    const rawValues = steps.map(step => {
      // Make md step exactly equal to baseSize - never modify this
      if (step.name === 'md') {
        return {
          name: step.name,
          value: baseSize
        };
      }
      
      let rawValue;
      if (step.multiplier < 1) {
        // For smaller steps, use division to make them smaller than baseSize
        rawValue = baseSize * step.multiplier / scale;
      } else {
        // For larger steps, use multiplication with the scale
        rawValue = baseSize * step.multiplier * scale;
      }
      
      let roundedValue = Math.round(rawValue);
      
      // Ensure all values are even numbers for 8 & 4 point grid
      if (roundedValue % 2 !== 0) {
        // Round to nearest even number, prioritizing 4-point increments
        const lower = roundedValue - 1;
        const upper = roundedValue + 1;
        
        // Choose the even number that's closest to a multiple of 4
        const lowerMod4 = lower % 4;
        const upperMod4 = upper % 4;
        
        if (lowerMod4 === 0 || (upperMod4 !== 0 && lowerMod4 < upperMod4)) {
          roundedValue = lower;
        } else {
          roundedValue = upper;
        }
      }
      
      // Ensure minimum value of 2 for very small steps
      roundedValue = Math.max(2, roundedValue);
      
      return {
        name: step.name,
        value: roundedValue
      };
    });

    // Second pass: resolve duplicates to ensure proper progression
    const resolvedValues = [...rawValues];
    
    for (let i = 0; i < resolvedValues.length; i++) {
      // Never modify the md step - it must always equal baseSize
      if (resolvedValues[i].name === 'md') {
        continue;
      }
      
      // Check if current value is same as or less than previous value
      if (i > 0 && resolvedValues[i].value <= resolvedValues[i - 1].value) {
        // Find the next valid even number that's greater than the previous
        let nextValue = resolvedValues[i - 1].value + 2;
        
        // Prefer multiples of 4 when possible
        if (nextValue % 4 !== 0) {
          const nextMultipleOf4 = Math.ceil(nextValue / 4) * 4;
          if (nextMultipleOf4 - nextValue <= 2) {
            nextValue = nextMultipleOf4;
          }
        }
        
        resolvedValues[i].value = nextValue;
      }
      
      // Propagate changes forward if needed
      for (let j = i + 1; j < resolvedValues.length; j++) {
        // Never modify the md step - it must always equal baseSize
        if (resolvedValues[j].name === 'md') {
          continue;
        }
        
        if (resolvedValues[j].value <= resolvedValues[j - 1].value) {
          let nextValue = resolvedValues[j - 1].value + 2;
          
          // Prefer multiples of 4 when possible
          if (nextValue % 4 !== 0) {
            const nextMultipleOf4 = Math.ceil(nextValue / 4) * 4;
            if (nextMultipleOf4 - nextValue <= 2) {
              nextValue = nextMultipleOf4;
            }
          }
          
          resolvedValues[j].value = nextValue;
        } else {
          break; // No more adjustments needed
        }
      }
    }

    return resolvedValues;
  };

  const spacingScale = generateSpacingScale();
  const primaryColor = getPrimaryColor();

  return (
    <>
      <div className="py-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Spacing</h2>
        </div>

        {/* Horizontal Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Spacing Scale Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 justify-center">
              {spacingScale.map((step) => (
                <div key={step.name} className="flex flex-col items-center space-y-2">
                  <div 
                    className="rounded"
                    style={{ 
                      backgroundColor: primaryColor,
                      width: `${step.value}px`,
                      height: '16px'
                    }}
                  />
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {step.value}{unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {spacingScale.map((step) => (
                <div key={step.name} className="space-y-2">
                  <div className="text-sm font-medium">
                    Spacing: {step.name} ({step.value}{unit})
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {/* Padding Example */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Padding</div>
                      <div 
                        className="bg-blue-100 border border-blue-300 rounded inline-block"
                        style={{ padding: `${step.value}${unit}` }}
                      >
                        <div className="bg-white border border-gray-300 rounded text-xs px-2 py-1">
                          Content
                        </div>
                      </div>
                    </div>
                    
                    {/* Margin Example */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Margin</div>
                      <div className="bg-gray-100 border border-gray-300 rounded inline-block p-2">
                        <div 
                          className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                          style={{ margin: `${step.value}${unit}` }}
                        >
                          Element
                        </div>
                      </div>
                    </div>
                    
                    {/* Gap Example */}
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Gap</div>
                      <div 
                        className="flex bg-gray-100 border border-gray-300 rounded p-2"
                        style={{ gap: `${step.value}${unit}` }}
                      >
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">A</div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">B</div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">C</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CSS Output */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`:root {
${spacingScale.map(step => `  --spacing-${step.name}: ${step.value}${unit};`).join('\n')}
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <PageSidebar>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Spacing Configuration</h3>
            
            <div className="space-y-6">
              {/* Base Size */}
              <div className="space-y-2">
                <Label htmlFor="baseSize">Base Size</Label>
                <div className="flex gap-2">
                  <Input
                    id="baseSize"
                    type="number"
                    value={baseSize}
                    onChange={(e) => setBaseSize(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="flex-1"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'px' | 'rem')}
                    className="px-2 py-1 border border-border rounded-md bg-background text-sm"
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <Label htmlFor="scale">Scale Multiplier</Label>
                <div className="space-y-2">
                  <Slider
                    id="scale"
                    min={1.1}
                    max={2.0}
                    step={0.1}
                    value={[scale]}
                    onValueChange={([value]) => setScale(value)}
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {scale.toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSidebar>
    </>
  );
};

export default Spacing; 