/**
 * FloatingElement - Wrapper for branded floating 3D objects
 * Combines @react-three/drei Float with brand-consistent motion
 */

"use client";

import React from 'react';
import { Float } from '@react-three/drei';

interface FloatingElementProps {
  children: React.ReactNode;
  speed?: number;
  rotationIntensity?: number;
  floatIntensity?: number;
  floatingRange?: [number, number];
}

export default function FloatingElement({
  children,
  speed = 1.5,
  rotationIntensity = 0.5,
  floatIntensity = 0.5,
  floatingRange = [-0.1, 0.1],
}: FloatingElementProps) {
  return (
    <Float
      speed={speed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
      floatingRange={floatingRange}
    >
      {children}
    </Float>
  );
}
