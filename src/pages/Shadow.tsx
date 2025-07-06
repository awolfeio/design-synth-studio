import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { PageSidebar } from '@/components/Layout/PageSidebar';

const Shadow = () => {
  const [baseSize, setBaseSize] = useState(8);
  const [baseYAxis, setBaseYAxis] = useState(4);
  const [scale, setScale] = useState(1.5);
  const [unit, setUnit] = useState<'px' | 'rem'>('px');
  const [baseOpacity, setBaseOpacity] = useState(0.1);
  const [opacityFalloff, setOpacityFalloff] = useState(0.2);
  const [yAxisMultiplier, setYAxisMultiplier] = useState(1.0);

  // Generate shadow scale with 6 steps
  const generateShadowScale = () => {
    const steps = [
      { name: 'xs', multiplier: 0.5 },
      { name: 'sm', multiplier: 0.75 },
      { name: 'md', multiplier: 1 },
      { name: 'lg', multiplier: 1.5 },
      { name: 'xl', multiplier: 2 },
      { name: '2xl', multiplier: 3 }
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

  const shadowScale = generateShadowScale();

  // Generate shadow CSS values
  const getShadowCSS = (blur: number, stepName: string) => {
    const baseOffset = baseYAxis;
    const spread = Math.round(blur * 0.1);
    
    // Calculate Y-axis offset based on step and multiplier
    let yOffset = baseOffset;
    
    if (yAxisMultiplier !== 1.0) {
      const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const stepIndex = steps.indexOf(stepName);
      const mdIndex = steps.indexOf('md');
      
      if (stepIndex !== mdIndex) {
        const stepsFromMd = stepIndex - mdIndex;
        
        if (stepIndex > mdIndex) {
          // For larger shadows (lg, xl, 2xl), increase Y offset
          const multiplier = 1 + (stepsFromMd * (yAxisMultiplier - 1));
          yOffset = Math.round(baseOffset * multiplier);
        } else {
          // For smaller shadows (xs, sm), reduce Y offset (invert)
          const multiplier = 1 - (Math.abs(stepsFromMd) * (yAxisMultiplier - 1) * 0.5);
          yOffset = Math.max(0, Math.round(baseOffset * multiplier));
        }
      }
    }
    
    // Calculate opacity based on step and falloff
    let opacity = baseOpacity;
    
    if (stepName === 'md') {
      // MD step uses base opacity directly
      opacity = baseOpacity;
    } else {
      // Find step index for opacity calculation
      const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const stepIndex = steps.indexOf(stepName);
      const mdIndex = steps.indexOf('md');
      
      if (stepIndex > mdIndex) {
        // For larger shadows (lg, xl, 2xl), reduce opacity
        const stepsFromMd = stepIndex - mdIndex;
        opacity = Math.max(0.01, baseOpacity - (stepsFromMd * opacityFalloff));
      } else {
        // For smaller shadows (xs, sm), keep base opacity or slightly increase
        opacity = baseOpacity;
      }
    }
    
    // Ensure opacity is between 0.01 and 1
    opacity = Math.max(0.01, Math.min(1, opacity));
    
    return `0 ${yOffset}${unit} ${blur}${unit} ${spread}${unit} rgba(0, 0, 0, ${opacity.toFixed(2)})`;
  };

  return (
    <>
      <div className="py-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Shadow</h2>
        </div>

        {/* Horizontal Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Shadow Scale Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {shadowScale.map((step) => (
                <div key={step.name} className="flex flex-col items-center space-y-3">
                  <div 
                    className="w-40 h-40 bg-white border border-border rounded-lg"
                    style={{ 
                      boxShadow: getShadowCSS(step.value, step.name)
                    }}
                  />
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {step.value}{unit} blur
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {getShadowCSS(step.value, step.name)}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shadowScale.map((step) => (
                  <div key={step.name} className="space-y-2">
                    <div className="text-sm font-medium text-center">
                      Shadow: {step.name} ({step.value}{unit})
                    </div>
                    <div className="flex flex-col gap-3">
                      {/* Card Example */}
                      <div 
                        className="bg-white border border-border rounded-lg p-4 text-center"
                        style={{ boxShadow: getShadowCSS(step.value, step.name) }}
                      >
                        <div className="text-sm font-medium">Card</div>
                        <div className="text-xs text-muted-foreground">
                          shadow-{step.name}
                        </div>
                      </div>
                      
                      {/* Button Example */}
                      <button 
                        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90"
                        style={{ boxShadow: getShadowCSS(step.value, step.name) }}
                      >
                        Button
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
${shadowScale.map(step => `  --shadow-${step.name}: ${getShadowCSS(step.value, step.name)};`).join('\n')}
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <PageSidebar>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Shadow Configuration</h3>
            
            <div className="space-y-6">
              {/* Base Size and Y Axis Row */}
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="baseYAxis">Base Y Axis</Label>
                  <Input
                    id="baseYAxis"
                    type="number"
                    value={baseYAxis}
                    onChange={(e) => setBaseYAxis(Number(e.target.value))}
                    min={0}
                    max={50}
                  />
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

              {/* Base Opacity */}
              <div className="space-y-2">
                <Label htmlFor="baseOpacity">Base Opacity</Label>
                <div className="space-y-2">
                  <Slider
                    id="baseOpacity"
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    value={[baseOpacity]}
                    onValueChange={([value]) => setBaseOpacity(value)}
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {(baseOpacity * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Opacity Falloff */}
              <div className="space-y-2">
                <Label htmlFor="opacityFalloff">Opacity Falloff</Label>
                <div className="space-y-2">
                  <Slider
                    id="opacityFalloff"
                    min={0.0}
                    max={0.1}
                    step={0.01}
                    value={[opacityFalloff]}
                    onValueChange={([value]) => setOpacityFalloff(value)}
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    -{(opacityFalloff * 100).toFixed(0)}% per step
                  </div>
                </div>
              </div>

              {/* Y-Axis Multiplier */}
              <div className="space-y-2">
                <Label htmlFor="yAxisMultiplier">Y-Axis Multiplier</Label>
                <div className="space-y-2">
                  <Slider
                    id="yAxisMultiplier"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={[yAxisMultiplier]}
                    onValueChange={([value]) => setYAxisMultiplier(value)}
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {yAxisMultiplier.toFixed(1)}x
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

export default Shadow; 