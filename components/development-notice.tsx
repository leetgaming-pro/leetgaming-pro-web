'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Sparkles, Zap, Trophy } from 'lucide-react';

export function DevelopmentNotice() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show development notice in production for beta/pre-alpha launch
  // Can be controlled via NEXT_PUBLIC_SHOW_DEV_NOTICE environment variable
  const shouldShowNotice = process.env.NEXT_PUBLIC_SHOW_DEV_NOTICE !== 'false' && isVisible;

  if (!shouldShowNotice) {
    return null;
  }

  useEffect(() => {
    // Add subtle entrance animation
    setIsAnimating(true);
  }, []);

  return (
    <div className={`relative w-full bg-gradient-to-r from-leet-navy via-leet-navy-dark to-leet-navy border-b-2 border-leet-gold shadow-lg transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-leet-gold/5 via-transparent to-leet-gold/5 animate-pulse" />

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Icon container with glow effect */}
            <div className="flex-shrink-0 relative">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-leet-gold to-leet-orange rounded-full shadow-lg">
                <Trophy className="w-5 h-5 text-leet-navy" />
              </div>
              <div className="absolute -inset-1 bg-leet-gold/20 rounded-full blur-sm animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-leet-gold animate-pulse" />
                  <span className="text-sm font-bold text-leet-gold uppercase tracking-wider bg-leet-gold/10 px-2 py-1 rounded-full">
                    Pre-Alpha Access
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-leet-orange" />
                  <span className="text-xs font-medium text-leet-cream/70 uppercase tracking-wide">
                    Limited Release
                  </span>
                </div>
              </div>

              <p className="text-sm text-leet-cream leading-relaxed">
                <span className="font-semibold text-leet-gold">Welcome to LeetGaming.PRO&apos;s exclusive pre-alpha program!</span>
                <span className="hidden sm:inline"> 🎮 As a pioneering early adopter, you&apos;re experiencing cutting-edge competitive gaming technology before the official launch.</span>
                <span className="block mt-1 text-leet-cream/80">
                  Features may be experimental. Your feedback shapes our award-winning platform.
                  <span className="font-medium text-leet-lime ml-1">Thank you for being part of our journey! 🚀</span>
                </span>
              </p>

              {/* Legal disclaimer */}
              <p className="mt-2 text-xs text-leet-cream/60 italic">
                By using this pre-alpha version, you acknowledge that some features may be incomplete or subject to change.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-4 p-2 rounded-lg hover:bg-leet-gold/10 transition-all duration-200 group hover:scale-105"
            aria-label="Dismiss pre-alpha notice"
          >
            <X className="w-5 h-5 text-leet-gold/70 group-hover:text-leet-gold transition-colors duration-200" />
          </button>
        </div>

        {/* Enhanced animated border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-leet-gold via-leet-lime to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-leet-gold/50 animate-pulse delay-100" />
      </div>
    </div>
  );
}