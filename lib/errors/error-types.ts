/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR CLASSIFICATION SYSTEM                                 ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Comprehensive error classification for best-in-class UX:                    ║
 * ║  • Separate technical errors from business rules                             ║
 * ║  • Provide user-friendly messages for each error type                        ║
 * ║  • Enable appropriate handling and recovery actions                          ║
 * ║  • Support internationalization-ready error messages                         ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ============================================================================
// 🎯 ERROR CATEGORIES
// ============================================================================

/**
 * High-level error categories for appropriate UI treatment
 */
export enum ErrorCategory {
  /** Network connectivity issues - show retry option */
  NETWORK = "network",
  /** Server errors (5xx) - show retry with apology */
  SERVER = "server",
  /** Authentication errors - redirect to login */
  AUTH = "auth",
  /** Authorization/permission errors - show upgrade or request access */
  PERMISSION = "permission",
  /** Validation errors - highlight invalid fields */
  VALIDATION = "validation",
  /** Business rule violations (limits, conflicts) - show specific guidance */
  BUSINESS_RULE = "business_rule",
  /** Rate limiting - show cooldown timer */
  RATE_LIMIT = "rate_limit",
  /** Resource not found - offer alternatives */
  NOT_FOUND = "not_found",
  /** Client-side errors - generic handling */
  CLIENT = "client",
  /** Unknown errors - generic fallback */
  UNKNOWN = "unknown",
}

/**
 * Specific error codes for granular handling
 */
export enum ErrorCode {
  // Network errors
  NETWORK_OFFLINE = "NETWORK_OFFLINE",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",

  // Server errors
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE = "MAINTENANCE_MODE",

  // Auth errors
  UNAUTHORIZED = "UNAUTHORIZED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  MFA_REQUIRED = "MFA_REQUIRED",

  // Permission errors
  FORBIDDEN = "FORBIDDEN",
  PLAN_LIMIT_EXCEEDED = "PLAN_LIMIT_EXCEEDED",
  FEATURE_LOCKED = "FEATURE_LOCKED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Business rule errors
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  ALREADY_EXISTS = "ALREADY_EXISTS",

  // Rate limiting
  RATE_LIMITED = "RATE_LIMITED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Not found
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_DELETED = "RESOURCE_DELETED",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// ============================================================================
// 🎯 STRUCTURED ERROR TYPE
// ============================================================================

/**
 * Structured error with full context for proper handling and display
 */
export interface AppError {
  /** Error category for high-level handling */
  category: ErrorCategory;
  /** Specific error code for detailed handling */
  code: ErrorCode;
  /** User-friendly message to display */
  message: string;
  /** Technical details (for logging, not display) */
  technicalMessage?: string;
  /** HTTP status code if applicable */
  httpStatus?: number;
  /** Field-level validation errors */
  fieldErrors?: Record<string, string>;
  /** Retry information for rate limiting */
  retryAfterSeconds?: number;
  /** Related resource information */
  resourceType?: string;
  resourceId?: string;
  /** Original error for debugging */
  originalError?: unknown;
  /** Timestamp */
  timestamp: number;
  /** Request ID for support */
  requestId?: string;

  // Business rule specific
  /** Plan limit info for upgrade prompts */
  planLimitInfo?: {
    operation: string;
    operationName: string;
    currentUsage: number;
    limit: number;
    currentPlan: string;
    recommendedPlan: string;
  };
}

// ============================================================================
// 🎯 USER-FRIENDLY MESSAGES
// ============================================================================

/**
 * Default user-friendly messages for each error code
 */
export const DEFAULT_ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Network
  [ErrorCode.NETWORK_OFFLINE]:
    "You appear to be offline. Please check your internet connection.",
  [ErrorCode.NETWORK_TIMEOUT]: "The request took too long. Please try again.",
  [ErrorCode.NETWORK_ERROR]:
    "Unable to connect to the server. Please try again.",

  // Server
  [ErrorCode.SERVER_ERROR]:
    "Something went wrong on our end. We're working on it!",
  [ErrorCode.SERVICE_UNAVAILABLE]:
    "The service is temporarily unavailable. Please try again in a few moments.",
  [ErrorCode.MAINTENANCE_MODE]:
    "We're currently performing maintenance. Please check back soon!",

