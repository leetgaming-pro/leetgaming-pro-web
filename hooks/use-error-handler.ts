"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - UNIFIED ERROR HANDLING HOOK                                 ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Simplified hook that combines all error handling capabilities:              ║
 * ║  • Automatic classification (network, auth, validation, business, etc.)      ║
 * ║  • Plan limit detection with upgrade modal                                   ║
 * ║  • Branded toast and modal notifications                                     ║
 * ║  • Success notifications                                                     ║
 * ║  • Retry support                                                             ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback } from "react";
import { useAppError } from "@/contexts/error-context";
import { usePlanLimit } from "@/contexts/plan-limit-context";
import {
  parseError,
  isPlanLimitError,
  isAuthError,
  isValidationError,
} from "@/lib/errors/error-parser";
import { AppError, ErrorCategory } from "@/lib/errors/error-types";

interface UseErrorHandlerOptions {
  /** Context for logging (e.g., "ProfileForm.handleSubmit") */
  context?: string;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Show errors silently (log only, no UI) */
  silent?: boolean;
  /** Force modal display for all errors */
  forceModal?: boolean;
}

interface ErrorHandlerResult {
  /** The parsed AppError */
  error: AppError;
  /** Whether this was a plan limit error (modal shown automatically) */
  wasPlanLimit: boolean;
  /** Whether this was an auth error (redirect may be needed) */
  wasAuth: boolean;
  /** Whether this was a validation error (field errors may be available) */
  wasValidation: boolean;
  /** Field-level errors if this was a validation error */
  fieldErrors?: Record<string, string>;
}

/**
 * Unified error handling hook for LeetGaming
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleError, showSuccess } = useErrorHandler();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await api.createSomething(data);
 *       showSuccess("Created successfully!");
 *     } catch (error) {
 *       const result = handleError(error, {
 *         context: "MyComponent.handleSubmit",
 *         onRetry: handleSubmit,
 *       });
 *
 *       if (result.wasValidation && result.fieldErrors) {
 *         setFieldErrors(result.fieldErrors);
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function useErrorHandler() {
  const {
    handleError: handleAppError,
    showSuccess,
    showToast,
    clearErrors,
  } = useAppError();
  const { handleApiError: handlePlanLimitError } = usePlanLimit();

  /**
   * Handle any error with automatic classification and UI treatment
   */
  const handleError = useCallback(
    (
      error: unknown,
      options: UseErrorHandlerOptions = {},
    ): ErrorHandlerResult => {
      const appError = parseError(error);

      // Check for plan limit errors first - they have specialized handling
      const wasPlanLimit = isPlanLimitError(error);
      if (wasPlanLimit) {
        handlePlanLimitError(error);
        return {
          error: appError,
          wasPlanLimit: true,
          wasAuth: false,
          wasValidation: false,
          fieldErrors: undefined,
        };
      }

      // Handle other errors through unified handler
      if (!options.silent) {
        handleAppError(error, {
          context: options.context,
          onRetry: options.onRetry,
          onDismiss: options.onDismiss,
          showAsModal:
            options.forceModal || appError.category === ErrorCategory.AUTH,
        });
      }

      return {
        error: appError,
        wasPlanLimit: false,
        wasAuth: isAuthError(error),
        wasValidation: isValidationError(error),
        fieldErrors: appError.fieldErrors,
      };
    },
    [handleAppError, handlePlanLimitError],
  );

  /**
   * Wrap an async function with automatic error handling
   *
   * @example
   * ```tsx
   * const safeFetch = wrapWithErrorHandler(
   *   async () => await api.fetchData(),
   *   { context: "DataFetcher" }
   * );
   * const result = await safeFetch();
   * if (result.success) {
   *   setData(result.data);
   * }
   * ```
   */
  const wrapWithErrorHandler = useCallback(
    <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      options: UseErrorHandlerOptions = {},
    ) => {
      return async (
        ...args: T
      ): Promise<{
        success: boolean;
        data?: R;
        error?: ErrorHandlerResult;
      }> => {
        try {
          const data = await fn(...args);
          return { success: true, data };
        } catch (error) {
          const result = handleError(error, options);
          return { success: false, error: result };
        }
      };
    },
    [handleError],
  );

  /**
   * Execute an async function with automatic error handling and success notification
   *
   * @example
   * ```tsx
   * const saved = await executeWithFeedback(
   *   async () => await api.saveData(data),
   *   {
   *     successMessage: "Data saved!",
   *     context: "SaveButton",
   *     onRetry: () => handleSave(),
   *   }
   * );
   * ```
   */
  const executeWithFeedback = useCallback(
    async <R>(
      fn: () => Promise<R>,
      options: UseErrorHandlerOptions & { successMessage?: string } = {},
    ): Promise<{ success: boolean; data?: R; error?: ErrorHandlerResult }> => {
      try {
        const data = await fn();
        if (options.successMessage) {
          showSuccess(options.successMessage);
        }
        return { success: true, data };
      } catch (error) {
        const result = handleError(error, options);
        return { success: false, error: result };
      }
    },
    [handleError, showSuccess],
  );

  return {
    /** Handle any error with automatic classification and UI */
    handleError,
    /** Wrap async function with error handling */
    wrapWithErrorHandler,
    /** Execute with success/error feedback */
    executeWithFeedback,
    /** Show success notification */
    showSuccess,
    /** Show custom toast */
    showToast,
    /** Clear all displayed errors */
    clearErrors,
    /** Parse error without displaying UI */
    parseError,
  };
}

export default useErrorHandler;
