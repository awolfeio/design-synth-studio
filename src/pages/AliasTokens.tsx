import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Type, 
  Ruler, 
  Radius, 
  Box, 
  GripVertical, 
  ChevronDown,
  Settings,
  Edit3
} from 'lucide-react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { hslaToHex } from '@/lib/colorUtils';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { generateLchColorScale } from '@/lib/lchColorUtils';
import { generateDualEasedStepsWithOffsets, generateSmartSaturationSteps } from '@/lib/easingUtils';

// Types for alias tokens
interface AliasToken {
  id: string;
  name: string;
  originalName: string; // Store the default name for revert functionality
  reference: string;
  stepNumber?: number;
  description: string;
}

interface AliasCategory {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  tokens: AliasToken[];
}

// Sortable Category Component
const SortableCategory: React.FC<{
  category: AliasCategory;
  onUpdateToken: (categoryId: string, tokenId: string, updates: Partial<AliasToken>) => void;
  onReorderTokens: (categoryId: string, oldIndex: number, newIndex: number) => void;
}> = ({ category, onUpdateToken, onReorderTokens }) => {
  const { system } = useDesignSystem();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper function to generate actual color steps using the same logic as Color page
  const generateActualColorSteps = (tokenName: string) => {
    const colorToken = system.colors[tokenName as keyof typeof system.colors];
    if (!colorToken) return [];

    const steps = Math.round(colorToken.steps);
    const primaryStepIndex = colorToken.primaryStepIndex ?? Math.floor(steps / 2);
    
    // Use the EXACT same logic as the Color System page
    if (system.colorInterpolationMode === 'lch') {
      // LCH mode - use generateLchColorScale
      const colorSteps = generateLchColorScale(
        colorToken.hue,
        colorToken.saturation,
        colorToken.lightness,
        colorToken.alpha,
        steps,
        primaryStepIndex,
        colorToken.lightnessEasingLight || 'ease-out',
        colorToken.lightnessEasingDark || 'ease-in',
        colorToken.saturationEasingLight || 'linear',
        colorToken.saturationEasingDark || 'linear',
        colorToken.customLightnessCurveLight,
        colorToken.customLightnessCurveDark,
        colorToken.customSaturationCurveLight,
        colorToken.customSaturationCurveDark,
        tokenName,
        colorToken.primaryOffset || 0,
        colorToken.whiteOffset || 0,
        colorToken.blackOffset || 0,
        colorToken.stepPadding || 1
      );
      
      return colorSteps;
    } else {
      // HSL mode - use the same fallback algorithm as Color System page
      const primaryLightness = colorToken.lightness;
      const minLightness = 12;   // Darkest possible - not too close to black
      const maxLightness = 98;  // Lightest possible
      
      // Special handling for utility colors (Success, Warning, Destructive) with limited steps
      const isUtilityColor = (tokenName === 'success' || tokenName === 'warning' || tokenName === 'destructive');
      const adjustedMinLightness = isUtilityColor ? 25 : minLightness;
      
      // Generate lightness values using dual easing curves with offset support
      const lightnessValues = generateDualEasedStepsWithOffsets(
        steps,
        primaryStepIndex,
        primaryLightness,
        adjustedMinLightness,
        maxLightness,
        colorToken.lightnessEasingLight || 'ease-out',
        colorToken.lightnessEasingDark || 'ease-in',
        colorToken.customLightnessCurveLight,
        colorToken.customLightnessCurveDark,
        colorToken.primaryOffset || 0,
        colorToken.whiteOffset || 0,
        colorToken.blackOffset || 0,
        colorToken.stepPadding || 1
      );
      
      // Generate saturation values using smart saturation scaling
      const saturationValues = generateSmartSaturationSteps(
        steps,
        primaryStepIndex,
        colorToken.saturation,
        tokenName === 'neutrals' ? 'neutral' : 
        isUtilityColor ? 'utility' : 'standard',
        colorToken.saturationEasingLight || 'linear',
        colorToken.saturationEasingDark || 'linear',
        colorToken.customSaturationCurveLight,
        colorToken.customSaturationCurveDark
      );
      
      // Generate the actual color steps with calculated values
      const colorSteps = [];
      for (let i = 0; i < steps; i++) {
        const stepLightness = lightnessValues[i];
        const stepSaturation = saturationValues[i];
        
        const swatchHex = hslaToHex(
          colorToken.hue, 
          stepSaturation, 
          stepLightness, 
          colorToken.alpha
        );
        
        colorSteps.push({
          h: colorToken.hue,
          s: stepSaturation,
          l: stepLightness,
          a: colorToken.alpha,
          hex: swatchHex
        });
      }
      
      return colorSteps;
    }
  };

  // Helper function to generate step names (e.g., primary-100, primary-200)
  const getStepName = (tokenName: string, stepIndex: number) => {
    const colorToken = system.colors[tokenName as keyof typeof system.colors];
    if (!colorToken) return `${tokenName}-${stepIndex + 1}`;
    
    const steps = Math.round(colorToken.steps);
    const extraSteps = Math.max(0, steps - 12);
    
    // Get the step value using the same logic as ColorControl
    const getStepValue = (index: number): number => {
      // If this is one of the extra steps (primary-50 or primary-25)
      if (index < extraSteps) {
        // For index 0 with 2 extra steps, return 25
        // For index 0 with 1 extra step, return 50
        // For index 1 with 2 extra steps, return 50
        return index === 0 && extraSteps === 2 ? 25 : 50;
      }
      
      // Otherwise, standard 100-based scale
      return (index - extraSteps + 1) * 100;
    };
    
    const stepValue = getStepValue(stepIndex);
    return `${tokenName}-${stepValue}`;
  };

  const IconComponent = category.icon;

  return (
    <div ref={setNodeRef} style={style} className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {category.category}
            </div>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </CardTitle>
        </CardHeader>
                 <CardContent>
           <SortableTokenList 
             tokens={category.tokens} 
             categoryId={category.id}
             onUpdateToken={onUpdateToken}
             onReorderTokens={onReorderTokens}
             generateActualColorSteps={generateActualColorSteps}
             getStepName={getStepName}
           />
         </CardContent>
      </Card>
    </div>
  );
};

