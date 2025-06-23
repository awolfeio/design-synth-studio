import React from 'react';

interface StepDistributionGraphProps {
  lightnessValues: number[];
  primaryStepIndex?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const StepDistributionGraph: React.FC<StepDistributionGraphProps> = ({
  lightnessValues,
  primaryStepIndex,
  className = '',
  primaryColor = '#ef4444',
  secondaryColor = '#3b82f6'
}) => {
  if (!lightnessValues || lightnessValues.length === 0) return null;

  // Define neutral-400 color for non-primary elements
  const neutralColor = '#9ca3af'; // neutral-400

  // Define viewBox dimensions (these stay constant)
  const viewBoxWidth = 400;
  const viewBoxHeight = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = viewBoxWidth - padding.left - padding.right;
  const graphHeight = viewBoxHeight - padding.top - padding.bottom;

  // Create points for the line graph
  const points = lightnessValues.map((lightness, index) => {
    const x = padding.left + (index / (lightnessValues.length - 1)) * graphWidth;
    const y = padding.top + ((100 - lightness) / 100) * graphHeight;
    return { x, y, index, lightness };
  });

  // Create the path string for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Create grid lines
  const gridLines = [];
  for (let i = 0; i <= 10; i++) {
    const y = padding.top + (i / 10) * graphHeight;
    gridLines.push(
      <line
        key={`grid-${i}`}
        x1={padding.left}
        y1={y}
        x2={padding.left + graphWidth}
        y2={y}
        stroke="#e5e5e5"
        strokeWidth="1"
      />
    );
  }

  // Style for all text elements
  const textStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  };

  return (
    <div className={`mx-auto ${className}`} style={{ width: '700px', maxWidth: '100%' }}>
      <div className="relative w-full" style={{ paddingBottom: `${(viewBoxHeight / viewBoxWidth) * 100}%` }}>
        <svg 
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <style>{`
              .graph-svg-text { font-size: 11px; }
              .graph-svg-text-small { font-size: 10px; }
              .graph-svg-text-tiny { font-size: 9px; }
            `}</style>
          </defs>
          
          {/* Background */}
          <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="transparent" />
          
          {/* Grid lines */}
          {gridLines}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + graphHeight}
            stroke="#666"
            strokeWidth="1"
          />

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={padding.left + graphWidth}
            y2={padding.top + graphHeight}
            stroke="#666"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          <text 
            x={padding.left - 5} 
            y={padding.top + 3} 
            textAnchor="end" 
            className="fill-muted-foreground graph-svg-text" 
            style={textStyle}
          >
            100
          </text>
          <text 
            x={padding.left - 5} 
            y={padding.top + graphHeight / 2 + 3} 
            textAnchor="end" 
            className="fill-muted-foreground graph-svg-text" 
            style={textStyle}
          >
            50
          </text>
          <text 
            x={padding.left - 5} 
            y={padding.top + graphHeight + 3} 
            textAnchor="end" 
            className="fill-muted-foreground graph-svg-text" 
            style={textStyle}
          >
            0
          </text>

          {/* Y-axis title */}
          <text 
            x={12} 
            y={viewBoxHeight / 2} 
            textAnchor="middle" 
            className="fill-muted-foreground graph-svg-text-small" 
            transform={`rotate(-90 12 ${viewBoxHeight / 2})`}
            style={textStyle}
          >
            Lightness %
          </text>

          {/* X-axis label */}
          <text 
            x={viewBoxWidth / 2} 
            y={viewBoxHeight - 5} 
            textAnchor="middle" 
            className="fill-muted-foreground graph-svg-text" 
            style={textStyle}
          >
            Step Index
          </text>

          {/* The distribution line */}
          <path
            d={pathData}
            fill="none"
            stroke={neutralColor}
            strokeWidth="2.5"
            opacity="0.8"
          />

          {/* Points on the line */}
          {points.map((point) => (
            <circle
              key={point.index}
              cx={point.x}
              cy={point.y}
              r={point.index === primaryStepIndex ? 6 : 4}
              fill={point.index === primaryStepIndex ? primaryColor : neutralColor}
              stroke="white"
              strokeWidth="1.5"
              opacity={point.index === primaryStepIndex ? "1" : "0.8"}
            />
          ))}

          {/* Primary step indicator */}
          {primaryStepIndex !== undefined && points[primaryStepIndex] && (
            <>
              <line
                x1={points[primaryStepIndex].x}
                y1={padding.top}
                x2={points[primaryStepIndex].x}
                y2={padding.top + graphHeight}
                stroke={primaryColor}
                strokeWidth="1.5"
                strokeDasharray="3,3"
                opacity="0.5"
              />
              <text
                x={points[primaryStepIndex].x}
                y={padding.top - 5}
                textAnchor="middle"
                className="font-medium graph-svg-text-small"
                style={{ ...textStyle, fill: primaryColor }}
              >
                Primary
              </text>
            </>
          )}

          {/* Step labels on x-axis */}
          {points.length <= 14 && points.map((point, index) => (
            <text
              key={`label-${index}`}
              x={point.x}
              y={padding.top + graphHeight + 15}
              textAnchor="middle"
              className="fill-muted-foreground graph-svg-text-tiny"
              style={textStyle}
            >
              {index + 1}
            </text>
          ))}

          {/* Lightness values on hover - larger hit areas */}
          {points.map((point) => (
            <g key={`hover-${point.index}`}>
              <rect
                x={point.x - 20}
                y={point.y - 20}
                width={40}
                height={40}
                fill="transparent"
                className="cursor-pointer"
              >
                <title>Step {point.index + 1}: {point.lightness.toFixed(1)}% lightness</title>
              </rect>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground text-center select-none">
        Lightness Distribution Across Steps
      </div>
    </div>
  );
}; 