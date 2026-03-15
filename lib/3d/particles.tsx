/**
 * BrandParticles - Reusable floating particle field component
 * Creates ambient depth effect with brand-colored glowing particles
 */

"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COLORS } from './brand-materials';

interface BrandParticlesProps {
  count?: number;
  spread?: number;
  speed?: number;
  size?: number;
  colorScheme?: 'lime' | 'orange' | 'mixed' | 'gold';
  opacity?: number;
}

export default function BrandParticles({
  count = 200,
  spread = 10,
  speed = 0.2,
  size = 0.03,
  colorScheme = 'mixed',
  opacity = 0.6,
}: BrandParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      let color: [number, number, number];
      if (colorScheme === 'mixed') {
        const colorOptions = [PARTICLE_COLORS.lime, PARTICLE_COLORS.orange, PARTICLE_COLORS.gold, PARTICLE_COLORS.cream];
        color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      } else if (colorScheme === 'lime') {
        color = PARTICLE_COLORS.lime;
      } else if (colorScheme === 'orange') {
        color = PARTICLE_COLORS.orange;
      } else {
        color = PARTICLE_COLORS.gold;
      }

      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }

    return { positions, colors };
  }, [count, spread, colorScheme]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    pointsRef.current.rotation.y = time * speed * 0.1;
    pointsRef.current.rotation.x = Math.sin(time * speed * 0.05) * 0.1;

    // Gentle floating motion for individual particles
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time * speed + i * 0.1) * 0.0005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
