import React from 'react';
import { ColorControl } from '@/components/Controls/ColorControl';

const ColorSystem = () => {
  const colorTokens = [
    { name: 'primary', label: 'Primary Color' },
    { name: 'secondary', label: 'Secondary Color' },
    { name: 'accent', label: 'Accent Color' },
    { name: 'background', label: 'Background' },
    { name: 'foreground', label: 'Foreground' },
    { name: 'muted', label: 'Muted' },
    { name: 'border', label: 'Border' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'destructive', label: 'Destructive' }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Color System</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {colorTokens.map(({ name, label }) => (
          <ColorControl key={name} tokenName={name} label={label} />
        ))}
      </div>
    </div>
  );
};

export default ColorSystem;
