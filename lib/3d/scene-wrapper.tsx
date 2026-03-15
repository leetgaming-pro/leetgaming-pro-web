/**
 * SceneWrapper - Standardized Three.js Canvas wrapper
 * Consistent camera, lighting, and rendering settings for all 3D sections
 */

"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

interface SceneWrapperProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  flat?: boolean;
  style?: React.CSSProperties;
}

export default function SceneWrapper({
  children,
  className = '',
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  flat = false,
  style,
}: SceneWrapperProps) {
  return (
    <Canvas
      className={className}
      camera={{
        position: cameraPosition,
        fov: cameraFov,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 2]}
      flat={flat}
      gl={{ antialias: true, alpha: true }}
      style={{ ...style, pointerEvents: 'auto' }}
    >
      {/* Standard lighting rig */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow={false} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#DCFF37" />

      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
