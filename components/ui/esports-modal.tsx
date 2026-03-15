'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — ESPORTS MODAL                                               ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Reusable branded modal wrapper that applies the full leet-modal-*           ║
 * ║  CSS class system: angular clip-path corners, scan-line overlays,            ║
 * ║  corner glow accents, gradient header shine, and grid-pattern backdrop.      ║
 * ║                                                                              ║
 * ║  Replaces generic NextUI Modal in all matchmaking/notification flows.        ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { electrolize } from '@/config/fonts';

// ── Types ───────────────────────────────────────────────────────────────────

export type EsportsModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface EsportsModalStep {
  label: string;
  completed?: boolean;
  active?: boolean;
}

export interface EsportsModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when modal requests close (backdrop click, ESC, close button) */
  onClose?: () => void;
  /** Title displayed in the header */
  title?: string;
  /** Solar icon name for the header icon */
  icon?: string;
  /** Optional step indicators below the header */
  steps?: EsportsModalStep[];
  /** Size variant */
  size?: EsportsModalSize;
  /** Whether close button is hidden */
  hideCloseButton?: boolean;
  /** Whether clicking backdrop or pressing ESC closes the modal */
  isDismissable?: boolean;
  /** Header content override — replaces default title rendering */
  headerContent?: ReactNode;
  /** Footer content */
  footerContent?: ReactNode;
  /** Body content */
  children: ReactNode;
  /** Extra className on the content wrapper */
  className?: string;
  /** Accessible label (required when no title) */
  'aria-label'?: string;
}

// ── Size Map ────────────────────────────────────────────────────────────────

const sizeClasses: Record<EsportsModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

// ── Animation Presets ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

export function EsportsModal({
  isOpen,
  onClose,
  title,
  icon,
  steps,
  size = 'md',
  hideCloseButton = false,
  isDismissable = true,
  headerContent,
  footerContent,
  children,
  className,
  'aria-label': ariaLabel,
}: EsportsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── Focus trap & ESC handling ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside the modal
    const timer = setTimeout(() => {
      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable?.length) {
        focusable[0].focus();
      }
    }, 100);

    // ESC key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDismissable && onClose) {
        onClose();
      }

      // Trap focus within modal
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen, isDismissable, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
          {/* ── Backdrop ─────────────────────────────────────────────── */}
          <motion.div
            className="leet-modal-backdrop absolute inset-0"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={isDismissable ? onClose : undefined}
            aria-hidden="true"
          />

          {/* ── Modal Content ────────────────────────────────────────── */}
          <motion.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || title}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'leet-modal-content relative z-10 w-full mx-4',
              sizeClasses[size],
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ───────────────────────────────────────────── */}
            {(title || icon || headerContent) && (
              <div className="leet-modal-header">
                {headerContent || (
                  <div className="leet-modal-title">
                    {icon && (
                      <div className="leet-modal-icon">
                        <Icon icon={icon} width={24} />
                      </div>
                    )}
                    <h2
                      className={cn(
                        'text-lg font-bold uppercase tracking-wider',
                        electrolize.className,
                      )}
                    >
                      {title}
                    </h2>
                  </div>
                )}

                {!hideCloseButton && onClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'absolute top-3 right-3',
                      'w-8 h-8 flex items-center justify-center',
                      'text-[#34445C]/60 dark:text-[#F5F0E1]/60',
                      'hover:text-[#FF4654] dark:hover:text-[#FF4654]',
                      'hover:bg-[#FF4654]/10',
                      'transition-all duration-200',
                    )}
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                    }}
                    aria-label="Close modal"
                  >
                    <Icon icon="solar:close-circle-linear" width={20} />
                  </button>
                )}
              </div>
            )}

            {/* ── Steps ────────────────────────────────────────────── */}
            {steps && steps.length > 0 && (
              <div className="leet-modal-steps" role="list" aria-label="Progress steps">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    role="listitem"
                    aria-label={`Step ${i + 1}: ${step.label}${step.completed ? ' (completed)' : step.active ? ' (current)' : ''}`}
                    className={cn(
                      'leet-modal-step',
                      step.active && 'leet-modal-step-active',
                      step.completed && 'leet-modal-step-complete',
                    )}
                    title={step.label}
                  />
                ))}
              </div>
            )}

            {/* ── Body ─────────────────────────────────────────────── */}
            <div className="leet-modal-body p-6">{children}</div>

            {/* ── Footer ───────────────────────────────────────────── */}
            {footerContent && (
              <div className="leet-modal-footer p-4">{footerContent}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
