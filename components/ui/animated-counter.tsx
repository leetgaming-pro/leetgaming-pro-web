/**
 * Animated Counter Component
 * Premium number animation with morphing digits
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';
import { springs } from '@/lib/design/animations';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  duration = 0.8,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useSpring(0, {
    ...springs.smooth,
    duration: duration * 1000,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [motionValue, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Advanced version with digit-by-digit animation
interface DigitRollerProps {
  value: number;
  className?: string;
}

export function DigitRoller({ value, className = '' }: DigitRollerProps) {
  const digits = value.toString().split('');

  return (
    <div className={`flex ${className}`}>
      {digits.map((digit, index) => (
        <motion.div
          key={`${index}-${digit}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={springs.snappy}
          className="inline-block"
        >
          {digit}
        </motion.div>
      ))}
    </div>
  );
}

// Currency counter with symbol
interface CurrencyCounterProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export function CurrencyCounter({
  amount,
  currency = 'USD',
  locale = 'en-US',
  className = '',
}: CurrencyCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useSpring(0, springs.smooth);

  useEffect(() => {
    motionValue.set(amount);
  }, [motionValue, amount]);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      if (ref.current) {
        const formatted = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(latest);
        ref.current.textContent = formatted;
      }
    });

    return () => unsubscribe();
  }, [motionValue, currency, locale]);

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}

// Percentage counter with color coding
interface PercentageCounterProps {
  value: number;
  showSign?: boolean;
  colorCode?: boolean;
  className?: string;
}

export function PercentageCounter({
  value,
  showSign = true,
  colorCode = true,
  className = '',
}: PercentageCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useSpring(0, springs.smooth);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      if (ref.current) {
        const sign = showSign && latest > 0 ? '+' : '';
        ref.current.textContent = `${sign}${latest.toFixed(1)}%`;
      }
    });

    return () => unsubscribe();
  }, [motionValue, showSign]);

  const colorClass = colorCode
    ? value > 0
      ? 'text-success'
      : value < 0
      ? 'text-danger'
      : 'text-default-500'
    : '';

  return (
    <span ref={ref} className={`${colorClass} ${className}`}>
      {showSign && value > 0 ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}
