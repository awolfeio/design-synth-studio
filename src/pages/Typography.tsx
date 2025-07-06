import React, { useState, useEffect, useRef } from 'react';
import { TypographyControl } from '@/components/Controls/TypographyControl';
import { useTypographyControl } from '@/contexts/TypographyControlContext';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { TypographyGroup, FontToken } from '@/types/designTokens';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Typography = () => {
  const { setActiveTypographyControl } = useTypographyControl();
  const { system } = useDesignSystem();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingProgrammatically = useRef(false);
  
  // Define typography controls including both legacy and new groups
  const typographyControls = [
    // Legacy single typography controls
    { name: 'base', label: 'Base Typography', type: 'legacy' },
    { name: 'heading', label: 'Heading Typography', type: 'legacy' },
    // New typography groups with multiple sizes
    { name: 'paragraph', label: 'Paragraph Typography', type: 'group' },
    { name: 'span', label: 'Span Typography', type: 'group' },
    { name: 'mono', label: 'Monospace Typography', type: 'legacy' }
  ];

  // Function to handle programmatic scrolling (called from PageSidebar)
  const handleProgrammaticScroll = (tokenName: string) => {
    // Set flag to prevent auto-selection during scroll
    isScrollingProgrammatically.current = true;
    
    // Set the active typography control immediately
    setActiveTypographyControl(tokenName);
    
    // Smooth scroll to the typography control element
    const element = document.querySelector(`[data-typography-control="${tokenName}"]`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Reset flag after scroll animation completes (typically 500-1000ms)
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    } else {
      // If element not found, reset flag immediately
      isScrollingProgrammatically.current = false;
    }
  };

  // Expose the scroll handler to window for PageSidebar to use
  React.useEffect(() => {
    (window as unknown as { handleProgrammaticTypographyScroll?: (tokenName: string) => void }).handleProgrammaticTypographyScroll = handleProgrammaticScroll;
    
    return () => {
      delete (window as unknown as { handleProgrammaticTypographyScroll?: (tokenName: string) => void }).handleProgrammaticTypographyScroll;
    };
  }, []);

  // Set up intersection observer for automatic typography control selection
  useEffect(() => {
    // Delay the observer setup to ensure DOM elements are rendered
    const setupObserver = () => {
      const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // More balanced - require 40% from both top and bottom
        threshold: 0.1 // Require at least 10% of element to be visible
      };

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        // Skip auto-selection if we're in the middle of programmatic scrolling
        if (isScrollingProgrammatically.current) {
          return;
        }
        
        // Filter to only intersecting entries
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        if (intersectingEntries.length === 0) return;

        // Find the entry that's most visible (closest to center of viewport)
        let mostVisible = intersectingEntries[0];
        let bestScore = 0;

        for (const entry of intersectingEntries) {
          // Calculate a score based on intersection ratio and position
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          
          // Distance from viewport center (lower is better)
          const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
          const normalizedDistance = 1 - (distanceFromCenter / viewportHeight);
          
          // Combine intersection ratio with center proximity
          // Give more weight to intersection ratio to require more visibility
          const score = entry.intersectionRatio * 0.8 + normalizedDistance * 0.2;
          
          if (score > bestScore) {
            bestScore = score;
            mostVisible = entry;
          }
        }

        // Activate the most visible typography control
        const tokenName = mostVisible.target.getAttribute('data-typography-control');
        if (tokenName) {
          setActiveTypographyControl(tokenName);
        }
      };

      observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

      // Observe all typography control elements
      const typographyControls = document.querySelectorAll('[data-typography-control]');
      typographyControls.forEach(control => {
        if (observerRef.current) {
          observerRef.current.observe(control);
        }
      });
    };

    // Use a small timeout to ensure DOM is ready
    const timeoutId = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setActiveTypographyControl]);

  // Component to render typography group preview
  const TypographyGroupPreview = ({ groupName, label }: { groupName: string; label: string }) => {
    const group = system.fonts[groupName] as TypographyGroup;
    
    if (!group || !('scale_tokens' in group)) return null;

    const sizes = ['sm', 'md', 'lg'];
    const sampleText = groupName === 'paragraph' 
      ? 'This is a sample paragraph text that demonstrates the typography scale. It shows how different sizes work together to create a cohesive design system.'
      : 'Sample text';

    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
        data-typography-control={groupName}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="text-sm text-gray-500">
            Base: {group.baseSize}px • Scale: {group.scale}x
          </div>
        </div>
        
        <div className="space-y-4">
          {sizes.map((size) => {
            const token = group.scale_tokens[size];
            if (!token) return null;
            
            return (
              <div key={size} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-gray-500 uppercase w-8">
                    {size}
                  </div>
                  <div className="text-xs text-gray-400">
                    {token.size}px • {token.weight} • {token.lineHeight}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: token.family,
                    fontSize: `${token.size}px`,
                    fontWeight: token.weight,
                    lineHeight: token.lineHeight,
                    letterSpacing: `${token.letterSpacing}px`
                  }}
                  className="text-gray-900"
                >
                  {groupName === 'paragraph' ? (
                    <p>{sampleText}</p>
                  ) : (
                    <span>{sampleText}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Component to render typography group with inline controls
  const TypographyGroupControl = ({ groupName, label }: { groupName: string; label: string }) => {
    const { setActiveTypographyControl } = useTypographyControl();
    const { system, dispatch } = useDesignSystem();
    const group = system.fonts[groupName] as TypographyGroup;
    
    if (!group || !('scale_tokens' in group)) return null;

    const sizes = ['sm', 'md', 'lg'];
    const sampleText = groupName === 'paragraph' 
      ? 'This is a sample paragraph text that demonstrates the typography scale. It shows how different sizes work together to create a cohesive design system.'
      : 'Sample text';

    const fontFamilies = [
      { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', label: 'Inter' },
      { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
      { value: 'Georgia, serif', label: 'Georgia' },
      { value: 'Times, serif', label: 'Times' },
      { value: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace', label: 'JetBrains Mono' },
      { value: 'SF Mono, Monaco, Consolas, monospace', label: 'SF Mono' }
    ];

    const updateGroupProperty = (property: string, value: string | number) => {
      dispatch({
        type: 'UPDATE_TYPOGRAPHY_GROUP',
        groupName,
        property,
        value
      });
    };

    const activateTypographyControl = () => {
      setActiveTypographyControl(groupName);
    };

    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 cursor-pointer hover:border-primary/50 transition-colors"
        data-typography-control={groupName}
        onClick={activateTypographyControl}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="text-sm text-gray-500">
            Base: {group.baseSize}px • Scale: {group.scale.toFixed(2)}x
          </div>
        </div>
        
        {/* Inline Controls */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-xs mb-2 block">Font Family</Label>
            <Select value={group.family} onValueChange={(value) => updateGroupProperty('family', value)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((family) => (
                  <SelectItem key={family.value} value={family.value}>{family.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Base Size</Label>
              <span className="text-xs text-muted-foreground">{group.baseSize}px</span>
            </div>
            <Slider
              min={8}
              max={32}
              step={1}
              value={[group.baseSize]}
              onValueChange={([value]) => updateGroupProperty('baseSize', value)}
              className="h-8"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs">Scale</Label>
              <span className="text-xs text-muted-foreground">{group.scale.toFixed(2)}</span>
            </div>
            <Slider
              min={1.05}
              max={1.5}
              step={0.05}
              value={[group.scale]}
              onValueChange={([value]) => updateGroupProperty('scale', value)}
              className="h-8"
            />
          </div>
        </div>
        
        {/* Typography Preview */}
        <div className="space-y-4">
          {sizes.map((size) => {
            const token = group.scale_tokens[size];
            if (!token) return null;
            
            return (
              <div key={size} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-gray-500 uppercase w-8">
                    {size}
                  </div>
                  <div className="text-xs text-gray-400">
                    {token.size}px • {token.weight} • {token.lineHeight}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: token.family,
                    fontSize: `${token.size}px`,
                    fontWeight: token.weight,
                    lineHeight: token.lineHeight,
                    letterSpacing: `${token.letterSpacing}px`
                  }}
                  className="text-gray-900"
                >
                  {groupName === 'paragraph' ? (
                    <p>{sampleText}</p>
                  ) : (
                    <span>{sampleText}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Typography System</h2>
      <div className="space-y-8">
        {typographyControls.map(({ name, label, type }) => (
          type === 'legacy' ? (
            <TypographyControl key={name} tokenName={name} label={label} />
          ) : (
            <TypographyGroupControl key={name} groupName={name} label={label} />
          )
        ))}
      </div>
    </div>
  );
};

export default Typography;
