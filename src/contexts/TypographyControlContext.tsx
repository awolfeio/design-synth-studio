import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FontToken } from '@/types/designTokens';

interface TypographyControlProps {
  tokenName: string;
  label: string;
  updateFontProperty: (property: keyof FontToken, value: string | number) => void;
  fontFamilies: Array<{ value: string; label: string }>;
  getHeadingSizes: () => { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
  getPreviewContent: () => React.ReactNode;
}

interface TypographyControlContextType {
  activeTypographyControl: string | null;
  setActiveTypographyControl: (tokenName: string | null) => void;
  controlProps: TypographyControlProps | null;
  setControlProps: (props: TypographyControlProps | null) => void;
}

const TypographyControlContext = createContext<TypographyControlContextType | undefined>(undefined);

export const TypographyControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTypographyControl, setActiveTypographyControl] = useState<string | null>(null);
  const [controlProps, setControlProps] = useState<TypographyControlProps | null>(null);

  return (
    <TypographyControlContext.Provider 
      value={{ 
        activeTypographyControl, 
        setActiveTypographyControl, 
        controlProps, 
        setControlProps 
      }}
    >
      {children}
    </TypographyControlContext.Provider>
  );
};

export const useTypographyControl = () => {
  const context = useContext(TypographyControlContext);
  if (context === undefined) {
    throw new Error('useTypographyControl must be used within a TypographyControlProvider');
  }
  return context;
}; 