  // Auth
  [ErrorCode.UNAUTHORIZED]: "Please sign in to continue.",
  [ErrorCode.SESSION_EXPIRED]:
    "Your session has expired. Please sign in again.",
  [ErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [ErrorCode.MFA_REQUIRED]: "Two-factor authentication is required.",

  // Permission
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.PLAN_LIMIT_EXCEEDED]:
    "You've reached your plan limit. Upgrade to continue.",
  [ErrorCode.FEATURE_LOCKED]: "This feature requires a premium plan.",
  [ErrorCode.INSUFFICIENT_PERMISSIONS]:
    "You don't have the required permissions.",

  // Validation
  [ErrorCode.VALIDATION_ERROR]: "Please check your input and try again.",
  [ErrorCode.INVALID_INPUT]: "The provided data is invalid.",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Please fill in all required fields.",
  [ErrorCode.INVALID_FORMAT]:
    "The format is invalid. Please check and try again.",

  // Business rules
  [ErrorCode.RESOURCE_CONFLICT]:
    "This conflicts with existing data. Please try a different option.",
  [ErrorCode.DUPLICATE_ENTRY]:
    "This already exists. Please try a different name or value.",
  [ErrorCode.OPERATION_NOT_ALLOWED]:
    "This operation is not allowed at this time.",
  [ErrorCode.INSUFFICIENT_BALANCE]:
    "Insufficient balance. Please add funds to continue.",
  [ErrorCode.ALREADY_EXISTS]:
    "This already exists. Would you like to view it instead?",

  // Rate limiting
  [ErrorCode.RATE_LIMITED]: "Slow down! You're making too many requests.",
  [ErrorCode.TOO_MANY_REQUESTS]:
    "Too many attempts. Please wait before trying again.",

  // Not found
  [ErrorCode.NOT_FOUND]: "We couldn't find what you're looking for.",
  [ErrorCode.RESOURCE_DELETED]:
    "This has been deleted and is no longer available.",

