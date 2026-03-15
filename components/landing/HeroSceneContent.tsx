/**
 * HeroScene3D - Immersive 3D hero section for LeetGaming.PRO landing page
 * Features a floating hexagonal arena with orbiting game icons, particle field,
 * interactive cursor-following camera, and bloom glow effects
 */

"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Edges, Ring } from '@react-three/drei';
import * as THREE from 'three';
import BrandParticles from '@/lib/3d/particles';
import { BRAND_COLORS_3D } from '@/lib/3d/brand-materials';

// ─── Hexagonal Arena Platform ───────────────────────────────────────────────

function HexagonalArena() {
  const arenaRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!arenaRef.current) return;
    const time = state.clock.getElapsedTime();
    arenaRef.current.rotation.y = time * 0.08;

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.15;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 0.15;
    }
  });

  // Hexagonal shape
  const hexShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 1.8;
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  }), []);

  return (
    <group ref={arenaRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main platform */}
      <mesh position={[0, 0, 0]}>
        <extrudeGeometry args={[hexShape, extrudeSettings]} />
        <meshStandardMaterial
          color={BRAND_COLORS_3D.navyDark}
          metalness={0.6}
          roughness={0.3}
          envMapIntensity={0.5}
        />
        <Edges threshold={15} color={BRAND_COLORS_3D.lime} linewidth={1} />
      </mesh>

      {/* Glowing top surface */}
      <mesh ref={glowRef} position={[0, 0, 0.16]}>
        <shapeGeometry args={[hexShape]} />
        <meshStandardMaterial
          color={BRAND_COLORS_3D.navy}
          emissive={BRAND_COLORS_3D.lime}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Orbiting ring */}
      <group ref={ringRef} position={[0, 0, 0.2]}>
        <Ring args={[2.2, 2.35, 64]}>
          <meshStandardMaterial
            color={BRAND_COLORS_3D.lime}
            emissive={BRAND_COLORS_3D.lime}
            emissiveIntensity={0.4}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      {/* Second outer ring */}
      <group position={[0, 0, 0.18]}>
        <Ring args={[2.6, 2.65, 64]}>
          <meshStandardMaterial
            color={BRAND_COLORS_3D.orange}
            emissive={BRAND_COLORS_3D.orange}
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      {/* Center decorative crosshair */}
      <mesh position={[0, 0, 0.17]}>
        <ringGeometry args={[0.15, 0.2, 4]} />
        <meshStandardMaterial
          color={BRAND_COLORS_3D.orange}
          emissive={BRAND_COLORS_3D.orange}
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Orbiting Game Icons ────────────────────────────────────────────────────

interface OrbitingIconProps {
  angle: number;
  radius: number;
  speed: number;
  color: string;
  yOffset?: number;
  shape?: 'box' | 'octahedron' | 'icosahedron' | 'dodecahedron' | 'torus';
}

function OrbitingIcon({ angle, radius, speed, color, yOffset = 0, shape = 'box' }: OrbitingIconProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const currentAngle = angle + time * speed;

    groupRef.current.position.x = Math.cos(currentAngle) * radius;
    groupRef.current.position.z = Math.sin(currentAngle) * radius;
    groupRef.current.position.y = yOffset + Math.sin(time * 1.5 + angle) * 0.15;

    meshRef.current.rotation.y = time * 0.8;
    meshRef.current.rotation.x = time * 0.3;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'octahedron': return <octahedronGeometry args={[0.2]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.2, 0]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.2, 0]} />;
      case 'torus': return <torusGeometry args={[0.15, 0.06, 8, 16]} />;
      default: return <boxGeometry args={[0.28, 0.28, 0.28]} />;
    }
  }, [shape]);

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          {geometry}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.3}
            toneMapped={false}
          />
          <Edges threshold={15} color={color} linewidth={1} />
        </mesh>
      </Float>
    </group>
  );
}

// ─── Scan Lines Effect ──────────────────────────────────────────────────────

function ScanLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.getElapsedTime();
    linesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(time * 2 + i * 0.5) * 0.04;
    });
  });

  return (
    <group ref={linesRef} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const length = 4;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2, Math.sin(angle) * 2, 0.2]} rotation={[0, 0, angle + Math.PI / 2]}>
            <planeGeometry args={[0.005, length]} />
            <meshBasicMaterial color={BRAND_COLORS_3D.lime} transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Energy Orbs ────────────────────────────────────────────────────────────

function EnergyOrbs() {
  const orbsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!orbsRef.current) return;
    const time = state.clock.getElapsedTime();
    orbsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.y = Math.sin(time * 0.8 + i * 1.5) * 1.5;
      mesh.position.x = Math.cos(time * 0.3 + i * 2.1) * 3;
      mesh.position.z = Math.sin(time * 0.5 + i * 1.8) * 2;
      const scale = 0.03 + Math.sin(time * 2 + i) * 0.015;
      mesh.scale.setScalar(scale);
    });
  });

  const colors = [BRAND_COLORS_3D.lime, BRAND_COLORS_3D.orange, BRAND_COLORS_3D.gold, BRAND_COLORS_3D.lime, BRAND_COLORS_3D.orange];

  return (
    <group ref={orbsRef}>
      {colors.map((color, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Interactive Camera Controller ──────────────────────────────────────────

function CameraController() {
  const { camera } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((event: THREE.Event & { clientX?: number; clientY?: number; pointer?: THREE.Vector2 }) => {
    // We'll use the frame loop instead
  }, []);

  useFrame((state) => {
    const pointer = state.pointer;
    targetRotation.current.x = pointer.y * 0.15;
    targetRotation.current.y = pointer.x * 0.2;

    camera.rotation.x += (targetRotation.current.x - camera.rotation.x) * 0.02;
    camera.rotation.y += (targetRotation.current.y - camera.rotation.y) * 0.02;
  });

  return null;
}

// ─── Main Scene Content ─────────────────────────────────────────────────────

const GAME_ICONS: OrbitingIconProps[] = [
  { angle: 0, radius: 3.0, speed: 0.25, color: '#FF9800', shape: 'box' },
  { angle: Math.PI / 3, radius: 3.2, speed: 0.2, color: '#FF4654', shape: 'octahedron' },
  { angle: (2 * Math.PI) / 3, radius: 2.8, speed: 0.3, color: '#C89B3C', shape: 'icosahedron' },
  { angle: Math.PI, radius: 3.1, speed: 0.22, color: '#A13D2D', shape: 'dodecahedron' },
  { angle: (4 * Math.PI) / 3, radius: 2.9, speed: 0.28, color: '#4A90D9', shape: 'torus' },
  { angle: (5 * Math.PI) / 3, radius: 3.3, speed: 0.18, color: '#F2A900', shape: 'box' },
];

export function HeroSceneContent() {
  return (
    <>
      {/* Background particles */}
      <BrandParticles count={300} spread={15} speed={0.15} size={0.025} colorScheme="mixed" opacity={0.5} />

      {/* Main arena */}
      <HexagonalArena />

      {/* Orbiting game icons */}
      {GAME_ICONS.map((icon, i) => (
        <OrbitingIcon key={i} {...icon} yOffset={0.3} />
      ))}

      {/* Scan lines */}
      <ScanLines />

      {/* Floating energy orbs */}
      <EnergyOrbs />

      {/* Camera interaction */}
      <CameraController />

      {/* Additional atmospheric lighting */}
      <pointLight position={[0, 2, 0]} intensity={0.8} color={BRAND_COLORS_3D.lime} distance={8} decay={2} />
      <pointLight position={[3, 0, 3]} intensity={0.4} color={BRAND_COLORS_3D.orange} distance={6} decay={2} />
      <pointLight position={[-3, 0, -3]} intensity={0.4} color={BRAND_COLORS_3D.gold} distance={6} decay={2} />
    </>
  );
}
