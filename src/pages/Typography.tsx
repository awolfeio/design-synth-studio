import React from 'react';
import { TypographyControl } from '@/components/Controls/TypographyControl';

const Typography = () => {
  const fontTokens = [
    { name: 'base', label: 'Base Typography' },
    { name: 'heading', label: 'Heading Typography' },
    { name: 'mono', label: 'Monospace Typography' }
  ];

  return (
    <div className="py-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Typography System</h2>
      <div className="space-y-8">
        {fontTokens.map(({ name, label }) => (
          <TypographyControl key={name} tokenName={name} label={label} />
        ))}
      </div>
    </div>
  );
};

export default Typography;
