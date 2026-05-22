import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiPiece {
  id: number;
  x: number; // Percent of screen width (0-100)
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

const COLORS = [
  '#EF4444', // Red (brand)
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const generatedPieces: ConfettiPiece[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: Math.random() * 2.5 + 1.5,
      rotation: Math.random() * 360
    }));
    setPieces(generatedPieces);

    // Auto-remove confetti after 4.5 seconds to preserve performance
    const timer = setTimeout(() => {
      setPieces([]);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-xs"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size * (Math.random() > 0.5 ? 1.5 : 1),
            backgroundColor: piece.color,
            top: -20,
          }}
          initial={{ 
            y: -20, 
            rotate: piece.rotation,
            opacity: 1 
          }}
          animate={{
            y: '105vh',
            rotate: piece.rotation + 720,
            x: `calc(${piece.x}vw + ${Math.sin(piece.id) * 40}px)`,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};
