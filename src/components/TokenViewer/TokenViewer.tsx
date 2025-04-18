
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDesignSystem } from '@/contexts/DesignSystemContext';

interface TokenViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenViewer: React.FC<TokenViewerProps> = ({ isOpen, onClose }) => {
  const { system, getCSS, getTailwindConfig } = useDesignSystem();
  const [activeTab, setActiveTab] = React.useState('foundation');
  
  // Format JSON for display
  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Design System Tokens</DialogTitle>
          <DialogDescription>
            Inspect, override, or export design tokens at any layer
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="foundation" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="foundation">Foundation</TabsTrigger>
            <TabsTrigger value="alias">Alias</TabsTrigger>
            <TabsTrigger value="component">Component</TabsTrigger>
            <TabsTrigger value="code">CSS & Code</TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto flex-1 border rounded-md p-4">
            <TabsContent value="foundation" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Color Tokens</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {formatJSON(system.colors)}
              </pre>
              
              <h3 className="text-lg font-medium mb-3 mt-6">Typography</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {formatJSON(system.fonts)}
              </pre>
              
              <h3 className="text-lg font-medium mb-3 mt-6">Spacing Scale</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {formatJSON(system.spacing)}
              </pre>
              
              <h3 className="text-lg font-medium mb-3 mt-6">Border Radius</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {formatJSON(system.radius)}
              </pre>
            </TabsContent>
            
            <TabsContent value="alias" className="mt-0">
              <p className="text-muted-foreground mb-4">
                Alias tokens are mapped from foundation tokens and used for specific UI purposes.
              </p>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {`// Example Alias Token Mapping
{
  "surface": "colors.background",
  "text": "colors.foreground",
  "border": "colors.border",
  "interactive": "colors.primary",
  "interactiveText": "colors.primary.foreground",
  "error": "colors.destructive",
  "success": "colors.success"
}`}
              </pre>
            </TabsContent>
            
            <TabsContent value="component" className="mt-0">
              <p className="text-muted-foreground mb-4">
                Component tokens are derived from alias tokens and provide specific styling for components.
              </p>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {`// Example Component Token Structure
{
  "button": {
    "default": {
      "background": "interactive",
      "text": "interactiveText",
      "border": "transparent"
    },
    "outline": {
      "background": "transparent",
      "text": "interactive",
      "border": "interactive"
    },
    "ghost": {
      "background": "transparent",
      "text": "interactive",
      "border": "transparent",
      "hoverBackground": "interactive/10"
    }
  },
  "card": {
    "background": "surface",
    "text": "text",
    "border": "border"
  }
}`}
              </pre>
            </TabsContent>
            
            <TabsContent value="code" className="mt-0">
              <h3 className="text-lg font-medium mb-3">CSS Variables</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {getCSS()}
              </pre>
              
              <h3 className="text-lg font-medium mb-3 mt-6">Tailwind Config</h3>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {formatJSON(getTailwindConfig())}
              </pre>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
