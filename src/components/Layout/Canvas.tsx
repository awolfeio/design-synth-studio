
import React from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Laptop, Smartphone, Monitor } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { system, componentVariant } = useDesignSystem();
  const [viewportSize, setViewportSize] = React.useState<string>('desktop');
  
  // Create a CSS variable string from the design system
  const getInlineStyles = () => {
    const colorVars = Object.entries(system.colors).map(([name, color]) => {
      return `--color-${name}: hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%, ${color.alpha});`;
    }).join('\n');
    
    const radiusVars = Object.entries(system.radius).map(([name, value]) => {
      return `--radius-${name}: ${value}px;`;
    }).join('\n');
    
    return `${colorVars}\n${radiusVars}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="h-10 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center">
          <span className="text-sm font-medium">Preview:</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewportSize === 'mobile' ? 'default' : 'outline'}
            size="sm"
            className="px-2"
            onClick={() => setViewportSize('mobile')}
            aria-label="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={viewportSize === 'tablet' ? 'default' : 'outline'}
            size="sm"
            className="px-2"
            onClick={() => setViewportSize('tablet')}
            aria-label="Tablet view"
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button
            variant={viewportSize === 'desktop' ? 'default' : 'outline'}
            size="sm"
            className="px-2"
            onClick={() => setViewportSize('desktop')}
            aria-label="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Canvas Content */}
      <div 
        className="flex-1 overflow-auto p-6 flex justify-center"
        style={{ background: system.isDark ? 'var(--background-dark, #121212)' : 'var(--background-light, #f8f9fa)' }}
      >
        <div 
          className={`${
            viewportSize === 'mobile' ? 'max-w-xs' : 
            viewportSize === 'tablet' ? 'max-w-md' : 
            'max-w-5xl'
          } w-full transition-all`}
          style={{ 
            '--background-light': `hsl(${system.colors.background.hue}, ${system.colors.background.saturation}%, ${system.colors.background.lightness}%)`,
            '--background-dark': `hsl(${system.colors.background.hue}, ${system.colors.background.saturation}%, 10%)` 
          } as React.CSSProperties}
        >
          {/* Sample Components Preview */}
          <div className="space-y-10" style={{ color: system.isDark ? '#f8f9fa' : '#121212' }}>
            {/* Button Samples */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Buttons</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant={componentVariant} size="sm">Small Button</Button>
                <Button variant={componentVariant}>Default Button</Button>
                <Button variant={componentVariant} size="lg">Large Button</Button>
                <Button variant={componentVariant} disabled>Disabled</Button>
              </div>
            </section>

            {/* Card Sample */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Card</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a sample card component that shows how your design system looks with current settings.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button variant={componentVariant}>Action</Button>
                </CardFooter>
              </Card>
            </section>

            {/* Form Elements */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Form Elements</h2>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  
                  <Button variant={componentVariant} className="w-full">Submit</Button>
                </CardContent>
              </Card>
            </section>

            {/* Tabs */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Tabs</h2>
              <Tabs defaultValue="account">
                <TabsList className="mb-2">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="p-4 border rounded-md">
                  <p>Account tab content</p>
                </TabsContent>
                <TabsContent value="settings" className="p-4 border rounded-md">
                  <p>Settings tab content</p>
                </TabsContent>
                <TabsContent value="notifications" className="p-4 border rounded-md">
                  <p>Notifications tab content</p>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
