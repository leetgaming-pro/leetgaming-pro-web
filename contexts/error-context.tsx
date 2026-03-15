"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR HANDLING CONTEXT                                      ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Global error handling with award-winning UX:                                ║
 * ║  • Automatic error classification and appropriate UI treatment               ║
 * ║  • Branded toast notifications for transient errors                          ║
 * ║  • Modal dialogs for actionable errors (auth, plan limits)                   ║
 * ║  • Inline error displays for validation errors                               ║
 * ║  • Consistent recovery actions across the platform                           ║
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
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button, cn } from "@nextui-org/react";
import {
  AppError,
  ErrorCategory,
  ErrorCode,
  ErrorSeverity,
  RecoveryAction,
  getRecoveryActions,
  getErrorSeverity,
  RecoveryActionConfig,
} from "@/lib/errors/error-types";
import { parseError, isPlanLimitError } from "@/lib/errors/error-parser";
// Note: We don't import usePlanLimit here to avoid circular dependency.
// Plan limit errors are detected and the caller can handle them via isPlanLimitError.

// ============================================================================
// 🎯 CONTEXT TYPES
// ============================================================================

interface ErrorContextType {
  /** Handle any error with automatic classification and UI treatment */
  handleError: (error: unknown, options?: ErrorHandleOptions) => AppError;

  /** Show a specific error (for custom error creation) */
  showError: (error: AppError, options?: ErrorDisplayOptions) => void;

  /** Clear all displayed errors */
  clearErrors: () => void;

  /** Current displayed errors */
  currentErrors: AppError[];

  /** Show a simple toast notification */
  showToast: (
    message: string,
    type?: "info" | "success" | "warning" | "error",
  ) => void;

  /** Show success message */
  showSuccess: (message: string) => void;

  /** Check if an error needs special handling (returns false if handled automatically) */
  checkAndHandleError: (error: unknown) => boolean;
}

interface ErrorHandleOptions {
  /** Override automatic display behavior */
  silent?: boolean;
  /** Context for logging */
  context?: string;
  /** Callback on retry action */
  onRetry?: () => void;
  /** Callback on dismiss */
  onDismiss?: () => void;
  /** Show as modal instead of toast */
  showAsModal?: boolean;
}

interface ErrorDisplayOptions {
  /** How to display the error */
  display?: "toast" | "modal" | "inline";
  /** Duration for toast (0 for sticky) */
  duration?: number;
  /** Custom recovery actions */
  actions?: RecoveryActionConfig[];
  /** Callback on retry */
  onRetry?: () => void;
  /** Callback on dismiss */
  onDismiss?: () => void;
}

// ============================================================================
// 🎯 TOAST TYPES AND STYLING
// ============================================================================

interface DisplayedError extends AppError {
  displayId: string;
  display: "toast" | "modal";
  onRetry?: () => void;
  onDismiss?: () => void;
  customActions?: RecoveryActionConfig[];
}

const severityConfig: Record<
  ErrorSeverity,
  { icon: string; bgClass: string; textClass: string; borderClass: string }
> = {
  [ErrorSeverity.INFO]: {
    icon: "solar:info-circle-bold",
    bgClass: "bg-[#34445C]/10 dark:bg-[#DCFF37]/10",
    textClass: "text-[#34445C] dark:text-[#DCFF37]",
    borderClass: "border-[#34445C]/30 dark:border-[#DCFF37]/30",
  },
  [ErrorSeverity.WARNING]: {
    icon: "solar:danger-triangle-bold",
    bgClass: "bg-[#FFC700]/10",
    textClass: "text-[#FFC700]",
    borderClass: "border-[#FFC700]/30",
  },
  [ErrorSeverity.ERROR]: {
    icon: "solar:close-circle-bold",
    bgClass: "bg-[#FF4654]/10",
    textClass: "text-[#FF4654]",
    borderClass: "border-[#FF4654]/30",
  },
  [ErrorSeverity.CRITICAL]: {
    icon: "solar:shield-warning-bold",
    bgClass: "bg-[#FF4654]/20",
    textClass: "text-[#FF4654]",
    borderClass: "border-[#FF4654]/50",
  },
};

// ============================================================================
// 🎯 CONTEXT PROVIDER
// ============================================================================

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  /** Optional handler for plan limit errors - injected from parent to avoid circular deps */
  onPlanLimitError?: (error: unknown) => void;
}

