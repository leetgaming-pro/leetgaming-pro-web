"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface AuthBackgroundProps {
  variant?: "signin" | "signup" | "onboarding";
  children: React.ReactNode;
}

const GAME_ICONS = ["🎮", "🏆", "⚔️", "🎯", "🔥", "💎", "⭐", "🚀"];

export function AuthBackground({ variant = "signin", children }: AuthBackgroundProps) {
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const elements: FloatingElement[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
      opacity: 0.03 + Math.random() * 0.08,
    }));
    setFloatingElements(elements);
  }, []);

  const gradientColors = useMemo(() => {
    switch (variant) {
      case "signin":
        return {
          from: "#0a0a0a",
          via: "#1a0a0a",
          to: "#0a0a1a",
          accent: "#FF4654",
          accentAlt: "#DCFF37",
        };
      case "signup":
        return {
          from: "#0a0a0a",
          via: "#0a1a0a",
          to: "#0a0a1a",
          accent: "#DCFF37",
          accentAlt: "#FF4654",
        };
      case "onboarding":
        return {
          from: "#0a0a0a",
          via: "#1a1a0a",
          to: "#0a1a1a",
          accent: "#FFC700",
          accentAlt: "#FF4654",
        };
      default:
        return {
          from: "#0a0a0a",
          via: "#1a0a0a",
          to: "#0a0a1a",
          accent: "#FF4654",
          accentAlt: "#DCFF37",
        };
    }
  }, [variant]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, ${gradientColors.accent}15 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, ${gradientColors.accentAlt}10 0%, transparent 50%),
            linear-gradient(180deg, ${gradientColors.from} 0%, ${gradientColors.via} 50%, ${gradientColors.to} 100%)
          `,
        }}
      />

      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${gradientColors.accent}40 1px, transparent 1px),
            linear-gradient(90deg, ${gradientColors.accent}40 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Floating game icons */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingElements.map((el) => (
            <motion.div
              key={el.id}
              className="absolute select-none"
              initial={{
                x: `${el.x}vw`,
                y: `${el.y}vh`,
                opacity: 0,
              }}
              animate={{
                y: [`${el.y}vh`, `${el.y - 20}vh`, `${el.y}vh`],
                opacity: [0, el.opacity, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: el.duration,
                delay: el.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ fontSize: el.size }}
            >
              {GAME_ICONS[el.id % GAME_ICONS.length]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Accent glow orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${gradientColors.accent}20 0%, transparent 70%)`,
          left: "-200px",
          top: "20%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${gradientColors.accentAlt}15 0%, transparent 70%)`,
          right: "-150px",
          bottom: "10%",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Corner accents */}
      <div 
        className="absolute top-0 left-0 w-32 h-32"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.accent}30 0%, transparent 50%)`,
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-32 h-32"
        style={{
          background: `linear-gradient(-45deg, ${gradientColors.accentAlt}20 0%, transparent 50%)`,
        }}
      />

      {/* Diagonal accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[200%] h-[2px] opacity-10 -rotate-45"
          style={{
            background: `linear-gradient(90deg, transparent, ${gradientColors.accent}, transparent)`,
            top: "30%",
            left: "-50%",
          }}
        />
        <div 
          className="absolute w-[200%] h-[1px] opacity-5 -rotate-45"
          style={{
            background: `linear-gradient(90deg, transparent, ${gradientColors.accentAlt}, transparent)`,
            top: "60%",
            left: "-50%",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${gradientColors.from}, transparent)`,
        }}
      />
    </div>
  );
}
