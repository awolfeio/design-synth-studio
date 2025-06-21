import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorToken } from '@/types/designTokens';

interface ColorControlProps {
  tokenName: string;
  label: string;
  showSteps?: boolean;
  isPickerOpen: boolean;
  setIsPickerOpen: (open: boolean) => void;
  hexInputValue: string;
  setHexInputValue: (value: string) => void;
  colorHex: string;
  handleHexChange: (hex: string) => void;
  handleHexInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHexInputSubmit: () => void;
  handleHexInputKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  updateColorProperty: (property: keyof ColorToken, value: number | string) => void;
  handleInputChange: (property: keyof ColorToken, e: React.ChangeEvent<HTMLInputElement>) => void;
  getStepValue: (index: number) => number;
}

interface ColorControlContextType {
  activeColorControl: string | null;
  setActiveColorControl: (tokenName: string | null) => void;
  controlProps: ColorControlProps | null;
  setControlProps: (props: ColorControlProps | null) => void;
}

const ColorControlContext = createContext<ColorControlContextType | undefined>(undefined);

export const ColorControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeColorControl, setActiveColorControl] = useState<string | null>(null);
  const [controlProps, setControlProps] = useState<ColorControlProps | null>(null);

  return (
    <ColorControlContext.Provider 
      value={{ 
        activeColorControl, 
        setActiveColorControl, 
        controlProps, 
        setControlProps 
      }}
    >
      {children}
    </ColorControlContext.Provider>
  );
};

export const useColorControl = () => {
  const context = useContext(ColorControlContext);
  if (context === undefined) {
    throw new Error('useColorControl must be used within a ColorControlProvider');
  }
  return context;
}; 