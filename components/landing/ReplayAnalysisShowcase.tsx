/**
 * ReplayAnalysisShowcase - AI Replay Analysis deep-dive section
 * Split layout with animated demo visualization and feature breakdown
 */

"use client";

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Electrolize } from "next/font/google";
import { scrollAnimations, scrollViewport, springs } from '@/lib/design/animations';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const electrolize = Electrolize({ weight: "400", subsets: ["latin"] });
const SceneWrapper = dynamic(() => import('@/lib/3d/scene-wrapper'), { ssr: false });

// ─── 3D Replay Visualization Scene ─────────────────────────────────────────

function ScanBeam() {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!beamRef.current) return;
    const time = state.clock.getElapsedTime();
    beamRef.current.position.z = Math.sin(time * 0.5) * 2;
    const mat = beamRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.1 + Math.sin(time * 2) * 0.05;
  });

  return (
    <mesh ref={beamRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[5, 0.08]} />
      <meshBasicMaterial color="#DCFF37" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function MapOutline() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
  });

  // Simplified top-down map layout (abstract rectangular rooms)
  const rooms = [
    { pos: [-1, 0, -1] as [number, number, number], size: [1.2, 0.02, 0.8] as [number, number, number] },
    { pos: [0.5, 0, -0.5] as [number, number, number], size: [0.8, 0.02, 1.5] as [number, number, number] },
    { pos: [-0.5, 0, 1] as [number, number, number], size: [1.5, 0.02, 0.6] as [number, number, number] },
    { pos: [1.5, 0, 0.8] as [number, number, number], size: [0.6, 0.02, 1.0] as [number, number, number] },
    { pos: [0, 0, 0] as [number, number, number], size: [0.4, 0.02, 0.4] as [number, number, number] },
  ];

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {rooms.map((room, i) => (
        <mesh key={i} position={room.pos}>
          <boxGeometry args={room.size} />
          <meshStandardMaterial color="#34445C" transparent opacity={0.6} metalness={0.3} roughness={0.8} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(...room.size)]} />
            <lineBasicMaterial color="#DCFF37" transparent opacity={0.4} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}

