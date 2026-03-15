"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - PLAN LIMIT CONTEXT                                          ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Global context for handling plan limit errors across the application:       ║
 * ║  • Automatic error detection from API responses                              ║
 * ║  • Show upgrade modal from anywhere in the app                               ║
 * ║  • Track which operations are at limit                                       ║
 * ║  • Provide helpful hooks for components                                      ║
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
import {
  PlanLimitModal,
  PlanLimitError,
  parsePlanLimitError,
} from "@/components/subscription/plan-limit-modal";

// ============================================================================
// 🎯 TYPES
// ============================================================================

interface PlanLimitContextType {
  /** The current plan limit error being displayed, if any */
  currentError: PlanLimitError | null;

  /** Whether the plan limit modal is currently open */
  isModalOpen: boolean;

  /** Handle an API error - automatically detects if it's a plan limit error */
  handleApiError: (error: unknown) => boolean;

  /** Directly show the plan limit modal with a specific error */
  showPlanLimitError: (error: PlanLimitError) => void;

  /** Close the plan limit modal */
  closePlanLimitModal: () => void;

  /** Check if a string contains a plan limit error */
  checkForPlanLimitError: (errorMessage: string) => PlanLimitError | null;

  /** Navigate to upgrade for a specific operation */
  triggerUpgrade: (operation?: string) => void;
}

const PlanLimitContext = createContext<PlanLimitContextType | undefined>(
  undefined,
);

// ============================================================================
// 🎯 PROVIDER
// ============================================================================

interface PlanLimitProviderProps {
  children: ReactNode;
  /** Optional callback when user chooses to upgrade */
  onUpgrade?: (planId?: string, operation?: string) => void;
}

export function PlanLimitProvider({
  children,
  onUpgrade,
}: PlanLimitProviderProps) {
  const [currentError, setCurrentError] = useState<PlanLimitError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Check if a string contains a plan limit error and parse it
   */
  const checkForPlanLimitError = useCallback(
    (errorMessage: string): PlanLimitError | null => {
      return parsePlanLimitError(errorMessage);
    },
    [],
  );

  /**
   * Handle an API error - returns true if it was a plan limit error
   */
  const handleApiError = useCallback((error: unknown): boolean => {
    if (!error) return false;

    let errorMessage = "";

    // Check for PLAN_LIMIT_EXCEEDED error code from API
    const apiError = (error as { apiError?: { code?: string; message?: string } })?.apiError;
    if (apiError?.code === "PLAN_LIMIT_EXCEEDED") {
      const planError: PlanLimitError = {
        operation: "unknown",
        operationName: "Operation",
        limit: 0,
        currentPlan: "Free Tier",
        currentPlanTier: "free",
        recommendedPlan: "pro",
        rawMessage: apiError.message || errorMessage,
      };
      setCurrentError(planError);
      setIsModalOpen(true);
      return true;
    }

    // Handle different error formats
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object") {
      // Handle API response errors
      const err = error as {
        message?: string;
        error?: string;
        data?: { message?: string; error?: string };
        response?: { data?: { message?: string; error?: string } };
      };
      errorMessage =
        err.message ||
        err.error ||
        err.data?.message ||
        err.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        JSON.stringify(error);
    }

    // Check if it's a plan limit error by message pattern
    const planError = parsePlanLimitError(errorMessage);

    if (planError) {
      setCurrentError(planError);
      setIsModalOpen(true);
      return true;
    }

    return false;
  }, []);

  /**
   * Show the plan limit modal with a specific error
   */
  const showPlanLimitError = useCallback((error: PlanLimitError) => {
    setCurrentError(error);
    setIsModalOpen(true);
  }, []);

  /**
   * Close the plan limit modal
   */
  const closePlanLimitModal = useCallback(() => {
    setIsModalOpen(false);
    // Clear error after animation completes
    setTimeout(() => {
      setCurrentError(null);
    }, 300);
  }, []);

  /**
   * Trigger an upgrade flow for a specific operation
   */
  const triggerUpgrade = useCallback(
    (operation?: string) => {
      if (onUpgrade) {
        onUpgrade(
          currentError?.recommendedPlan,
          operation || currentError?.operation,
        );
      }
    },
    [onUpgrade, currentError],
  );

  const handleUpgrade = useCallback(
    (planId?: string) => {
      if (onUpgrade) {
        onUpgrade(planId, currentError?.operation);
      }
    },
    [onUpgrade, currentError],
  );

  const value: PlanLimitContextType = {
    currentError,
    isModalOpen,
    handleApiError,
    showPlanLimitError,
    closePlanLimitModal,
    checkForPlanLimitError,
    triggerUpgrade,
  };

  return (
    <PlanLimitContext.Provider value={value}>
      {children}
      <PlanLimitModal
        isOpen={isModalOpen}
        onClose={closePlanLimitModal}
        error={currentError}
        onUpgrade={handleUpgrade}
      />
    </PlanLimitContext.Provider>
  );
}

// ============================================================================
// 🎣 HOOK
// ============================================================================

/**
 * Hook to access plan limit error handling from any component
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleApiError } = usePlanLimit();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await api.createProfile(data);
 *     } catch (error) {
 *       // Will automatically show upgrade modal if it's a plan limit error
 *       if (!handleApiError(error)) {
 *         // Handle other errors
 *         toast.error("Something went wrong");
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function usePlanLimit() {
  const context = useContext(PlanLimitContext);

  if (context === undefined) {
    throw new Error("usePlanLimit must be used within a PlanLimitProvider");
  }

  return context;
}

// ============================================================================
// 🛠️ UTILITY HOOKS
// ============================================================================

/**
 * Hook that wraps an async function with plan limit error handling
 *
 * @example
 * ```tsx
 * function CreateProfileButton() {
 *   const wrappedCreate = usePlanLimitWrapper(async (data) => {
 *     return await api.createProfile(data);
 *   });
 *
 *   const handleClick = async () => {
 *     const result = await wrappedCreate({ name: "John" });
 *     if (result.success) {
 *       // Profile created successfully
 *     } else if (!result.wasPlanLimitError) {
 *       // Handle other errors
 *     }
 *     // If wasPlanLimitError is true, modal is already shown
 *   };
 * }
 * ```
 */
export function usePlanLimitWrapper<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
): (
  ...args: T
) => Promise<{
  success: boolean;
  data?: R;
  error?: unknown;
  wasPlanLimitError: boolean;
}> {
  const { handleApiError } = usePlanLimit();

  return useCallback(
    async (...args: T) => {
      try {
        const data = await fn(...args);
        return { success: true, data, wasPlanLimitError: false };
      } catch (error) {
        const wasPlanLimitError = handleApiError(error);
        return { success: false, error, wasPlanLimitError };
      }
    },
    [fn, handleApiError],
  );
}

/**
 * Hook to check if user is near their plan limit for an operation
 * (This would integrate with a usage tracking API endpoint)
 */
export function useOperationUsage(_operation: string) {
  // TODO: Implement when we have a usage tracking API
  return {
    currentUsage: 0,
    limit: 0,
    percentUsed: 0,
    isAtLimit: false,
    isNearLimit: false, // e.g., > 80%
  };
}

export default PlanLimitProvider;
