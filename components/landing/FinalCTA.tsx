/**
 * FinalCTA - Closing call-to-action section
 * Full-viewport closing hero with gradient background and particle accents
 */

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Electrolize } from "next/font/google";
import { scrollViewport, springs } from "@/lib/design/animations";
import { useTranslation } from "@/lib/i18n/useTranslation";

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const SceneWrapper = dynamic(() => import("@/lib/3d/scene-wrapper"), {
  ssr: false,
});
const BrandParticles = dynamic(() => import("@/lib/3d/particles"), {
  ssr: false,
});

// ─── Particle Background Scene ──────────────────────────────────────────────

function CTAParticleScene() {
  return (
    <SceneWrapper
      cameraPosition={[0, 0, 5]}
      cameraFov={50}
      style={{ width: "100%", height: "100%" }}
    >
      <BrandParticles
        count={150}
        spread={12}
        speed={0.1}
        size={0.02}
        colorScheme="mixed"
        opacity={0.4}
      />
    </SceneWrapper>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FinalCTA() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <section className="landing-section relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #0a0a0a 0%, #1e2a38 30%, #0a0a0a 70%, #0d1117 100%)"
              : "linear-gradient(135deg, #34445C 0%, #2a3749 40%, #34445C 70%, #1e2a38 100%)",
        }}
      />

      {/* 3D Particles */}
      <div className="absolute inset-0 z-0">
        <CTAParticleScene />
      </div>

      {/* Decorative lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(90deg, transparent, #DCFF37, transparent)"
              : "linear-gradient(90deg, transparent, #FF4654, transparent)",
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-4xl relative z-10 py-20">
        <LazyMotion features={domAnimation}>
          <m.div
            className="text-center"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={{
              offscreen: {},
              onscreen: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {/* Decorative icon */}
            <m.div
              className="mb-8"
              variants={{
                offscreen: { opacity: 0, scale: 0.5 },
                onscreen: { opacity: 1, scale: 1, transition: springs.bouncy },
              }}
            >
              <div
                className={`w-16 h-16 mx-auto flex items-center justify-center border-2 ${theme === "dark" ? "border-[#DCFF37]/30 bg-[#DCFF37]/10" : "border-[#FF4654]/30 bg-[#FF4654]/10"}`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:gamepad-bold"
                  width={32}
                  className={
                    theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]"
                  }
                />
              </div>
            </m.div>

            {/* Headline */}
            <m.h2
              className={`${electrolize.className} text-4xl sm:text-5xl lg:text-7xl font-bold text-[#F5F0E1] uppercase tracking-tight mb-6`}
              variants={{
                offscreen: { opacity: 0, y: 30, filter: "blur(10px)" },
                onscreen: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.7 },
                },
              }}
            >
              {t("landing.finalCta.titlePrefix")}{" "}
              <span
                className={
                  theme === "dark" ? "text-[#DCFF37]" : "text-[#FF4654]"
                }
              >
                {t("landing.finalCta.titleHighlight")}
              </span>
              ?
            </m.h2>

            {/* Subtext */}
            <m.p
              className="text-base sm:text-lg text-[#F5F0E1]/60 max-w-lg mx-auto mb-10 leading-relaxed"
              variants={{
                offscreen: { opacity: 0, y: 20 },
                onscreen: { opacity: 1, y: 0, transition: springs.gentle },
              }}
            >
              {t("landing.finalCta.subtitle")}
            </m.p>

            {/* CTAs */}
            <m.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={{
                offscreen: { opacity: 0, y: 20 },
                onscreen: { opacity: 1, y: 0, transition: springs.gentle },
              }}
            >
              <Button
                className="h-14 px-10 text-lg font-bold shadow-xl hover:shadow-2xl transition-all rounded-none touch-target w-full sm:w-auto"
                style={{
                  backgroundColor: theme === "dark" ? "#DCFF37" : "#FF4654",
                  color: theme === "dark" ? "#34445C" : "#ffffff",
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
                radius="none"
                size="lg"
                onPress={() => router.push("/onboarding")}
              >
                {t("landing.finalCta.createAccount")}
              </Button>
              <Button
                className="h-14 px-10 text-lg font-medium border-2 border-[#F5F0E1]/30 text-[#F5F0E1] rounded-none touch-target w-full sm:w-auto hover:bg-[#F5F0E1]/10 transition-all"
                endContent={
                  <Icon
                    icon="solar:arrow-right-linear"
                    width={20}
                    className="text-[#F5F0E1]"
                  />
                }
                radius="none"
                size="lg"
                variant="bordered"
                onPress={() => router.push("/pricing")}
              >
                {t("landing.finalCta.explorePlans")}
              </Button>
            </m.div>

            {/* Trust indicators */}
            <m.div
              className="flex flex-wrap justify-center gap-6 mt-10 text-[#F5F0E1]/30"
              variants={{
                offscreen: { opacity: 0 },
                onscreen: {
                  opacity: 1,
                  transition: { delay: 0.3, duration: 0.5 },
                },
              }}
            >
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Icon icon="solar:shield-check-bold" width={14} />
                <span>{t("landing.finalCta.trust.secure")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Icon icon="solar:bolt-bold" width={14} />
                <span>{t("landing.finalCta.trust.instantSetup")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Icon icon="solar:card-bold" width={14} />
                <span>{t("landing.finalCta.trust.freeTier")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Icon icon="solar:earth-bold" width={14} />
                <span>{t("landing.finalCta.trust.regions")}</span>
              </div>
            </m.div>
          </m.div>
        </LazyMotion>
      </div>
    </section>
  );
}
