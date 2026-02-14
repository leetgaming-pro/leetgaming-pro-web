"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING BOTTOM SHEET - Native App-Like Modal                          ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  iOS/Android-style bottom sheet with:                                        ║
 * ║  • Swipe to dismiss                                                          ║
 * ║  • Snap points (partial/full)                                                ║
 * ║  • Safe area support                                                         ║
 * ║  • Smooth spring animations                                                   ║
 * ║  • Backdrop blur                                                              ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useDragControls,
  PanInfo,
} from "framer-motion";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";

// ============================================================================
// 🎯 TYPES
// ============================================================================

type SnapPoint = "partial" | "full" | "closed";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  snapPoints?: ("partial" | "full")[];
  initialSnap?: "partial" | "full";
  showHandle?: boolean;
  showHeader?: boolean;
  headerAction?: React.ReactNode;
  className?: string;
  /** Height in vh for partial snap (default: 50) */
  partialHeight?: number;
  /** Whether to close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Whether to allow swipe to close */
  swipeToClose?: boolean;
}

// ============================================================================
// 🎮 MAIN COMPONENT
// ============================================================================

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  snapPoints = ["partial", "full"],
  initialSnap = "partial",
  showHandle = true,
  showHeader = true,
  headerAction,
  className,
  partialHeight = 50,
  closeOnBackdrop = true,
  swipeToClose = true,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState<SnapPoint>(initialSnap);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Calculate heights
  const snapHeights: Record<SnapPoint, string> = {
    closed: "0vh",
    partial: `${partialHeight}vh`,
    full: "95vh",
  };

  // Handle drag end
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const velocity = info.velocity.y;
      const offset = info.offset.y;

      // Fast swipe down - close
      if (velocity > 500 && swipeToClose) {
        onClose();
        return;
      }

      // Fast swipe up - go to full
      if (velocity < -500 && snapPoints.includes("full")) {
        setCurrentSnap("full");
        return;
      }

      // Slow drag - snap based on position
      if (currentSnap === "full") {
        if (offset > 100) {
          if (snapPoints.includes("partial")) {
            setCurrentSnap("partial");
          } else if (swipeToClose) {
            onClose();
          }
        }
      } else if (currentSnap === "partial") {
        if (offset > 80 && swipeToClose) {
          onClose();
        } else if (offset < -80 && snapPoints.includes("full")) {
          setCurrentSnap("full");
        }
      }
    },
    [currentSnap, snapPoints, swipeToClose, onClose],
  );

  // Toggle between snap points
  const toggleSnap = useCallback(() => {
    if (currentSnap === "partial" && snapPoints.includes("full")) {
      setCurrentSnap("full");
    } else if (currentSnap === "full" && snapPoints.includes("partial")) {
      setCurrentSnap("partial");
    }
  }, [currentSnap, snapPoints]);

  // Reset snap when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(initialSnap);
    }
  }, [isOpen, initialSnap]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "bg-white dark:bg-[#0a0a0a]",
              "rounded-t-3xl shadow-2xl",
              "flex flex-col overflow-hidden",
              // Safe area
              "pb-[env(safe-area-inset-bottom)]",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              height: snapHeights[currentSnap],
            }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
                onDoubleClick={toggleSnap}
              >
                <div className="w-10 h-1.5 bg-[#34445C]/20 dark:bg-[#F5F0E1]/20 rounded-full" />
              </div>
            )}

            {/* Header */}
            {showHeader && (title || headerAction) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">
                      {subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {headerAction}
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center",
                      "rounded-full bg-[#34445C]/10 dark:bg-[#F5F0E1]/10",
                      "active:bg-[#34445C]/20 dark:active:bg-[#F5F0E1]/20",
                      "transition-colors",
                    )}
                    aria-label="Close"
                  >
                    <Icon
                      icon="solar:close-circle-linear"
                      className="w-5 h-5 text-[#34445C]/70 dark:text-[#F5F0E1]/70"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// 🎮 BOTTOM SHEET TRIGGER (for menu/options)
// ============================================================================

interface BottomSheetOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  color?: "default" | "danger" | "success" | "warning" | "primary";
  disabled?: boolean;
  onClick: () => void;
}

interface BottomSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: BottomSheetOption[];
  className?: string;
}

export function BottomSheetMenu({
  isOpen,
  onClose,
  title,
  options,
  className,
}: BottomSheetMenuProps) {
  const colorStyles = {
    default: "text-[#34445C] dark:text-[#F5F0E1]",
    danger: "text-red-500",
    success: "text-green-500",
    warning: "text-amber-500",
    primary: "text-[#FF4654] dark:text-[#DCFF37]",
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={["partial"]}
      partialHeight={Math.min(40 + options.length * 15, 80)}
      className={className}
    >
      <div className="px-4 py-2">
        {options.map((option, _index) => (
          <button
            key={option.id}
            onClick={() => {
              if (!option.disabled) {
                option.onClick();
                onClose();
              }
            }}
            disabled={option.disabled}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4",
              "rounded-xl active:bg-[#34445C]/5 dark:active:bg-[#F5F0E1]/5",
              "transition-colors",
              "border-b border-[#34445C]/5 dark:border-[#F5F0E1]/5 last:border-0",
              option.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {option.icon && (
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center",
                  "rounded-xl bg-[#34445C]/5 dark:bg-[#F5F0E1]/5",
                )}
              >
                <Icon
                  icon={option.icon}
                  className={cn(
                    "w-5 h-5",
                    colorStyles[option.color || "default"],
                  )}
                />
              </div>
            )}
            <div className="flex-1 text-left">
              <p
                className={cn(
                  "font-medium",
                  colorStyles[option.color || "default"],
                )}
              >
                {option.label}
              </p>
              {option.description && (
                <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/50 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
            <Icon
              icon="solar:alt-arrow-right-linear"
              className="w-5 h-5 text-[#34445C]/30 dark:text-[#F5F0E1]/30"
            />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

export default BottomSheet;