// Sortable Token List Component
const SortableTokenList: React.FC<{
  tokens: AliasToken[];
  categoryId: string;
  onUpdateToken: (categoryId: string, tokenId: string, updates: Partial<AliasToken>) => void;
  onReorderTokens: (categoryId: string, oldIndex: number, newIndex: number) => void;
  generateActualColorSteps: (tokenName: string) => Array<{ h: number; s: number; l: number; a: number; hex: string }>;
  getStepName: (tokenName: string, stepIndex: number) => string;
}> = ({ tokens, categoryId, onUpdateToken, onReorderTokens, generateActualColorSteps, getStepName }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tokens.findIndex(token => token.id === active.id);
      const newIndex = tokens.findIndex(token => token.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderTokens(categoryId, oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tokens.map(t => t.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tokens.map((token) => (
            <SortableToken
              key={token.id}
              token={token}
              categoryId={categoryId}
              onUpdateToken={onUpdateToken}
              generateActualColorSteps={generateActualColorSteps}
              getStepName={getStepName}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

// Sortable Token Component
const SortableToken: React.FC<{
  token: AliasToken;
  categoryId: string;
  onUpdateToken: (categoryId: string, tokenId: string, updates: Partial<AliasToken>) => void;
  generateActualColorSteps: (tokenName: string) => Array<{ h: number; s: number; l: number; a: number; hex: string }>;
  getStepName: (tokenName: string, stepIndex: number) => string;
}> = ({ token, categoryId, onUpdateToken, generateActualColorSteps, getStepName }) => {
  const { system } = useDesignSystem();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(token.name);

  // Keep editName synchronized with token.name
  useEffect(() => {
    if (!isEditing) {
      setEditName(token.name);
    }
  }, [token.name, isEditing]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get the current color value
  const getCurrentColor = () => {
    const baseColorName = token.reference.split('-')[0];
    const colorToken = system.colors[baseColorName as keyof typeof system.colors];
    if (!colorToken) return '#000000';
    
    if (token.stepNumber !== undefined) {
      const steps = generateActualColorSteps(baseColorName);
      return steps[token.stepNumber]?.hex || '#000000';
    }
    
    return hslaToHex(colorToken.hue, colorToken.saturation, colorToken.lightness, colorToken.alpha);
  };

  // Get available color options for selection
  const getColorOptions = () => {
    const availableColors = ['primary', 'secondary', 'accent', 'neutrals', 'success', 'warning', 'destructive'];
    const options: { tokenName: string; steps: Array<{ h: number; s: number; l: number; a: number; hex: string }>; stepNames: string[] }[] = [];
    
    availableColors.forEach(colorName => {
      const steps = generateActualColorSteps(colorName);
      const stepNames = steps.map((_, index) => getStepName(colorName, index));
      options.push({ tokenName: colorName, steps, stepNames });
    });
    
    return options;
  };

    return (
    <div ref={setNodeRef} style={style} className="flex flex-col items-center p-3 border rounded-lg bg-card w-full relative group hover:bg-muted transition-colors">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded z-10"
      >
        <GripVertical className="h-3 w-3" />
      </div>
      
              <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center gap-2 w-full h-full p-3">
              <div 
                className="w-16 h-16 rounded border-2 border-border cursor-pointer group-hover:scale-110 transition-transform"
                style={{ backgroundColor: getCurrentColor() }}
              />
              <div className="text-center w-full">
                {isEditing ? (
                  <div className="flex items-center gap-1 justify-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateToken(categoryId, token.id, { name: editName });
                          setIsEditing(false);
                        } else if (e.key === 'Escape') {
                          setEditName(token.name);
                          setIsEditing(false);
                        }
                      }}
                      onBlur={() => {
                        onUpdateToken(categoryId, token.id, { name: editName });
                        setIsEditing(false);
                      }}
                      className="font-mono text-xs font-medium text-center bg-transparent border-none outline-none focus:ring-0 px-1 py-0 min-w-0"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const originalName = token.originalName;
                        onUpdateToken(categoryId, token.id, { name: originalName });
                        setEditName(originalName);
                        setIsEditing(false);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      title="Revert to default name"
                    >
                      ↺
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-1 justify-center group/name"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditName(token.name);
                      setIsEditing(true);
                    }}
                  >
                    <div 
                      className="font-mono text-xs font-medium truncate cursor-pointer hover:text-foreground transition-colors"
                      title="Click to edit name"
                    >
                      {token.name}
                    </div>
                    <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Select Color Step</h4>
              <div className="space-y-3">
                {getColorOptions().map((colorOption) => (
                  <div key={colorOption.tokenName} className="space-y-2">
                    <h5 className="text-sm font-medium capitalize">{colorOption.tokenName}</h5>
                    <div className="flex flex-wrap gap-1">
                                             {colorOption.steps.map((step, index) => (
                         <button
                           key={index}
                           className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 relative group ${
                             token.reference === colorOption.tokenName && token.stepNumber === index
                               ? 'border-foreground shadow-md'
                               : 'border-border hover:border-foreground/50'
                           }`}
                           style={{ backgroundColor: step.hex }}
                           onClick={() => {
                             onUpdateToken(categoryId, token.id, {
                               reference: colorOption.tokenName,
                               stepNumber: index
                             });
                             setIsColorPickerOpen(false);
                           }}
                           title={`${colorOption.stepNames[index]} - ${step.hex}`}
                         />
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      
      <Badge variant="secondary" className="font-mono text-xs text-center">
        {token.stepNumber !== undefined 
          ? getStepName(token.reference.split('-')[0], token.stepNumber)
          : token.reference
        }
      </Badge>
    </div>
  );
};

const AliasTokens: React.FC = () => {
  const { toast } = useToast();

  // Initial alias categories state
  const [aliasCategories, setAliasCategories] = useState<AliasCategory[]>([
    {
      id: 'interactive',
      category: 'Interactive',
      icon: Palette,
      tokens: [
          { id: 'btn-primary-bg', name: 'button-primary-bg', originalName: 'button-primary-bg', reference: 'primary', stepNumber: 5, description: 'Primary button background' },
          { id: 'btn-primary-text', name: 'button-primary-text', originalName: 'button-primary-text', reference: 'primary', stepNumber: 0, description: 'Primary button text' },
          { id: 'btn-secondary-bg', name: 'button-secondary-bg', originalName: 'button-secondary-bg', reference: 'secondary', stepNumber: 5, description: 'Secondary button background' },
          { id: 'btn-secondary-text', name: 'button-secondary-text', originalName: 'button-secondary-text', reference: 'secondary', stepNumber: 0, description: 'Secondary button text' },
          { id: 'link-default', name: 'link-default', originalName: 'link-default', reference: 'primary', stepNumber: 6, description: 'Default link color' },
          { id: 'link-hover', name: 'link-hover', originalName: 'link-hover', reference: 'primary', stepNumber: 7, description: 'Link hover color (darker)' },
      ]
    },
    {
      id: 'status',
      category: 'Status',
      icon: Box,
      tokens: [
          { id: 'status-success', name: 'status-success', originalName: 'status-success', reference: 'success', stepNumber: 5, description: 'Success state color' },
          { id: 'status-warning', name: 'status-warning', originalName: 'status-warning', reference: 'warning', stepNumber: 5, description: 'Warning state color' },
          { id: 'status-error', name: 'status-error', originalName: 'status-error', reference: 'destructive', stepNumber: 5, description: 'Error state color' },
          { id: 'status-info', name: 'status-info', originalName: 'status-info', reference: 'accent', stepNumber: 5, description: 'Info state color' },
      ]
    },
    {
      id: 'surface',
      category: 'Surface',
      icon: Radius,
      tokens: [
          { id: 'surface-primary', name: 'surface-primary', originalName: 'surface-primary', reference: 'neutrals', stepNumber: 0, description: 'Primary surface background' },
          { id: 'surface-secondary', name: 'surface-secondary', originalName: 'surface-secondary', reference: 'neutrals', stepNumber: 1, description: 'Secondary surface background' },
          { id: 'surface-elevated', name: 'surface-elevated', originalName: 'surface-elevated', reference: 'neutrals', stepNumber: 0, description: 'Elevated surface background' },
          { id: 'surface-overlay', name: 'surface-overlay', originalName: 'surface-overlay', reference: 'neutrals', stepNumber: 2, description: 'Overlay surface background' },
      ]
    },
    {
      id: 'text',
      category: 'Text',
      icon: Type,
      tokens: [
          { id: 'text-primary', name: 'text-primary', originalName: 'text-primary', reference: 'neutrals', stepNumber: 11, description: 'Primary text color' },
          { id: 'text-secondary', name: 'text-secondary', originalName: 'text-secondary', reference: 'neutrals', stepNumber: 8, description: 'Secondary text color' },
          { id: 'text-accent', name: 'text-accent', originalName: 'text-accent', reference: 'accent', stepNumber: 6, description: 'Accent text color' },
          { id: 'text-inverse', name: 'text-inverse', originalName: 'text-inverse', reference: 'neutrals', stepNumber: 0, description: 'Inverse text color' },
      ]
    },
    {
      id: 'border',
      category: 'Border',
      icon: Ruler,
      tokens: [
          { id: 'border-default', name: 'border-default', originalName: 'border-default', reference: 'neutrals', stepNumber: 3, description: 'Default border color' },
          { id: 'border-subtle', name: 'border-subtle', originalName: 'border-subtle', reference: 'neutrals', stepNumber: 2, description: 'Subtle border color' },
          { id: 'border-focus', name: 'border-focus', originalName: 'border-focus', reference: 'primary', stepNumber: 5, description: 'Focus ring border color' },
          { id: 'border-error', name: 'border-error', originalName: 'border-error', reference: 'destructive', stepNumber: 5, description: 'Error border color' },
      ]
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setAliasCategories((categories) => {
        const oldIndex = categories.findIndex(cat => cat.id === active.id);
        const newIndex = categories.findIndex(cat => cat.id === over?.id);

        return arrayMove(categories, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateToken = (categoryId: string, tokenId: string, updates: Partial<AliasToken>) => {
    setAliasCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            tokens: category.tokens.map(token =>
              token.id === tokenId ? { ...token, ...updates } : token
            )
          }
        : category
    ));
  };

  const handleReorderTokens = (categoryId: string, oldIndex: number, newIndex: number) => {
    setAliasCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            tokens: arrayMove(category.tokens, oldIndex, newIndex)
          }
        : category
    ));
  };

  return (
    <div className="py-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Alias Tokens</h1>
        <p className="text-muted-foreground text-lg">
          Semantic tokens that reference base design tokens. Drag to reorder categories and tokens. Click on color swatches to assign specific color steps.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={aliasCategories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
                      >
          <div className="space-y-6">
            {aliasCategories.map((category) => (
              <SortableCategory
                key={category.id}
                category={category}
                onUpdateToken={handleUpdateToken}
                onReorderTokens={handleReorderTokens}
              />
                ))}
              </div>
        </SortableContext>
      </DndContext>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Usage Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-medium">CSS Custom Properties</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground">/* Use alias tokens in your CSS */</div>
              <div>.button-primary &#123;</div>
              <div className="pl-4">background-color: var(--button-primary-bg);</div>
              <div className="pl-4">color: var(--button-primary-text);</div>
              <div className="pl-4">border-radius: var(--button-radius);</div>
              <div>&#125;</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Design Token Export</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground">/* Generated tokens based on your selections */</div>
              <div>&#123;</div>
              <div className="pl-4">"button-primary-bg": "hsl(var(--primary-500))",</div>
              <div className="pl-4">"surface-secondary": "hsl(var(--neutral-100))",</div>
              <div className="pl-4">"text-primary": "hsl(var(--neutral-900))"</div>
              <div>&#125;</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AliasTokens; 