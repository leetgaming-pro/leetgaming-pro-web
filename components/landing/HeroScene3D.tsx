/**
 * HeroScene3D - Full-viewport immersive hero section
 * Combines Three.js 3D arena scene with branded 2D overlay (text, CTAs, stats)
 */

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { logo } from "@/components/primitives";
import { Electrolize } from "next/font/google";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });

// Dynamic import for 3D content (SSR-safe)
const SceneWrapper = dynamic(() => import('@/lib/3d/scene-wrapper'), { ssr: false });
const HeroSceneContentModule = dynamic(
  () => import('./HeroSceneContent').then(mod => ({ default: mod.HeroSceneContent })),
  { ssr: false }
);

// Animated stat counter
function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className={`${electrolize.className} text-2xl sm:text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-default-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function HeroScene3D() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <div className={`relative h-screen w-full overflow-hidden ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-[#34445C]'}`}>
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <SceneWrapper
          cameraPosition={[0, 2, 6]}
          cameraFov={55}
          style={{ width: '100%', height: '100%' }}
        >
          <HeroSceneContentModule />
        </SceneWrapper>
      </div>

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]/90' : 'from-[#34445C]/80 via-[#34445C]/30 to-[#34445C]/90'}`} />
        <div className={`absolute inset-0 bg-gradient-to-r ${theme === 'dark' ? 'from-[#0a0a0a]/60' : 'from-[#34445C]/70'} via-transparent to-transparent`} />
      </div>

      {/* 2D Content Overlay */}
      <div className="relative z-[2] h-full flex flex-col justify-center">
        <main className="container mx-auto px-6 sm:px-8 lg:px-12">
          <LazyMotion features={domAnimation}>
            <m.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15, delayChildren: 0.3 },
                },
              }}
              className="max-w-3xl"
            >
              {/* Badge */}
              <m.div
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, type: 'spring', bounce: 0 } },
                }}
              >
                <Button
                  className={`h-9 overflow-hidden border-1 px-[18px] py-2 text-small font-normal leading-5 rounded-none mb-6 ${theme === 'dark' ? 'border-[#DCFF37]/40 bg-[#DCFF37]/10 text-[#DCFF37]' : 'border-[#F5F0E1]/40 bg-[#F5F0E1]/15 text-[#F5F0E1]'}`}
                  endContent={
                    <Icon className={theme === 'dark' ? 'flex-none text-[#DCFF37]' : 'flex-none text-[#F5F0E1]'} icon="solar:arrow-right-linear" width={20} />
                  }
                  radius="none"
                  variant="bordered"
                  onPress={() => router.push("/onboarding")}
                >
                  Join the next generation of esports
                </Button>
              </m.div>

              {/* Main Headline */}
              <m.h1
                className={`${electrolize.className} text-[clamp(32px,8vw,72px)] font-bold leading-[1.05] tracking-tight mb-6`}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: 'blur(16px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, type: 'spring', bounce: 0 } },
                }}
              >
                <span className="text-[#F5F0E1]">COMPETE.</span>{' '}
                <span className={logo({ color: 'battleOrange' })}>ANALYZE.</span>{' '}
                <span className={theme === 'dark' ? 'text-[#DCFF37]' : 'text-[#FFC700]'}>EARN.</span>
              </m.h1>

              {/* Subheadline */}
              <m.p
                className="text-base sm:text-lg text-[#F5F0E1]/80 max-w-xl mb-8 leading-relaxed"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, type: 'spring', bounce: 0 } },
                }}
              >
                AI-powered replay analysis, skill-based matchmaking, and transparent prize pools.
                The all-in-one competitive gaming platform for players who want to go pro.
              </m.p>

              {/* CTAs */}
              <m.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, type: 'spring', bounce: 0 } },
                }}
              >
                <Button
                  className="h-14 sm:h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-none touch-target w-full sm:w-auto"
                  style={{
                    backgroundColor: theme === 'dark' ? '#DCFF37' : '#FF4654',
                    color: theme === 'dark' ? '#34445C' : '#ffffff',
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                  }}
                  radius="none"
                  size="lg"
                  onPress={() => router.push("/onboarding")}
                >
                  Start Playing Free
                </Button>
                <Button
                  className={`h-14 sm:h-12 px-8 text-base font-medium border-2 text-[#F5F0E1] rounded-none touch-target w-full sm:w-auto transition-all ${theme === 'dark' ? 'border-[#DCFF37]/40 hover:bg-[#DCFF37]/10' : 'border-[#F5F0E1]/40 hover:bg-[#F5F0E1]/10'}`}
                  endContent={
                    <span className={`pointer-events-none flex h-[22px] w-[22px] items-center justify-center ${theme === 'dark' ? 'bg-[#DCFF37]/15' : 'bg-[#F5F0E1]/15'}`}
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}
                    >
                      <Icon className={`[&>path]:stroke-[1.5] ${theme === 'dark' ? 'text-[#DCFF37]' : 'text-[#F5F0E1]'}`} icon="solar:arrow-right-linear" width={16} />
                    </span>
                  }
                  radius="none"
                  size="lg"
                  variant="bordered"
                  onPress={() => router.push("/pricing")}
                >
                  See Plans
                </Button>
              </m.div>

              {/* Stats Row */}
              <m.div
                className="flex gap-8 sm:gap-12"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } },
                }}
              >
                <StatCounter value={63000} label="Players" suffix="+" />
                <StatCounter value={12500} label="Matches" suffix="+" />
                <StatCounter value={890} label="Prize Pool" suffix="K" />
              </m.div>
            </m.div>
          </LazyMotion>
        </main>

        {/* Scroll indicator */}
        <m.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-[#F5F0E1]/50">Scroll</span>
          <Icon icon="solar:alt-arrow-down-linear" width={20} className="text-[#F5F0E1]/50" />
        </m.div>
      </div>
    </div>
  );
}
