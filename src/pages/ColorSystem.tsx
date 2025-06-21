import React, { useState } from 'react';
import { ColorControl } from '@/components/Controls/ColorControl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ColorSystem = () => {
  const [showSwatchData, setShowSwatchData] = useState(false);
  
  const primitiveTokens = [
    { name: 'primary', label: 'Primary Color' },
    { name: 'secondary', label: 'Secondary Color' },
    { name: 'accent', label: 'Accent Color' },
    { name: 'neutrals', label: 'Neutrals' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'destructive', label: 'Destructive' }
  ];

  const aliasTokens = [
    { name: 'border', label: 'Border' }
  ];

  return (
    <div className="py-6 space-y-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Color System</h2>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-swatch-data" className="text-sm">
            Show Contrast Compliance
          </Label>
          <Switch 
            id="show-swatch-data" 
            checked={showSwatchData} 
            onCheckedChange={setShowSwatchData} 
          />
        </div>
      </div>
      
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-medium mb-6">Primitive Tokens</h3>
          <div className="space-y-8">
            {primitiveTokens.map(({ name, label }) => (
              <ColorControl 
                key={name} 
                tokenName={name} 
                label={label}
                showSteps={true}
                showContrastData={showSwatchData}
              />
            ))}
          </div>
        </div>
      
        <div>
          <h3 className="text-xl font-medium mb-6">Alias Tokens</h3>
          <div className="space-y-8">
            {aliasTokens.map(({ name, label }) => (
              <ColorControl 
                key={name} 
                tokenName={name} 
                label={label}
                showContrastData={showSwatchData}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSystem;
