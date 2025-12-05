/**
 * Skeleton Loader Component
 * Premium loading states with shimmer effect
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave',
}: SkeletonProps) {
  const baseClasses = 'bg-default-200 dark:bg-default-100 relative overflow-hidden';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width,
    height: variant === 'text' && !height ? '1rem' : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animation === 'wave' && <ShimmerEffect />}
      {animation === 'pulse' && <PulseEffect />}
    </div>
  );
}

// Shimmer effect overlay
function ShimmerEffect() {
  return (
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
      }}
      animate={{
        x: ['0%', '200%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// Pulse effect
function PulseEffect() {
  return (
    <motion.div
      className="absolute inset-0 bg-default-300/50 dark:bg-default-200/50"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Compound components for common patterns
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-default-200 p-4 ${className}`}>
      <Skeleton variant="rectangular" height="200px" className="mb-4" />
      <Skeleton width="60%" className="mb-2" />
      <Skeleton width="40%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width="80px" height="32px" variant="rounded" />
        <Skeleton width="80px" height="32px" variant="rounded" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({
  size = '40px',
  className = '',
}: {
  size?: string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          variant="text"
        />
      ))}
    </div>
  );
}

export function SkeletonButton({
  className = '',
  width = '100px',
}: {
  className?: string;
  width?: string;
}) {
  return (
    <Skeleton variant="rounded" width={width} height="36px" className={className} />
  );
}

export function SkeletonList({
  count = 5,
  spacing = 4,
  className = '',
}: {
  count?: number;
  spacing?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-${spacing} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar size="48px" />
          <div className="flex-1">
            <Skeleton width="40%" className="mb-2" />
            <Skeleton width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-default-200 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 border-b border-default-200 bg-default-50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} width="100%" height="20px" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 border-b border-default-100 p-4 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              width="100%"
              height="16px"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Profile skeleton
export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <SkeletonAvatar size="80px" />
      <div className="flex-1">
        <Skeleton width="200px" height="28px" className="mb-2" />
        <Skeleton width="150px" height="20px" className="mb-4" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

// Gallery skeleton
export function SkeletonGallery({
  count = 6,
  columns = 3,
  className = '',
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  }[columns] || 'grid-cols-3';

  return (
    <div className={`grid gap-4 ${gridCols} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height="200px"
          className="rounded-lg"
        />
      ))}
    </div>
  );
}

// Form skeleton
export function SkeletonForm({
  fields = 4,
  className = '',
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton width="120px" height="20px" className="mb-2" />
          <Skeleton variant="rounded" height="40px" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <SkeletonButton width="100px" />
        <SkeletonButton width="100px" />
      </div>
    </div>
  );
}
