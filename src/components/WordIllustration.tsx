import React from 'react';

interface WordIllustrationProps {
  type: 'dice' | 'car' | 'star' | 'sun' | 'cat' | 'book' | 'fruit' | 'crown';
  sizeClassName?: string;
}

export const WordIllustration: React.FC<WordIllustrationProps> = ({ 
  type, 
  sizeClassName = "w-24 h-24" 
}) => {
  return (
    <div className={`flex items-center justify-center p-2 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-xs transition-shadow ${sizeClassName}`}>
      {type === 'dice' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          <rect x="15" y="15" width="70" height="70" rx="14" />
          <circle cx="35" cy="35" r="5" className="fill-current" />
          <circle cx="65" cy="35" r="5" className="fill-current" />
          <circle cx="35" cy="65" r="5" className="fill-current" />
          <circle cx="65" cy="65" r="5" className="fill-current" />
          <circle cx="50" cy="50" r="5" className="fill-current" />
        </svg>
      )}

      {type === 'car' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          {/* A cute house layout for CASA */}
          <path d="M15 45 L50 15 L85 45 M25 40 L25 85 L75 85 L75 40" />
          <rect x="40" y="55" width="20" height="30" />
          <rect x="42" y="35" width="16" height="15" />
        </svg>
      )}

      {type === 'cat' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          {/* A cute kitten whiskers */}
          <path d="M20 75 C20 45 40 40 50 40 C60 40 80 45 80 75 Z" />
          <path d="M30 42 L20 15 L42 32 M70 42 L80 15 L58 32" />
          <circle cx="40" cy="55" r="4" className="fill-current" />
          <circle cx="60" cy="55" r="4" className="fill-current" />
          <path d="M46 62 L54 62 L50 66 Z" className="fill-current" />
          <path d="M45 68 Q50 71 55 68" />
          <path d="M25 58 L10 55 M25 61 L5 61 Q25 64 25 64 M75 58 L90 55 M75 61 L95 61" />
        </svg>
      )}

      {type === 'sun' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round animate-[spin_40s_linear_infinite]">
          <circle cx="50" cy="50" r="18" />
          <path d="M50 15 V5 M50 95 V85 M15 50 H5 M95 50 H85 M25 25 L15 15 M85 85 L75 75 M25 75 L15 85 M85 25 L75 15" />
        </svg>
      )}

      {type === 'book' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          <path d="M12 25 Q31 20 50 28 Q69 20 88 25 V75 Q69 70 50 78 Q31 70 12 75 Z M50 28 V78" />
        </svg>
      )}

      {type === 'fruit' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          {/* Cute Apple */}
          <path d="M50 40 Q40 25 25 35 Q10 45 20 70 Q30 90 50 85 Q70 90 80 70 Q90 45 75 35 Q60 25 50 40 Z" />
          <path d="M50 35 Q50 20 62 15" />
          <path d="M55 22 Q70 20 72 32 Q62 35 55 22" className="fill-red-50" />
        </svg>
      )}

      {type === 'crown' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          <path d="M15 75 L10 32 L35 50 L50 20 L65 50 L90 32 L85 75 Z" />
          <line x1="10" y1="75" x2="90" y2="75" />
          <circle cx="10" cy="32" r="3" className="fill-current" />
          <circle cx="35" cy="50" r="3" className="fill-current" />
          <circle cx="50" cy="20" r="3" className="fill-current" />
          <circle cx="65" cy="50" r="3" className="fill-current" />
          <circle cx="90" cy="32" r="3" className="fill-current" />
        </svg>
      )}

      {type === 'star' && (
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-500 fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
          <path d="M50 12 L62 38 L90 41 L68 60 L75 88 L50 73 L25 88 L32 60 L10 41 L38 38 Z" />
        </svg>
      )}
    </div>
  );
};
