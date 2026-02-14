/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR HANDLING LIBRARY                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// Types and enums
export {
  ErrorCategory,
  ErrorCode,
  ErrorSeverity,
  RecoveryAction,
  DEFAULT_ERROR_MESSAGES,
  getRecoveryActions,
  getErrorSeverity,
} from "./error-types";
export type { AppError, RecoveryActionConfig } from "./error-types";

// Parser utilities
export {
  parseError,
  isPlanLimitError,
  isAuthError,
  isRetryableError,
  isValidationError,
  isBusinessRuleError,
  isErrorCategory,
  getFieldErrors,
  isAlreadyExistsError,
} from "./error-parser";

// Note: ErrorProvider and useAppError should be imported directly from
// "@/contexts/error-context" to avoid circular dependency issues
