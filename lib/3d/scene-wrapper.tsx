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

// Check if WebGL is available to avoid crashes on unsupported environments
function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function SceneWrapper({
  children,
  className = '',
  cameraPosition = [0, 0, 5],
  cameraFov = 50,
  flat = false,
  style,
}: SceneWrapperProps) {
  if (!isWebGLAvailable()) {
    return null;
  }

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
