import React, { useState, useEffect, useRef } from 'react';
import { ColorControl } from '@/components/Controls/ColorControl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from '@/components/ui/info-icon';
import { useColorControl } from '@/contexts/ColorControlContext';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { useContrastCheck } from '@/contexts/ContrastCheckContext';

const ColorSystem = () => {
  const [showSwatchData, setShowSwatchData] = useState(false);
  const { system, dispatch } = useDesignSystem();
  const { setActiveColorControl } = useColorControl();
  const { deltaECheckEnabled, setDeltaECheckEnabled } = useContrastCheck();
  const accentColorEnabled = system.accentColorEnabled ?? true;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingProgrammatically = useRef(false);
  
  const primitiveTokens = [
    { name: 'primary', label: 'Primary Color' },
    { name: 'secondary', label: 'Secondary Color' },
    { name: 'accent', label: 'Accent Color' },
    { name: 'neutrals', label: 'Neutrals' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'destructive', label: 'Destructive' }
  ];

  const aliasTokens = [
    // Border palette removed - not currently needed
  ];

  // Function to handle programmatic scrolling (called from PageSidebar)
  const handleProgrammaticScroll = (tokenName: string) => {
    // Set flag to prevent auto-selection during scroll
    isScrollingProgrammatically.current = true;
    
    // Set the active color control immediately
    setActiveColorControl(tokenName);
    
    // Smooth scroll to the color control element
    const element = document.querySelector(`[data-color-control="${tokenName}"]`);
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
    (window as unknown as { handleProgrammaticColorScroll?: (tokenName: string) => void }).handleProgrammaticColorScroll = handleProgrammaticScroll;
    
    return () => {
      delete (window as unknown as { handleProgrammaticColorScroll?: (tokenName: string) => void }).handleProgrammaticColorScroll;
    };
  }, []);

  // Set up intersection observer for automatic color control selection
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

        // Activate the most visible color control
        const tokenName = mostVisible.target.getAttribute('data-color-control');
        if (tokenName) {
          setActiveColorControl(tokenName);
        }
      };

      observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

      // Observe all color control elements
      const colorControls = document.querySelectorAll('[data-color-control]');
      colorControls.forEach(control => {
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
  }, [setActiveColorControl]);

  return (
      <div className="py-6 space-y-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Color System</h2>
          
          <div className="flex items-center space-x-6">
            {/* Contrast Check Switch */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="show-swatch-data" className="text-sm">
                Show Contrast Compliance
              </Label>
              <Switch 
                id="show-swatch-data" 
                checked={showSwatchData} 
                onCheckedChange={setShowSwatchData} 
              />
            </div>

            {/* ΔE Check Switch */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="delta-e-check" className="text-sm">
                ΔE Check
              </Label>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center ml-1">
                    <InfoIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs z-50 bg-popover text-popover-foreground border shadow-lg">
                  <p>
                    Warns when ΔE (Delta E) is ≤ 4.0, which indicates redundancy of paired colors due to being too close in perceived difference.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Switch 
                id="delta-e-check" 
                checked={deltaECheckEnabled} 
                onCheckedChange={setDeltaECheckEnabled} 
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-medium mb-6">Primitive Tokens</h3>
            <div className="space-y-8">
              {primitiveTokens.map(({ name, label }) => (
                <ColorControl 
                  key={name} 
                  tokenName={name} 
                  label={label}
                  showSteps={true}
                  showContrastData={showSwatchData}
                  showEnableSwitch={name === 'accent'}
                  isEnabled={name === 'accent' ? accentColorEnabled : true}
                  onToggleEnabled={name === 'accent' ? () => dispatch({ type: 'TOGGLE_ACCENT_COLOR' }) : undefined}
                />
              ))}
            </div>
          </div>
        
          {/* Alias Tokens section removed - no alias tokens currently needed */}
        </div>
      </div>
  );
};

export default ColorSystem;
