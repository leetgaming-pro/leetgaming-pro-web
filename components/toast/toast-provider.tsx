"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - BRANDED TOAST PROVIDER                                      ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning toast notifications with LeetGaming branding:                 ║
 * ║  • Signature clip-path corners (edgy esports aesthetic)                      ║
 * ║  • Brand color palette (Navy, Lime, Orange, Gold, Cream)                     ║
 * ║  • Smooth spring animations with Framer Motion                               ║
 * ║  • Severity-based styling for clear visual hierarchy                         ║
 * ║  • Consistent with PlanLimitModal and ErrorContext styling                   ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

type ToastType = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// LeetGaming Brand Icons - Solar icon set for consistency
const toastIcons: Record<ToastType, string> = {
  info: "solar:info-circle-bold-duotone",
  success: "solar:check-circle-bold-duotone",
  warning: "solar:danger-triangle-bold-duotone",
  error: "solar:close-circle-bold-duotone",
};

// LeetGaming Brand Colors - Award-winning design palette
const toastStyles: Record<
  ToastType,
  {
    bgClass: string;
    borderClass: string;
    iconClass: string;
    textClass: string;
    accentGradient: string;
  }
> = {
  info: {
    bgClass: "bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95",
    borderClass: "border-[#34445C]/30 dark:border-[#DCFF37]/30",
    iconClass: "text-[#34445C] dark:text-[#DCFF37]",
    textClass: "text-[#34445C] dark:text-[#F5F0E1]",
    accentGradient:
      "bg-gradient-to-r from-[#34445C] to-[#34445C]/70 dark:from-[#DCFF37] dark:to-[#DCFF37]/70",
  },
  success: {
    bgClass: "bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95",
    borderClass: "border-[#17C964]/30",
    iconClass: "text-[#17C964]",
    textClass: "text-[#34445C] dark:text-[#F5F0E1]",
    accentGradient: "bg-gradient-to-r from-[#17C964] to-[#17C964]/70",
  },
  warning: {
    bgClass: "bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95",
    borderClass: "border-[#FFC700]/30",
    iconClass: "text-[#FFC700]",
    textClass: "text-[#34445C] dark:text-[#F5F0E1]",
    accentGradient: "bg-gradient-to-r from-[#FFC700] to-[#FFC700]/70",
  },
  error: {
    bgClass: "bg-[#F5F0E1]/95 dark:bg-[#0a0a0a]/95",
    borderClass: "border-[#FF4654]/30",
    iconClass: "text-[#FF4654]",
    textClass: "text-[#34445C] dark:text-[#F5F0E1]",
    accentGradient: "bg-gradient-to-r from-[#FF4654] to-[#FF4654]/70",
  },
};

// Default titles for each toast type
const _defaultTitles: Record<ToastType, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  error: "Error",
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration: number = 5000,
      title?: string,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, duration, title };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
      }
    },
    [],
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container - Bottom right with edgy LeetGaming styling */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const styles = toastStyles[toast.type];

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  layout: { type: "spring", damping: 25, stiffness: 300 },
                }}
                className={cn(
                  "pointer-events-auto relative overflow-hidden",
                  "border backdrop-blur-md shadow-2xl",
                  styles.bgClass,
                  styles.borderClass,
                )}
                style={{
                  // LeetGaming signature clip-path corners
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                }}
              >
                {/* Accent line at top - brand gradient */}
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-[2px]",
                    styles.accentGradient,
                  )}
                />

                {/* Toast content */}
                <div className="flex items-start gap-3 p-4">
                  {/* Icon container with clip-path */}
                  <div
                    className={cn(
                      "w-8 h-8 flex-shrink-0 flex items-center justify-center",
                      "bg-[#34445C]/5 dark:bg-[#DCFF37]/5",
                    )}
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon={toastIcons[toast.type]}
                      className={cn("w-5 h-5", styles.iconClass)}
                    />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    {toast.title && (
                      <p
                        className={cn(
                          "text-sm font-bold mb-0.5",
                          styles.iconClass,
                        )}
                      >
                        {toast.title}
                      </p>
                    )}
                    <p className={cn("text-sm font-medium", styles.textClass)}>
                      {toast.message}
                    </p>
                  </div>

                  {/* Close button with LeetGaming styling */}
                  <button
                    onClick={() => hideToast(toast.id)}
                    className={cn(
                      "flex-shrink-0 w-6 h-6 flex items-center justify-center",
                      "opacity-50 hover:opacity-100 transition-all duration-200",
                      "hover:bg-[#34445C]/10 dark:hover:bg-[#F5F0E1]/10",
                      "active:scale-95",
                    )}
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)",
                    }}
                    aria-label="Dismiss notification"
                  >
                    <Icon
                      icon="solar:close-circle-linear"
                      className="w-4 h-4 text-[#34445C]/70 dark:text-[#F5F0E1]/70"
                    />
                  </button>
                </div>

                {/* Progress bar for auto-dismiss (optional visual feedback) */}
                {toast.duration && toast.duration > 0 && (
                  <motion.div
                    className={cn(
                      "absolute bottom-0 left-0 h-[2px]",
                      styles.accentGradient,
                    )}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{
                      duration: toast.duration / 1000,
                      ease: "linear",
                    }}
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