function PlayerDots() {
  const dotsRef = useRef<THREE.Group>(null);
  const pathsRef = useRef<{ offset: number; speedMult: number; radiusX: number; radiusZ: number; centerX: number; centerZ: number }[]>([]);

  if (pathsRef.current.length === 0) {
    // 5 CT (blue) + 5 T (orange) player dots
    for (let i = 0; i < 10; i++) {
      pathsRef.current.push({
        offset: Math.random() * Math.PI * 2,
        speedMult: 0.3 + Math.random() * 0.4,
        radiusX: 0.3 + Math.random() * 0.8,
        radiusZ: 0.3 + Math.random() * 0.8,
        centerX: (Math.random() - 0.5) * 2,
        centerZ: (Math.random() - 0.5) * 2,
      });
    }
  }

  useFrame((state) => {
    if (!dotsRef.current) return;
    const time = state.clock.getElapsedTime();
    dotsRef.current.children.forEach((child, i) => {
      const path = pathsRef.current[i];
      if (!path) return;
      const mesh = child as THREE.Mesh;
      mesh.position.x = path.centerX + Math.cos(time * path.speedMult + path.offset) * path.radiusX;
      mesh.position.z = path.centerZ + Math.sin(time * path.speedMult + path.offset) * path.radiusZ;
    });
  });

  return (
    <group ref={dotsRef} position={[0, -0.45, 0]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={i < 5 ? '#4A90D9' : '#FF9800'}
            emissive={i < 5 ? '#4A90D9' : '#FF9800'}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function ReplayVisualizationScene() {
  return (
    <SceneWrapper cameraPosition={[0, 3.5, 3]} cameraFov={45} style={{ width: '100%', height: '100%' }}>
      <MapOutline />
      <PlayerDots />
      <ScanBeam />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#DCFF37" />
    </SceneWrapper>
  );
}

// ─── Feature List ───────────────────────────────────────────────────────────

const FEATURES = [
  { icon: 'solar:chart-2-bold', text: 'HLTV 2.0 Rating, ADR, KAST% analysis' },
  { icon: 'solar:graph-up-bold', text: 'Round-by-round economy & utility breakdown' },
  { icon: 'solar:cpu-bolt-bold', text: 'AI-powered improvement suggestions' },
  { icon: 'solar:play-circle-bold', text: 'CS2 & Valorant demo parsing' },
  { icon: 'solar:users-group-two-rounded-bold', text: 'Team performance insights & coaching cues' },
  { icon: 'solar:history-bold', text: 'Historical progress tracking & trends' },
];

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-3 border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
    >
      <div className={`${electrolize.className} text-xl sm:text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]`}>{value}</div>
      <div className="text-xs text-default-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ReplayAnalysisShowcase() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <section className="landing-section relative py-24 md:py-32 overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 50%, #0a0a0a 100%)'
          : 'linear-gradient(180deg, #F5F0E1 0%, #ebe6d7 50%, #F5F0E1 100%)',
      }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(${theme === 'dark' ? '220,255,55' : '52,68,92'}, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme === 'dark' ? '220,255,55' : '52,68,92'}, 0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10">
        <LazyMotion features={domAnimation}>
          {/* Section Label */}
          <m.div
            className="text-center mb-16"
            initial="offscreen"
            whileInView="onscreen"
            viewport={scrollViewport}
            variants={scrollAnimations.fadeInUp}
          >
            <span className={`${electrolize.className} text-xs sm:text-sm uppercase tracking-[0.3em] text-[#FF4654] dark:text-[#DCFF37] mb-4 block`}>
              {t('landing.replayAnalysis.eyebrow')}
            </span>
            <h2 className={`${electrolize.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 uppercase tracking-tight`}>
              {t('landing.replayAnalysis.headingPrefix')}{' '}
              <span className="text-[#FF4654] dark:text-[#DCFF37]">{t('landing.replayAnalysis.headingHighlight')}</span>
            </h2>
          </m.div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: 3D Visualization */}
            <m.div
              className="relative h-[350px] sm:h-[400px] lg:h-[450px] border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-black/30 dark:bg-black/50 overflow-hidden"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}
              initial="offscreen"
              whileInView="onscreen"
              viewport={scrollViewport}
              variants={scrollAnimations.fadeInLeft}
            >
              <ReplayVisualizationScene />

              {/* Overlay HUD elements */}
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className={`${electrolize.className} text-xs text-[#FF4654] dark:text-[#DCFF37] uppercase tracking-wider`}>
                  {t('landing.replayAnalysis.analyzing')}
                </span>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-none">
                <div className="bg-[#4A90D9]/20 border border-[#4A90D9]/30 px-2 py-1">
                  <span className={`${electrolize.className} text-[10px] text-[#4A90D9] uppercase`}>CT</span>
                </div>
                <div className="bg-[#FF9800]/20 border border-[#FF9800]/30 px-2 py-1">
                  <span className={`${electrolize.className} text-[10px] text-[#FF9800] uppercase`}>T</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 pointer-events-none">
                <span className={`${electrolize.className} text-[10px] text-default-500 uppercase tracking-wider`}>ROUND 14 / 24</span>
              </div>
            </m.div>

            {/* Right: Features & Text */}
            <m.div
              className="space-y-6"
              initial="offscreen"
              whileInView="onscreen"
              viewport={scrollViewport}
              variants={{
                offscreen: {},
                onscreen: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
              }}
            >
              <m.p
                className="text-default-500 text-base sm:text-lg leading-relaxed"
                variants={{
                  offscreen: { opacity: 0, x: 30 },
                  onscreen: { opacity: 1, x: 0, transition: springs.gentle },
                }}
              >
                {t('landing.replayAnalysis.description')}
              </m.p>

              {/* Feature bullets */}
              <div className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <m.div
                    key={i}
                    className="flex items-center gap-3 group"
                    variants={{
                      offscreen: { opacity: 0, x: 30 },
                      onscreen: { opacity: 1, x: 0, transition: { ...springs.gentle, delay: i * 0.05 } },
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 group-hover:bg-[#FF4654]/20 dark:group-hover:bg-[#DCFF37]/20 transition-colors"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)' }}
                    >
                      <Icon icon={feature.icon} width={16} className="text-[#FF4654] dark:text-[#DCFF37]" />
                    </div>
                    <span className="text-sm sm:text-base text-foreground/80">{feature.text}</span>
                  </m.div>
                ))}
              </div>

              {/* Stats row */}
              <m.div
                className="grid grid-cols-3 gap-3 pt-4"
                variants={{
                  offscreen: { opacity: 0, y: 20 },
                  onscreen: { opacity: 1, y: 0, transition: springs.gentle },
                }}
              >
                <div className="text-center p-3 border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                  <div className={`${electrolize.className} text-xl sm:text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]`}>2.0</div>
                  <div className="text-xs text-default-500 uppercase tracking-wider mt-1">{t('landing.replayAnalysis.stat.hltvRating')}</div>
                </div>
                <div className="text-center p-3 border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                  <div className={`${electrolize.className} text-xl sm:text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]`}>89.3</div>
                  <div className="text-xs text-default-500 uppercase tracking-wider mt-1">{t('landing.replayAnalysis.stat.adr')}</div>
                </div>
                <div className="text-center p-3 border border-[#FF4654]/10 dark:border-[#DCFF37]/10 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                  <div className={`${electrolize.className} text-xl sm:text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]`}>76%</div>
                  <div className="text-xs text-default-500 uppercase tracking-wider mt-1">{t('landing.replayAnalysis.stat.kast')}</div>
                </div>
              </m.div>

              {/* CTA */}
              <m.div
                variants={{
                  offscreen: { opacity: 0, y: 20 },
                  onscreen: { opacity: 1, y: 0, transition: springs.gentle },
                }}
              >
                <Button
                  className="h-12 px-6 text-base font-semibold rounded-none touch-target"
                  style={{
                    backgroundColor: theme === 'dark' ? '#DCFF37' : '#34445C',
                    color: theme === 'dark' ? '#34445C' : '#F5F0E1',
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
                  }}
                  radius="none"
                  endContent={<Icon icon="solar:upload-bold" width={18} className={theme === 'dark' ? 'text-[#34445C]' : 'text-[#F5F0E1]'} />}
                  onPress={() => router.push("/replays/upload")}
                >
                  {t('landing.replayAnalysis.cta')}
                </Button>
              </m.div>
            </m.div>
          </div>
        </LazyMotion>
      </div>
    </section>
  );
}
