'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING — UNIFIED TOAST SYSTEM                                        ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Single source of truth for all toast notifications:                         ║
 * ║  • Angular clip-path corners (esports aesthetic)                             ║
 * ║  • Brand gradients (Navy, Lime, Orange, Gold, Cream)                         ║
 * ║  • Framer Motion spring physics                                              ║
 * ║  • useSound integration for audio feedback                                   ║
 * ║  • 7 types: info, success, warning, error, match, achievement, connection    ║
 * ║  • Max 3 stacked toasts with queue overflow                                  ║
 * ║  • Accessible: role="alert", aria-live, ESC dismissal                        ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@nextui-org/react';
import { useSound, type SoundName } from '@/hooks/use-sound';

// ── Types ───────────────────────────────────────────────────────────────────

export type ToastType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'match'
  | 'achievement'
  | 'connection';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  title?: string;
  createdAt: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    title?: string,
  ) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ── Visual Config ───────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, string> = {
  info: 'solar:info-circle-bold-duotone',
  success: 'solar:check-circle-bold-duotone',
  warning: 'solar:danger-triangle-bold-duotone',
  error: 'solar:close-circle-bold-duotone',
  match: 'solar:gameboy-bold-duotone',
  achievement: 'solar:cup-star-bold-duotone',
  connection: 'solar:server-bold-duotone',
};

const TOAST_SOUNDS: Partial<Record<ToastType, SoundName>> = {
  error: 'error',
  match: 'match-found',
  achievement: 'achievement',
  connection: 'connection-ready',
  success: 'notification-pop',
};

interface ToastVisualStyle {
  bgClass: string;
  borderClass: string;
  iconClass: string;
  textClass: string;
  accentGradient: string;
}

const TOAST_STYLES: Record<ToastType, ToastVisualStyle> = {
  info: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#34445C]/30 dark:border-[#DCFF37]/30',
    iconClass: 'text-[#34445C] dark:text-[#DCFF37]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient:
      'bg-gradient-to-r from-[#34445C] to-[#34445C]/70 dark:from-[#DCFF37] dark:to-[#DCFF37]/70',
  },
  success: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#17C964]/30',
    iconClass: 'text-[#17C964]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient: 'bg-gradient-to-r from-[#17C964] to-[#17C964]/70',
  },
  warning: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#FFC700]/30',
    iconClass: 'text-[#FFC700]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient: 'bg-gradient-to-r from-[#FFC700] to-[#FFC700]/70',
  },
  error: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#FF4654]/30',
    iconClass: 'text-[#FF4654]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient: 'bg-gradient-to-r from-[#FF4654] to-[#FF4654]/70',
  },
  match: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#DCFF37]/40',
    iconClass: 'text-[#DCFF37]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient:
      'bg-gradient-to-r from-[#DCFF37] to-[#34445C] dark:from-[#DCFF37] dark:to-[#34445C]',
  },
  achievement: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#FFC700]/40',
    iconClass: 'text-[#FFC700]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient: 'bg-gradient-to-r from-[#FFC700] to-[#FF4654]',
  },
  connection: {
    bgClass: 'bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95',
    borderClass: 'border-[#17C964]/40',
    iconClass: 'text-[#17C964]',
    textClass: 'text-[#34445C] dark:text-[#F5F0E1]',
    accentGradient: 'bg-gradient-to-r from-[#17C964] to-[#DCFF37]',
  },
};

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  info: 5000,
  success: 4000,
  warning: 6000,
  error: 8000,
  match: 8000,
  achievement: 6000,
  connection: 10000,
};

const MAX_VISIBLE = 3;

// ── Provider ────────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const queueRef = useRef<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const sound = useSound();

  const processQueue = useCallback(() => {
    setToasts((prev) => {
      if (prev.length >= MAX_VISIBLE || queueRef.current.length === 0) return prev;
      const next = queueRef.current.shift()!;
      return [...prev, next];
    });
  }, []);

  const hideToast = useCallback(
    (id: string) => {
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setTimeout(processQueue, 100);
    },
    [processQueue],
  );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration?: number,
      title?: string,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const resolvedDuration = duration ?? DEFAULT_DURATIONS[type];
      const newToast: Toast = {
        id,
        message,
        type,
        duration: resolvedDuration,
        title,
        createdAt: Date.now(),
      };

      // Play sound for this toast type
      const soundName = TOAST_SOUNDS[type];
      if (soundName) {
        sound.playWithHaptic(soundName);
      }

      setToasts((prev) => {
        if (prev.length >= MAX_VISIBLE) {
          queueRef.current.push(newToast);
          return prev;
        }
        return [...prev, newToast];
      });

      if (resolvedDuration > 0) {
        const timer = setTimeout(() => hideToast(id), resolvedDuration);
        timersRef.current.set(id, timer);
      }
    },
    [hideToast, sound],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const styles = TOAST_STYLES[toast.type];
            const isHighPriority = toast.type === 'error' || toast.type === 'match';

            return (
              <motion.div
                key={toast.id}
                layout
                role="alert"
                aria-live={isHighPriority ? 'assertive' : 'polite'}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                  layout: { type: 'spring', damping: 25, stiffness: 300 },
                }}
                className={cn(
                  'pointer-events-auto relative overflow-hidden',
                  'border backdrop-blur-md shadow-2xl',
                  styles.bgClass,
                  styles.borderClass,
                )}
                style={{
                  clipPath:
                    'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
                }}
              >
                {/* Accent gradient — top */}
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-[2px]',
                    styles.accentGradient,
                  )}
                />

                {/* Content */}
                <div className="flex items-start gap-3 p-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 flex-shrink-0 flex items-center justify-center',
                      'bg-[#34445C]/5 dark:bg-[#DCFF37]/5',
                    )}
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                    }}
                  >
                    <Icon
                      icon={TOAST_ICONS[toast.type]}
                      className={cn('w-5 h-5', styles.iconClass)}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <p
                        className={cn(
                          'text-sm font-bold mb-0.5',
                          styles.iconClass,
                        )}
                      >
                        {toast.title}
                      </p>
                    )}
                    <p className={cn('text-sm font-medium', styles.textClass)}>
                      {toast.message}
                    </p>
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => hideToast(toast.id)}
                    className={cn(
                      'flex-shrink-0 w-6 h-6 flex items-center justify-center',
                      'opacity-50 hover:opacity-100 transition-all duration-200',
                      'hover:bg-[#34445C]/10 dark:hover:bg-[#F5F0E1]/10',
                      'active:scale-95',
                    )}
                    style={{
                      clipPath:
                        'polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)',
                    }}
                    aria-label="Dismiss notification"
                  >
                    <Icon
                      icon="solar:close-circle-linear"
                      className="w-4 h-4 text-[#34445C]/70 dark:text-[#F5F0E1]/70"
                    />
                  </button>
                </div>

                {/* Auto-dismiss progress bar */}
                {toast.duration > 0 && (
                  <motion.div
                    className={cn(
                      'absolute bottom-0 left-0 h-[2px]',
                      styles.accentGradient,
                    )}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{
                      duration: toast.duration / 1000,
                      ease: 'linear',
                    }}
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
