import React from 'react';
import { LetterCubeData } from '../types';

interface LetterCubeProps {
  data: LetterCubeData;
  onSelectLetter?: (letter: string) => void;
  sizeClassName?: string;
  interactive?: boolean;
  variant?: 'cube' | 'square';
  selectedLetterKey?: string; // If split, which of the two is active
  themeColor?: string; // Custom theme color
}

// Precise manual adjustments for each single letter to give maximum spacing and avoid any touching/overlaps
const SINGLE_LETTER_ADJUSTMENTS: Record<string, { letterX: number; letterY: number; ordinalX: number; ordinalY: number; letterSize?: number; ordinalSize?: number }> = {
  'A': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'B': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'C': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 102, ordinalSize: 22 },
  'D': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'E': { letterX: 112, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'F': { letterX: 112, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'G': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'H': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'I': { letterX: 114, letterY: 158, ordinalX: 186, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'J': { letterX: 112, letterY: 158, ordinalX: 186, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'K': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'L': { letterX: 112, letterY: 158, ordinalX: 186, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'M': { letterX: 110, letterY: 158, ordinalX: 190, ordinalY: 84, letterSize: 80, ordinalSize: 20 }, // "M" shifted left and scaled slightly
  'N': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'O': { letterX: 118, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'P': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'Q': { letterX: 118, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'R': { letterX: 114, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'S': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'T': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'U': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'V': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'W': { letterX: 114, letterY: 158, ordinalX: 190, ordinalY: 84, letterSize: 82, ordinalSize: 20 },
  'X': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'Y': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'Z': { letterX: 116, letterY: 158, ordinalX: 188, ordinalY: 86, letterSize: 92, ordinalSize: 22 },
  'Ç': { letterX: 114, letterY: 154, ordinalX: 188, ordinalY: 86, letterSize: 98, ordinalSize: 22 },
};

// Adjustments for the split letter views to prevent letters/ordinals from touching the diagonal line or borders
const SPLIT_ADJUSTMENTS = {
  'cube-c-composite': {
    primary: { letterX: 83, letterY: 120, ordinalX: 136, ordinalY: 88, letterSize: 56, ordinalSize: 15 },
    secondary: { letterX: 148, letterY: 175, ordinalX: 188, ordinalY: 142, letterSize: 53, ordinalSize: 15 }
  },
  'cube-v-composite': {
    primary: { letterX: 84, letterY: 120, ordinalX: 134, ordinalY: 88, letterSize: 45, ordinalSize: 15 },
    secondary: { letterX: 152, letterY: 174, ordinalX: 178, ordinalY: 132, letterSize: 45, ordinalSize: 15 }
  }
};

export const LetterCube: React.FC<LetterCubeProps> = ({
  data,
  onSelectLetter,
  sizeClassName = "w-full aspect-square",
  interactive = true,
  variant = 'cube',
  selectedLetterKey,
  themeColor = '#FF0000'
}) => {
  const { id, primaryLetter, primaryOrdinal, isSplit, secondaryLetter, secondaryOrdinal } = data;

  const handleAreaClick = (letter: string) => {
    if (interactive && onSelectLetter) {
      onSelectLetter(letter);
    }
  };

  const isSquare = variant === 'square';

  // Use the exact 202x202 isometric cube coordinates from the user's template
  const cubePath = isSquare 
    ? "M53.4083 53.4083 H198.861 V198.861 H53.4083 Z" // Only the front face square
    : "M53.4083 198.861H198.861V53.4083L147.952 2.5H2.49998V147.952L53.4083 198.861ZM2.49998 2.5L53.4083 53.4083M53.4083 53.4083H198.861M53.4083 53.4083V198.861";

  // Single letter configuration retrieval
  const singleAdj = SINGLE_LETTER_ADJUSTMENTS[primaryLetter] || {
    letterX: 116,
    letterY: 158,
    ordinalX: 188,
    ordinalY: 86,
  };
  const lX = singleAdj.letterX;
  const lY = singleAdj.letterY;
  const oX = singleAdj.ordinalX;
  const oY = singleAdj.ordinalY;
  const lSize = singleAdj.letterSize || 92;
  const oSize = singleAdj.ordinalSize || 22;

  // Split configurations
  const splitAdj = (id === 'cube-c-composite' || id === 'cube-v-composite')
    ? SPLIT_ADJUSTMENTS[id as 'cube-c-composite' | 'cube-v-composite']
    : null;

  const primLetterX = splitAdj ? splitAdj.primary.letterX : 92;
  const primLetterY = splitAdj ? splitAdj.primary.letterY : 122;
  const primOrdinalX = splitAdj ? splitAdj.primary.ordinalX : 138;
  const primOrdinalY = splitAdj ? splitAdj.primary.ordinalY : 92;
  const primLetterSize = splitAdj ? splitAdj.primary.letterSize : 46;
  const primOrdinalSize = splitAdj ? splitAdj.primary.ordinalSize : 16;

  const secLetterX = splitAdj ? splitAdj.secondary.letterX : 150;
  const secLetterY = splitAdj ? splitAdj.secondary.letterY : 176;
  const secOrdinalX = splitAdj ? splitAdj.secondary.ordinalX : 184;
  const secOrdinalY = splitAdj ? splitAdj.secondary.ordinalY : 146;
  const secLetterSize = splitAdj ? splitAdj.secondary.letterSize : 46;
  const secOrdinalSize = splitAdj ? splitAdj.secondary.ordinalSize : 16;

  return (
    <div 
      className={`relative select-none ${interactive ? 'cursor-pointer hover:scale-[1.04] active:scale-[0.96] transition-all duration-200' : ''} ${sizeClassName}`}
      id={`cube-${id}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={isSquare ? "51.5 51.5 149.5 149.5" : "0 0 202 202"} 
        className="w-full h-full select-none pointer-events-none"
      >
        {/* Isometric Cube Path or Square Path */}
        <path 
          d={cubePath}
          fill="none"
          stroke={themeColor}
          strokeWidth="2.5"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="50"
          style={{ shapeRendering: 'crispEdges', transition: 'stroke 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Content of the face - inside the front face (53.4083, 53.4083) to (198.861, 198.861) */}
        {!isSplit ? (
          <>
            <text 
              x={lX} 
              y={lY} 
              textAnchor="middle" 
              fontSize={lSize} 
              className="select-none pointer-events-none"
              style={{
                fontFamily: "'Montserrat', 'Outfit', sans-serif",
                fontWeight: 850,
                fill: themeColor,
                userSelect: 'none',
                transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {primaryLetter}
            </text>
            <text 
              x={oX} 
              y={oY} 
              textAnchor="end" 
              fontSize={oSize} 
              className="select-none pointer-events-none"
              style={{
                fontFamily: "'Montserrat', 'Outfit', sans-serif",
                fontWeight: 700,
                fill: themeColor,
                userSelect: 'none',
                transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {primaryOrdinal}
            </text>

            {interactive && (
              <rect
                x="53.4083"
                y="53.4083"
                width="145.45"
                height="145.45"
                fill="transparent"
                className="pointer-events-auto cursor-pointer"
                onClick={() => handleAreaClick(primaryLetter)}
              />
            )}
          </>
        ) : (
          // In case of the split cubes ('C/Ç' and 'V/W')
          <>
            {/* If it's a square and a specific letter has already been chosen/spelled, render only that chosen letter beautifully in full scale! */}
            {isSquare && selectedLetterKey ? (
              (() => {
                const adj = SINGLE_LETTER_ADJUSTMENTS[selectedLetterKey] || {
                  letterX: 116,
                  letterY: 158,
                  ordinalX: 188,
                  ordinalY: 86,
                };
                const xVal = adj.letterX;
                const yVal = adj.letterY;
                const ordX = adj.ordinalX;
                const ordY = adj.ordinalY;
                const sizeVal = adj.letterSize || 92;
                const ordSizeValue = adj.ordinalSize || 22;
                const activeOrdinal = selectedLetterKey === primaryLetter ? primaryOrdinal : (secondaryOrdinal || '23°');
                return (
                  <>
                    <text 
                      x={xVal} 
                      y={yVal} 
                      textAnchor="middle" 
                      fontSize={sizeVal} 
                      className="select-none pointer-events-none"
                      style={{
                        fontFamily: "'Montserrat', 'Outfit', sans-serif",
                        fontWeight: 850,
                        fill: themeColor,
                        userSelect: 'none',
                        transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {selectedLetterKey}
                    </text>
                    <text 
                      x={ordX} 
                      y={ordY} 
                      textAnchor="end" 
                      fontSize={ordSizeValue} 
                      className="select-none pointer-events-none"
                      style={{
                        fontFamily: "'Montserrat', 'Outfit', sans-serif",
                        fontWeight: 700,
                        fill: themeColor,
                        userSelect: 'none',
                        transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {activeOrdinal}
                    </text>
                  </>
                );
              })()
            ) : (
              // Splitted style as in the design image
              <>
                {/* Diagonal line split inside (53.4083, 198.861) to (198.861, 53.4083) */}
                <line 
                  x1="53.4083" 
                  y1="198.861" 
                  x2="198.861" 
                  y2="53.4083" 
                  stroke={themeColor}
                  strokeWidth="8.5"
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  style={{ transition: 'stroke 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* Top-Left Half */}
                <g>
                  <text 
                    x={primLetterX} 
                    y={primLetterY} 
                    textAnchor="middle" 
                    fontSize={primLetterSize} 
                    className="select-none pointer-events-none"
                    style={{
                      fontFamily: "'Montserrat', 'Outfit', sans-serif",
                      fontWeight: 850,
                      fill: themeColor,
                      userSelect: 'none',
                      transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {primaryLetter}
                  </text>
                  <text 
                    x={primOrdinalX} 
                    y={primOrdinalY} 
                    textAnchor="end" 
                    fontSize={primOrdinalSize} 
                    className="select-none pointer-events-none"
                    style={{
                      fontFamily: "'Montserrat', 'Outfit', sans-serif",
                      fontWeight: 700,
                      fill: themeColor,
                      userSelect: 'none',
                      transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {primaryOrdinal}
                  </text>
                </g>

                {/* Bottom-Right Half */}
                <g>
                  <text 
                    x={secLetterX} 
                    y={secLetterY} 
                    textAnchor="middle" 
                    fontSize={secLetterSize} 
                    className="select-none pointer-events-none"
                    style={{
                      fontFamily: "'Montserrat', 'Outfit', sans-serif",
                      fontWeight: 850,
                      fill: themeColor,
                      userSelect: 'none',
                      transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {secondaryLetter || ''}
                  </text>
                  {secondaryOrdinal && (
                    <text 
                      x={secOrdinalX} 
                      y={secOrdinalY} 
                      textAnchor="end" 
                      fontSize={secOrdinalSize} 
                      className="select-none pointer-events-none"
                      style={{
                        fontFamily: "'Montserrat', 'Outfit', sans-serif",
                        fontWeight: 700,
                        fill: themeColor,
                        userSelect: 'none',
                        transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {secondaryOrdinal}
                    </text>
                  )}
                </g>

                {interactive && (
                  <>
                    <polygon
                      points="53.4083,53.4083 198.861,53.4083 53.4083,198.861"
                      fill="transparent"
                      className="pointer-events-auto cursor-pointer hover:fill-red-500/5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAreaClick(primaryLetter);
                      }}
                    />
                    <polygon
                      points="53.4083,198.861 198.861,53.4083 198.861,198.861"
                      fill="transparent"
                      className="pointer-events-auto cursor-pointer hover:fill-red-500/5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAreaClick(secondaryLetter || '');
                      }}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
};
