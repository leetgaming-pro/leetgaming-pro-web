'use client';

import { useState } from 'react';
import { X, AlertTriangle, Sparkles } from 'lucide-react';

export function DevelopmentNotice() {
  const [isVisible, setIsVisible] = useState(true);

  // Only show in non-production environments
  if (process.env.NODE_ENV === 'production' || !isVisible) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-leet-gold/10 via-leet-gold/5 to-leet-gold/10 border-b border-leet-gold/20 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-leet-gold/20 rounded-full">
                <Sparkles className="w-4 h-4 text-leet-gold" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-leet-gold flex-shrink-0" />
                <span className="text-sm font-semibold text-leet-gold uppercase tracking-wide">
                  Beta Access
                </span>
              </div>

              <p className="mt-1 text-sm text-leet-cream/80 leading-relaxed">
                Welcome to LeetGaming.PRO&apos;s exclusive beta program! 🎮 As an early adopter, you&apos;re helping shape the future of competitive gaming.
                <span className="hidden sm:inline"> Some features may be experimental and we&apos;re actively improving the platform.</span>
                <span className="font-medium text-leet-gold ml-1">
                  Thank you for your support! 🚀
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-leet-gold/10 transition-colors duration-200 group"
            aria-label="Dismiss beta notice"
          >
            <X className="w-4 h-4 text-leet-gold/70 group-hover:text-leet-gold transition-colors duration-200" />
          </button>
        </div>

        {/* Subtle animated border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-leet-gold/30 to-transparent animate-pulse" />
      </div>
    </div>
  );
}