export function ErrorProvider({
  children,
  onPlanLimitError,
}: ErrorProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status: sessionStatus } = useSession();
  const [displayedErrors, setDisplayedErrors] = useState<DisplayedError[]>([]);

  /**
   * Remove an error from display
   */
  const removeError = useCallback((displayId: string) => {
    setDisplayedErrors((prev) => prev.filter((e) => e.displayId !== displayId));
  }, []);

  /**
   * Execute a recovery action
   */
  const executeRecoveryAction = useCallback(
    (action: RecoveryAction, error: DisplayedError) => {
      switch (action) {
        case RecoveryAction.RETRY:
          error.onRetry?.();
          break;
        case RecoveryAction.SIGN_IN: {
          const callbackParam = pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : '';
          router.push(`/signin${callbackParam}`);
          break;
        }
        case RecoveryAction.UPGRADE:
          router.push(
            `/pricing?operation=${error.planLimitInfo?.operation || ""}`,
          );
          break;
        case RecoveryAction.GO_BACK:
          router.back();
          break;
        case RecoveryAction.GO_HOME:
          router.push("/");
          break;
        case RecoveryAction.CONTACT_SUPPORT:
          router.push("/support");
          break;
        case RecoveryAction.REFRESH:
          window.location.reload();
          break;
        case RecoveryAction.DISMISS:
        case RecoveryAction.FIX_VALIDATION:
        case RecoveryAction.WAIT:
          // Just dismiss
          break;
      }
      removeError(error.displayId);
      error.onDismiss?.();
    },
    [router, removeError, pathname],
  );

  /**
   * Show error in UI
   */
  const showError = useCallback(
    (error: AppError, options: ErrorDisplayOptions = {}) => {
      const displayId = `error-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      // Filter out 'inline' display type - we only support toast and modal
      const display: "toast" | "modal" =
        options.display === "modal" ? "modal" : "toast";

      const displayedError: DisplayedError = {
        ...error,
        displayId,
        display,
        onRetry: options.onRetry,
        onDismiss: options.onDismiss,
        customActions: options.actions,
      };

      setDisplayedErrors((prev) => [...prev, displayedError]);

      // Auto-dismiss toasts
      if (display === "toast" && options.duration !== 0) {
        const duration = options.duration || 6000;
        setTimeout(() => removeError(displayId), duration);
      }
    },
    [removeError],
  );

  /**
   * Main error handler
   */
  const handleError = useCallback(
    (error: unknown, options: ErrorHandleOptions = {}): AppError => {
      const appError = parseError(error);

      // Log error with full details for debugging
      console.error(`[ErrorHandler] ${options.context || "Error"}:`, {
        category: appError.category,
        code: appError.code,
        message: appError.message,
        technical: appError.technicalMessage,
      });

      if (options.silent) {
        return appError;
      }

      // Check for plan limit errors - delegate to specialized handler if available
      if (isPlanLimitError(error) && onPlanLimitError) {
        onPlanLimitError(error);
        return appError;
      }

      // Determine display type based on error category
      let display: "toast" | "modal" = "toast";
      if (options.showAsModal) {
        display = "modal";
      } else if (appError.category === ErrorCategory.AUTH) {
        // If user has an active session, a 401 is likely a transient RID issue.
        // Show a toast instead of a sign-in modal to avoid login loops.
        if (sessionStatus === "authenticated") {
          display = "toast";
        } else {
          display = "modal";
        }
      }

      showError(appError, {
        display,
        onRetry: options.onRetry,
        onDismiss: options.onDismiss,
      });

      return appError;
    },
    [showError, onPlanLimitError, sessionStatus],
  );

  /**
   * Check and handle error automatically
   * Returns true if error was handled (caller should not show additional UI)
   */
  const checkAndHandleError = useCallback(
    (error: unknown): boolean => {
      if (!error) return false;

      // Plan limit errors are handled by specialized modal if handler is available
      if (isPlanLimitError(error) && onPlanLimitError) {
        onPlanLimitError(error);
        return true;
      }

      const appError = parseError(error);

      // Auth errors should redirect
      if (appError.category === ErrorCategory.AUTH) {
        handleError(error, { showAsModal: true });
        return true;
      }

      return false;
    },
    [handleError, onPlanLimitError],
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setDisplayedErrors([]);
  }, []);

  /**
   * Simple toast helper
   */
  const showToast = useCallback(
    (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info",
    ) => {
      const categoryMap: Record<string, ErrorCategory> = {
        info: ErrorCategory.UNKNOWN,
        success: ErrorCategory.UNKNOWN,
        warning: ErrorCategory.VALIDATION,
        error: ErrorCategory.CLIENT,
      };
      const codeMap: Record<string, ErrorCode> = {
        info: ErrorCode.UNKNOWN_ERROR,
        success: ErrorCode.UNKNOWN_ERROR,
        warning: ErrorCode.VALIDATION_ERROR,
        error: ErrorCode.UNKNOWN_ERROR,
      };

      const appError: AppError = {
        category: categoryMap[type],
        code: codeMap[type],
        message,
        timestamp: Date.now(),
      };

      showError(appError, { display: "toast", duration: 5000 });
    },
    [showError],
  );

  /**
   * Success toast helper
   */
  const showSuccess = useCallback(
    (message: string) => {
      const displayId = `success-${Date.now()}`;
      setDisplayedErrors((prev) => [
        ...prev,
        {
          displayId,
          display: "toast",
          category: ErrorCategory.UNKNOWN,
          code: ErrorCode.UNKNOWN_ERROR,
          message,
          timestamp: Date.now(),
          _isSuccess: true,
        } as DisplayedError & { _isSuccess: boolean },
      ]);
      setTimeout(() => removeError(displayId), 4000);
    },
    [removeError],
  );

  const value: ErrorContextType = {
    handleError,
    showError,
    clearErrors,
    currentErrors: displayedErrors,
    showToast,
    showSuccess,
    checkAndHandleError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {displayedErrors
            .filter((e) => e.display === "toast")
            .map((error) => {
              const isSuccess = (
                error as DisplayedError & { _isSuccess?: boolean }
              )._isSuccess;
              const severity = isSuccess
                ? ErrorSeverity.INFO
                : getErrorSeverity(error);
              const config = isSuccess
                ? {
                    icon: "solar:check-circle-bold",
                    bgClass: "bg-[#17C964]/10",
                    textClass: "text-[#17C964]",
                    borderClass: "border-[#17C964]/30",
                  }
                : severityConfig[severity];
              const actions = error.customActions || getRecoveryActions(error);

              return (
                <motion.div
                  key={error.displayId}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={cn(
                    "pointer-events-auto p-4 backdrop-blur-md shadow-lg border",
                    config.bgClass,
                    config.borderClass,
                    "bg-[#F5F0E1]/90 dark:bg-[#0a0a0a]/90",
                  )}
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      icon={config.icon}
                      className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        config.textClass,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn("text-sm font-medium", config.textClass)}
                      >
                        {error.message}
                      </p>
                      {!isSuccess && actions.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {actions.slice(0, 2).map((action) => (
                            <button
                              key={action.action}
                              onClick={() =>
                                executeRecoveryAction(action.action, error)
                              }
                              className={cn(
                                "text-xs font-medium px-2 py-1 transition-colors",
                                action.primary
                                  ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C]"
                                  : "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10 text-[#34445C] dark:text-[#F5F0E1] hover:bg-[#34445C]/20",
                              )}
                              style={{
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%)",
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        removeError(error.displayId);
                        error.onDismiss?.();
                      }}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Icon
                        icon="solar:close-circle-linear"
                        className="w-5 h-5 text-[#34445C]/50 dark:text-[#F5F0E1]/50"
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Modal for critical errors */}
      <AnimatePresence>
        {displayedErrors
          .filter((e) => e.display === "modal")
          .map((error) => {
            const severity = getErrorSeverity(error);
            const config = severityConfig[severity];
            const actions = error.customActions || getRecoveryActions(error);

            return (
              <motion.div
                key={error.displayId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className={cn(
                    "relative max-w-md w-full p-6",
                    "bg-[#F5F0E1] dark:bg-[#0a0a0a]",
                    "border-2",
                    config.borderClass,
                  )}
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                  }}
                >
                  {/* Accent line */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      severity === ErrorSeverity.CRITICAL ||
                        severity === ErrorSeverity.ERROR
                        ? "bg-[#FF4654]"
                        : "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                    )}
                  />

                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 flex items-center justify-center",
                        config.bgClass,
                      )}
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                      }}
                    >
                      <Icon
                        icon={config.icon}
                        className={cn("w-6 h-6", config.textClass)}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {error.category === ErrorCategory.AUTH
                          ? "Authentication Required"
                          : "Something Went Wrong"}
                      </h3>
                      <p className="mt-1 text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                        {error.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 justify-end">
                    {actions.map((action) => (
                      <Button
                        key={action.action}
                        onPress={() =>
                          executeRecoveryAction(action.action, error)
                        }
                        startContent={<Icon icon={action.icon} width={18} />}
                        className={cn(
                          "rounded-none font-medium",
                          action.primary
                            ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C]"
                            : "bg-[#34445C]/10 dark:bg-[#F5F0E1]/10 text-[#34445C] dark:text-[#F5F0E1]",
                        )}
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </ErrorContext.Provider>
  );
}

// ============================================================================
// 🎣 HOOK
// ============================================================================

/**
 * Hook to access error handling from any component
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleError, showSuccess } = useAppError();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await api.createSomething(data);
 *       showSuccess("Created successfully!");
 *     } catch (error) {
 *       // Automatically classifies and shows appropriate UI
 *       handleError(error, {
 *         context: "MyComponent.handleSubmit",
 *         onRetry: handleSubmit,
 *       });
 *     }
 *   };
 * }
 * ```
 */
export function useAppError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useAppError must be used within an ErrorProvider");
  }
  return context;
}

export default ErrorProvider;
