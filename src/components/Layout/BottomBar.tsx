
import React from 'react';
import { Button } from '../ui/button';
import { Undo2, Redo2, CloudCog, Code, Download } from 'lucide-react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

export const BottomBar: React.FC = () => {
  const { getCSS, getTailwindConfig } = useDesignSystem();
  
  // Mock undo/redo functionality
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  
  // Simulate change tracking
  React.useEffect(() => {
    // This would normally be connected to your actual history state
    const timer = setTimeout(() => {
      setCanUndo(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleExportCSS = () => {
    const css = getCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-system-variables.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTailwind = () => {
    const config = getTailwindConfig();
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailwind-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-10 border-t border-border bg-background flex items-center justify-between px-4">
      {/* History Actions */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={!canUndo}
          className="h-8 w-8"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={!canRedo}
          className="h-8 w-8"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <div className="text-xs text-muted-foreground ml-2 flex items-center">
          <CloudCog className="h-3 w-3 mr-1 animate-pulse text-green-500" />
          Tokens synced
        </div>
      </div>
      
      {/* Export Options */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCSS}>
              CSS Variables
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportTailwind}>
              Tailwind Config
            </DropdownMenuItem>
            <DropdownMenuItem>
              Figma Tokens
            </DropdownMenuItem>
            <DropdownMenuItem>
              Style Dictionary
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
