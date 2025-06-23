import React, { createContext, useContext, useState } from 'react';

interface ContrastCheckContextType {
  // Map of color token names to their comparison color (hex value)
  comparisonColors: Record<string, string>;
  // Update the comparison color for a specific token
  setComparisonColor: (tokenName: string, comparisonColor: string) => void;
  // Clear comparison color for a specific token
  clearComparisonColor: (tokenName: string) => void;
  // Check if a token has a custom comparison color
  hasCustomComparison: (tokenName: string) => boolean;
}

const ContrastCheckContext = createContext<ContrastCheckContextType | undefined>(undefined);

export const ContrastCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonColors, setComparisonColors] = useState<Record<string, string>>({});

  const setComparisonColor = (tokenName: string, comparisonColor: string) => {
    setComparisonColors(prev => ({
      ...prev,
      [tokenName]: comparisonColor
    }));
  };

  const clearComparisonColor = (tokenName: string) => {
    setComparisonColors(prev => {
      const updated = { ...prev };
      delete updated[tokenName];
      return updated;
    });
  };

  const hasCustomComparison = (tokenName: string) => {
    return tokenName in comparisonColors;
  };

  return (
    <ContrastCheckContext.Provider 
      value={{ 
        comparisonColors, 
        setComparisonColor, 
        clearComparisonColor,
        hasCustomComparison 
      }}
    >
      {children}
    </ContrastCheckContext.Provider>
  );
};

export const useContrastCheck = () => {
  const context = useContext(ContrastCheckContext);
  if (!context) {
    throw new Error('useContrastCheck must be used within a ContrastCheckProvider');
  }
  return context;
}; 