  // Unknown
  [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
};

// ============================================================================
// 🎯 RECOVERY ACTIONS
// ============================================================================

/**
 * Available recovery actions for errors
 */
export enum RecoveryAction {
  /** Retry the failed operation */
  RETRY = "retry",
  /** Refresh the page */
  REFRESH = "refresh",
  /** Navigate to sign in */
  SIGN_IN = "sign_in",
  /** Upgrade plan */
  UPGRADE = "upgrade",
  /** Contact support */
  CONTACT_SUPPORT = "contact_support",
  /** Go back */
  GO_BACK = "go_back",
  /** Go home */
  GO_HOME = "go_home",
  /** Dismiss and continue */
  DISMISS = "dismiss",
  /** Fix validation errors */
  FIX_VALIDATION = "fix_validation",
  /** Wait for cooldown */
  WAIT = "wait",
}

/**
 * Recovery action configuration
 */
export interface RecoveryActionConfig {
  action: RecoveryAction;
  label: string;
  icon: string;
  primary?: boolean;
}

/**
 * Get recommended recovery actions for an error
 */
export function getRecoveryActions(error: AppError): RecoveryActionConfig[] {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return [
        {
          action: RecoveryAction.RETRY,
          label: "Try Again",
          icon: "solar:refresh-bold",
          primary: true,
        },
        {
          action: RecoveryAction.DISMISS,
          label: "Dismiss",
          icon: "solar:close-circle-linear",
        },
      ];

    case ErrorCategory.SERVER:
      return [
        {
          action: RecoveryAction.RETRY,
          label: "Try Again",
          icon: "solar:refresh-bold",
          primary: true,
        },
        {
          action: RecoveryAction.CONTACT_SUPPORT,
          label: "Contact Support",
          icon: "solar:help-linear",
        },
      ];

    case ErrorCategory.AUTH:
      if (
        error.code === ErrorCode.SESSION_EXPIRED ||
        error.code === ErrorCode.UNAUTHORIZED
      ) {
        return [
          {
            action: RecoveryAction.SIGN_IN,
            label: "Sign In",
            icon: "solar:login-2-bold",
            primary: true,
          },
        ];
      }
      return [
        {
          action: RecoveryAction.RETRY,
          label: "Try Again",
          icon: "solar:refresh-bold",
          primary: true,
        },
      ];

    case ErrorCategory.PERMISSION:
      if (
        error.code === ErrorCode.PLAN_LIMIT_EXCEEDED ||
        error.code === ErrorCode.FEATURE_LOCKED
      ) {
        return [
          {
            action: RecoveryAction.UPGRADE,
            label: "Upgrade Plan",
            icon: "solar:arrow-up-bold",
            primary: true,
          },
          {
            action: RecoveryAction.DISMISS,
            label: "Maybe Later",
            icon: "solar:close-circle-linear",
          },
        ];
      }
      return [
        {
          action: RecoveryAction.GO_BACK,
          label: "Go Back",
          icon: "solar:arrow-left-linear",
          primary: true,
        },
        {
          action: RecoveryAction.CONTACT_SUPPORT,
          label: "Request Access",
          icon: "solar:help-linear",
        },
      ];

    case ErrorCategory.VALIDATION:
      return [
        {
          action: RecoveryAction.FIX_VALIDATION,
          label: "Fix Errors",
          icon: "solar:pen-bold",
          primary: true,
        },
      ];

    case ErrorCategory.BUSINESS_RULE:
      if (
        error.code === ErrorCode.ALREADY_EXISTS ||
        error.code === ErrorCode.DUPLICATE_ENTRY
      ) {
        return [
          {
            action: RecoveryAction.GO_BACK,
            label: "Try Different",
            icon: "solar:arrow-left-linear",
            primary: true,
          },
        ];
      }
      return [
        {
          action: RecoveryAction.DISMISS,
          label: "Okay",
          icon: "solar:check-circle-linear",
          primary: true,
        },
      ];

    case ErrorCategory.RATE_LIMIT:
      return [
        {
          action: RecoveryAction.WAIT,
          label: `Wait ${error.retryAfterSeconds || 60}s`,
          icon: "solar:clock-circle-linear",
          primary: true,
        },
      ];

    case ErrorCategory.NOT_FOUND:
      return [
        {
          action: RecoveryAction.GO_BACK,
          label: "Go Back",
          icon: "solar:arrow-left-linear",
          primary: true,
        },
        {
          action: RecoveryAction.GO_HOME,
          label: "Go Home",
          icon: "solar:home-2-linear",
        },
      ];

    default:
      return [
        {
          action: RecoveryAction.RETRY,
          label: "Try Again",
          icon: "solar:refresh-bold",
          primary: true,
        },
        {
          action: RecoveryAction.DISMISS,
          label: "Dismiss",
          icon: "solar:close-circle-linear",
        },
      ];
  }
}

// ============================================================================
// 🎯 ERROR SEVERITY
// ============================================================================

/**
 * Error severity levels for UI treatment
 */
export enum ErrorSeverity {
  /** Info - just informational, not really an error */
  INFO = "info",
  /** Warning - something might be wrong but operation may proceed */
  WARNING = "warning",
  /** Error - operation failed, user action needed */
  ERROR = "error",
  /** Critical - major issue, immediate attention needed */
  CRITICAL = "critical",
}

/**
 * Get severity level for an error
 */
export function getErrorSeverity(error: AppError): ErrorSeverity {
  switch (error.category) {
    case ErrorCategory.SERVER:
    case ErrorCategory.UNKNOWN:
      return ErrorSeverity.CRITICAL;

    case ErrorCategory.AUTH:
    case ErrorCategory.PERMISSION:
      return ErrorSeverity.ERROR;

    case ErrorCategory.VALIDATION:
    case ErrorCategory.BUSINESS_RULE:
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.WARNING;

    case ErrorCategory.RATE_LIMIT:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.INFO;

    default:
      return ErrorSeverity.ERROR;
  }
}
