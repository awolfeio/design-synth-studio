
import React from 'react';
import AppLayout from '@/components/Layout/AppLayout';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';

const Index = () => {
  return (
    <DesignSystemProvider>
      <AppLayout />
    </DesignSystemProvider>
  );
};

export default Index;
