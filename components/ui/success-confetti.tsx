/**
 * Success Confetti Component
 * Premium confetti effect for successful actions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

interface SuccessConfettiProps {
  trigger?: boolean;
  duration?: number;
  count?: number;
  colors?: string[];
  className?: string;
}

export function SuccessConfetti({
  trigger = false,
  duration = 3000,
  count = 50,
  colors = ['#0ea5e9', '#d946ef', '#DCFF37', '#10b981', '#f59e0b'],
  className = '',
}: SuccessConfettiProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);

      // Generate confetti pieces
      const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 50, // Start from center
        y: 50,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4, // 4-12px
        velocity: {
          x: (Math.random() - 0.5) * 100, // -50 to 50
          y: -(Math.random() * 50 + 30), // -30 to -80 (upward)
        },
      }));

      setConfetti(pieces);

      // Clean up after duration
      const timeout = setTimeout(() => {
        setConfetti([]);
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [trigger, isActive, count, colors, duration]);

  if (!isActive) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden ${className}`}
    >
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}%`,
            y: `${piece.y}%`,
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            x: `${piece.x + piece.velocity.x}%`,
            y: `${piece.y + piece.velocity.y + 150}%`, // Fall down
            rotate: piece.rotation + 720, // 2 full rotations
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for realistic fall
          }}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
}

// Simplified confetti burst from specific position
interface ConfettiBurstProps {
  x: number; // Percentage from left
  y: number; // Percentage from top
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiBurst({ x, y, trigger, onComplete }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const count = 30;
      const colors = ['#0ea5e9', '#d946ef', '#DCFF37', '#10b981'];

      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const velocity = 40 + Math.random() * 20;

        return {
          id: i,
          x,
          y,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 3,
          velocity: {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
          },
        };
      });

      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [trigger, x, y, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            rotate: piece.rotation,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            left: `${piece.x + piece.velocity.x / 5}%`,
            top: `${piece.y + piece.velocity.y / 5 + 50}%`,
            rotate: piece.rotation + 360,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  );
}

// Success checkmark with confetti
interface SuccessCelebrationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessCelebration({
  show,
  message = 'Success!',
  onComplete,
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      // Delay confetti slightly for better effect
      const timeout = setTimeout(() => setShowConfetti(true), 200);

      // Auto-complete after 3 seconds
      const completeTimeout = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(completeTimeout);
      };
    }
    return undefined;
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <SuccessConfetti trigger={showConfetti} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 20,
        }}
        className="fixed inset-0 z-[9998] flex items-center justify-center"
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-success blur-3xl"
          />

          {/* Checkmark */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
              delay: 0.1,
            }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success shadow-2xl"
          >
            <motion.svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: 'easeOut',
                }}
                d="M20 6L9 17l-5-5"
              />
            </motion.svg>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center text-2xl font-bold text-success"
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
}
