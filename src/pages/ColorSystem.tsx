import React from 'react';
import { ColorControl } from '@/components/Controls/ColorControl';

const ColorSystem = () => {
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
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-semibold mb-2">Color System</h2>
      
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSystem;
