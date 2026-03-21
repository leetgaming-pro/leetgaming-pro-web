/**
 * HeroScene3D - Full-viewport immersive hero section
 * Clean animated 2D hero with branded gradient overlays, animated grid,
 * and parallax floating shapes — lightweight, no Three.js dependency.
 */

"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { logo } from "@/components/primitives";
import { Electrolize } from "next/font/google";
import { useTranslation } from "@/lib/i18n/useTranslation";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });

// ─── Animated grid background ───────────────────────────────────────────────

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(220,255,55,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220,255,55,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial vignette that fades the grid toward edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 30% 50%, transparent 0%, rgba(10,10,10,0.85) 100%)",
        }}
      />
    </div>
  );
}

// ─── Floating accent shapes ─────────────────────────────────────────────────

const SHAPES = [
  { size: 120, x: "72%", y: "18%", color: "#DCFF37", delay: 0, dur: 7 },
  { size: 80, x: "82%", y: "55%", color: "#FF4654", delay: 1.2, dur: 9 },
  { size: 56, x: "65%", y: "72%", color: "#FFC700", delay: 0.6, dur: 8 },
  { size: 40, x: "88%", y: "35%", color: "#DCFF37", delay: 2, dur: 6 },
  { size: 32, x: "58%", y: "30%", color: "#FF4654", delay: 1.8, dur: 10 },
];

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
      {SHAPES.map((s, i) => (
        <m.div
          key={i}
          className="absolute"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
            border: `1px solid ${s.color}`,
            opacity: 0.15,
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
          animate={{
            y: [0, -16, 0, 12, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: s.dur,
            repeat: Infinity,
            ease: "linear",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Crosshair decorative element ───────────────────────────────────────────

function Crosshair() {
  return (
    <div className="absolute right-[12%] top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center pointer-events-none">
      <m.div
        className="relative w-64 h-64"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-[#DCFF37]/20" />
        {/* Inner ring */}
        <div className="absolute inset-8 rounded-full border border-[#FF4654]/15" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#DCFF37]/40" />
        </div>
      </m.div>
      {/* Static crosshair lines */}
      <div className="absolute w-72 h-[1px] bg-gradient-to-r from-transparent via-[#DCFF37]/10 to-transparent" />
      <div className="absolute h-72 w-[1px] bg-gradient-to-b from-transparent via-[#DCFF37]/10 to-transparent" />
    </div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────────────────

export default function HeroScene3D() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const isDark = theme === "dark";

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(150deg, #0a0a0a 0%, #111a26 40%, #1e2a38 70%, #0a0a0a 100%)"
          : "linear-gradient(150deg, #34445C 0%, #2a3749 50%, #34445C 100%)",
      }}
    >
      {/* Background layers */}
      <AnimatedGrid />
      <FloatingShapes />
      <Crosshair />

      {/* Bottom gradient fade for section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[1] pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, transparent, #0a0a0a)"
            : "linear-gradient(to bottom, transparent, #34445C)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] h-full flex flex-col justify-center">
        <main className="container mx-auto px-6 sm:px-8 lg:px-12">
          <LazyMotion features={domAnimation}>
            <m.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.15, delayChildren: 0.2 },
                },
              }}
              className="max-w-3xl"
            >
              {/* Badge */}
              <m.div
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.6, type: "spring", bounce: 0 },
                  },
                }}
              >
                <Button
                  className={`h-9 overflow-hidden border-1 px-[18px] py-2 text-small font-normal leading-5 rounded-none mb-6 ${
                    isDark
                      ? "border-[#DCFF37]/40 bg-[#DCFF37]/10 text-[#DCFF37]"
                      : "border-[#F5F0E1]/40 bg-[#F5F0E1]/15 text-[#F5F0E1]"
                  }`}
                  endContent={
                    <Icon
                      className={
                        isDark
                          ? "flex-none text-[#DCFF37]"
                          : "flex-none text-[#F5F0E1]"
                      }
                      icon="solar:arrow-right-linear"
                      width={20}
                    />
                  }
                  radius="none"
                  variant="bordered"
                  onPress={() => router.push("/onboarding")}
                >
                  {t("landing.hero.badge")}
                </Button>
              </m.div>

              {/* Main Headline */}
              <m.h1
                className={`${electrolize.className} text-[clamp(32px,8vw,72px)] font-bold leading-[1.05] tracking-tight mb-6`}
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(16px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.8, type: "spring", bounce: 0 },
                  },
                }}
              >
                <span className="text-[#F5F0E1]">{t("landing.hero.word1")}</span>{" "}
                <span className={logo({ color: "battleOrange" })}>{t("landing.hero.word2")}</span>{" "}
                <span className={isDark ? "text-[#DCFF37]" : "text-[#FFC700]"}>{t("landing.hero.word3")}</span>
              </m.h1>

              {/* Subheadline */}
              <m.p
                className="text-base sm:text-lg text-[#F5F0E1]/80 max-w-xl mb-8 leading-relaxed"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.7, type: "spring", bounce: 0 },
                  },
                }}
              >
                {t("landing.hero.subtitle")}
              </m.p>

              {/* CTAs */}
              <m.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.6, type: "spring", bounce: 0 },
                  },
                }}
              >
                <Button
                  className="h-14 sm:h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-none touch-target w-full sm:w-auto"
                  style={{
                    backgroundColor: isDark ? "#DCFF37" : "#FF4654",
                    color: isDark ? "#34445C" : "#ffffff",
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                  radius="none"
                  size="lg"
                  onPress={() => router.push("/onboarding")}
                >
                  {t("landing.hero.cta.play")}
                </Button>
                <Button
                  className={`h-14 sm:h-12 px-8 text-base font-medium border-2 text-[#F5F0E1] rounded-none touch-target w-full sm:w-auto transition-all ${
                    isDark
                      ? "border-[#DCFF37]/40 hover:bg-[#DCFF37]/10"
                      : "border-[#F5F0E1]/40 hover:bg-[#F5F0E1]/10"
                  }`}
                  endContent={
                    <span
                      className={`pointer-events-none flex h-[22px] w-[22px] items-center justify-center ${
                        isDark ? "bg-[#DCFF37]/15" : "bg-[#F5F0E1]/15"
                      }`}
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        className={`[&>path]:stroke-[1.5] ${
                          isDark ? "text-[#DCFF37]" : "text-[#F5F0E1]"
                        }`}
                        icon="solar:arrow-right-linear"
                        width={16}
                      />
                    </span>
                  }
                  radius="none"
                  size="lg"
                  variant="bordered"
                  onPress={() => router.push("/pricing")}
                >
                  {t("landing.hero.cta.plans")}
                </Button>
              </m.div>

              {/* Feature highlights instead of fake stats */}
              <m.div
                className="flex flex-wrap gap-x-6 gap-y-3"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: 0.2 },
                  },
                }}
              >
                {[
                  { icon: "solar:cpu-bolt-bold", text: t("landing.hero.feature.replay") },
                  { icon: "solar:gamepad-bold", text: t("landing.hero.feature.matchmaking") },
                  { icon: "solar:wallet-money-bold", text: t("landing.hero.feature.payouts") },
                ].map((feat) => (
                  <div
                    key={feat.text}
                    className="flex items-center gap-2 text-sm text-[#F5F0E1]/60"
                  >
                    <Icon
                      icon={feat.icon}
                      width={16}
                      className={isDark ? "text-[#DCFF37]/70" : "text-[#FFC700]/70"}
                    />
                    <span className={electrolize.className}>{feat.text}</span>
                  </div>
                ))}
              </m.div>
            </m.div>
          </LazyMotion>
        </main>

        {/* Scroll indicator */}
        <m.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-[#F5F0E1]/50">
            {t("landing.hero.scroll")}
          </span>
          <Icon
            icon="solar:alt-arrow-down-linear"
            width={20}
            className="text-[#F5F0E1]/50"
          />
        </m.div>
      </div>
    </div>
  );
}
