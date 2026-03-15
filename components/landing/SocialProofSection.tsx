/**
 * SocialProofSection - Stats counters and social proof
 * Navy background section with large animated stat counters
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LazyMotion, domAnimation, m, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Electrolize, Orbitron } from 'next/font/google';
import { scrollAnimations, scrollViewport, springs } from '@/lib/design/animations';
import { useInView } from 'react-intersection-observer';
import { Icon } from '@iconify/react';

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const orbitron = Orbitron({ weight: ["400", "700", "900"], subsets: ["latin"] });

// ─── Animated Counter ───────────────────────────────────────────────────────

function BigAnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      const start = Date.now();
      const durationMs = duration * 1000;

      const step = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(step);
        else setDisplayValue(value);
      };
      requestAnimationFrame(step);
    }
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={`${orbitron.className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Stats Data ─────────────────────────────────────────────────────────────

const STATS = [
  { value: 63000, suffix: '+', label: 'REGISTERED PLAYERS', icon: 'solar:users-group-two-rounded-bold' },
  { value: 125000, suffix: '+', label: 'MATCHES PLAYED', icon: 'solar:gamepad-bold' },
  { value: 890, suffix: 'K', prefix: '$', label: 'PRIZE POOL DISTRIBUTED', icon: 'solar:wallet-money-bold' },
  { value: 30, suffix: '+', label: 'GLOBAL REGIONS', icon: 'solar:earth-bold' },
];

// ─── Testimonial Data ───────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "LeetGaming's replay analysis helped me identify positioning mistakes I'd been making for years. My HLTV rating went from 0.9 to 1.3 in two months.",
    author: "NiKo_fan2026",
    role: "CS2 Player, Level 10",
    avatar: "🎯",
  },
  {
    quote: "The matchmaking is the fairest I've played on. No more lopsided games — every match is competitive and rewarding.",
    author: "ValorantQueen",
    role: "Valorant, Immortal 3",
    avatar: "⚔️",
  },
  {
    quote: "Won my first tournament here. Prize was in my wallet within 5 minutes. No other platform does that.",
    author: "ClutchMaster99",
    role: "CS2 Tournament Winner",
    avatar: "🏆",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SocialProofSection() {
  const { theme } = useTheme();

  return (
    <section className="landing-section relative py-24 md:py-32 overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1e2a38 0%, #34445C 50%, #1e2a38 100%)'
          : 'linear-gradient(135deg, #34445C 0%, #2a3749 50%, #34445C 100%)',
      }}
    >
      {/* Decorative grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(220,255,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(220,255,55,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Diagonal accent line */}
      <div className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #FF4654, #FFC700, #DCFF37)' }}
      />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <LazyMotion features={domAnimation}>
          {/* Section Header */}
          <m.div
            className="text-center mb-16"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <span className={`${electrolize.className} text-xs sm:text-sm uppercase tracking-[0.3em] text-[#DCFF37] mb-4 block`}>
              GROWING COMMUNITY
            </span>
            <h2 className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F0E1] mb-4 uppercase tracking-tight`}>
              THE NUMBERS{' '}
              <span className="text-[#DCFF37]">SPEAK</span>
            </h2>
          </m.div>

          {/* Stats Grid */}
          <m.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={{
              offscreen: {},
              onscreen: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {STATS.map((stat, i) => (
              <m.div
                key={i}
                className="text-center p-6 border border-[#DCFF37]/15 bg-[#DCFF37]/5 backdrop-blur-sm"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
                variants={{
                  offscreen: { opacity: 0, y: 30, scale: 0.95 },
                  onscreen: { opacity: 1, y: 0, scale: 1, transition: springs.gentle },
                }}
              >
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center bg-[#DCFF37]/10"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                >
                  <Icon icon={stat.icon} width={20} className="text-[#DCFF37]" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#DCFF37] mb-2">
                  <BigAnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
                </div>
                <div className={`${electrolize.className} text-[10px] sm:text-xs text-[#F5F0E1]/60 uppercase tracking-wider`}>
                  {stat.label}
                </div>
              </m.div>
            ))}
          </m.div>

          {/* Testimonials */}
          <m.div
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <h3 className={`${electrolize.className} text-center text-sm uppercase tracking-wider text-[#F5F0E1]/40 mb-8`}>
              WHAT PLAYERS SAY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, i) => (
                <m.div
                  key={i}
                  className="p-6 border border-[#F5F0E1]/10 bg-[#F5F0E1]/5 backdrop-blur-sm"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, ...springs.gentle }}
                >
                  <div className="text-2xl mb-3">{testimonial.avatar}</div>
                  <p className="text-sm text-[#F5F0E1]/80 leading-relaxed mb-4 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <div className={`${electrolize.className} text-xs text-[#DCFF37] uppercase tracking-wider font-bold`}>
                      {testimonial.author}
                    </div>
                    <div className="text-[10px] text-[#F5F0E1]/40 uppercase tracking-wider mt-0.5">
                      {testimonial.role}
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </LazyMotion>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #DCFF37, #FFC700, #FF4654)' }}
      />
    </section>
  );
}
