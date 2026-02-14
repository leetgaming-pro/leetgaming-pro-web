/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - ERROR PARSER                                                ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Parses and classifies errors from various sources into AppError format:     ║
 * ║  • API responses (JSON with success/error fields)                            ║
 * ║  • Network errors (fetch failures)                                           ║
 * ║  • Thrown exceptions (Error instances)                                       ║
 * ║  • String error messages                                                     ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  AppError,
  ErrorCategory,
  ErrorCode,
  DEFAULT_ERROR_MESSAGES,
} from "./error-types";

// ============================================================================
// 🎯 ERROR PATTERNS
// ============================================================================

/**
 * Patterns for detecting plan limit errors
 */
const PLAN_LIMIT_PATTERN =
  /amount (\d+\.?\d*) exceeds the limit (\d+\.?\d*) for the current plan (.+?) on operation (\w+)/i;

/**
 * Pattern for detecting "already exists" errors with field names
 * Format: "PlayerProfile with Nickname <value> already exists" or "PlayerProfile with SlugURI <value> already exists"
 */
const ALREADY_EXISTS_PATTERN =
  /(\w+) with (\w+(?:\s+or\s+\w+)?)\s+(.+?)\s+already exists/i;

/**
 * Patterns for detecting specific error types from messages
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  category: ErrorCategory;
  code: ErrorCode;
  message?: string;
}> = [
  // Plan limits
  {
    pattern: PLAN_LIMIT_PATTERN,
    category: ErrorCategory.PERMISSION,
    code: ErrorCode.PLAN_LIMIT_EXCEEDED,
  },

  // Authentication
  {
    pattern: /session.*expired|token.*expired/i,
    category: ErrorCategory.AUTH,
    code: ErrorCode.SESSION_EXPIRED,
  },
  {
    pattern:
      /unauthorized|not authenticated|authentication required|sign in|login required/i,
    category: ErrorCategory.AUTH,
    code: ErrorCode.UNAUTHORIZED,
  },
  {
    pattern: /invalid.*credentials|wrong.*password/i,
    category: ErrorCategory.AUTH,
    code: ErrorCode.INVALID_CREDENTIALS,
  },
  {
    pattern: /mfa.*required|2fa.*required|two.?factor/i,
    category: ErrorCategory.AUTH,
    code: ErrorCode.MFA_REQUIRED,
  },

  // Permission
  {
    pattern: /forbidden|access.*denied|not.*allowed/i,
    category: ErrorCategory.PERMISSION,
    code: ErrorCode.FORBIDDEN,
  },
  {
    pattern: /permission.*denied|insufficient.*permission/i,
    category: ErrorCategory.PERMISSION,
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
  },

  // Business rules
  {
    pattern: /already exists|duplicate/i,
    category: ErrorCategory.BUSINESS_RULE,
    code: ErrorCode.ALREADY_EXISTS,
  },
  {
    pattern: /conflict/i,
    category: ErrorCategory.BUSINESS_RULE,
    code: ErrorCode.RESOURCE_CONFLICT,
  },
  {
    pattern: /insufficient.*balance|not enough.*funds/i,
    category: ErrorCategory.BUSINESS_RULE,
    code: ErrorCode.INSUFFICIENT_BALANCE,
  },

  // Rate limiting
  {
    pattern: /rate.*limit|too many requests|slow down/i,
    category: ErrorCategory.RATE_LIMIT,
    code: ErrorCode.RATE_LIMITED,
  },

  // Not found
  {
    pattern: /not found|does not exist|404/i,
    category: ErrorCategory.NOT_FOUND,
    code: ErrorCode.NOT_FOUND,
  },
  {
    pattern: /deleted|removed/i,
    category: ErrorCategory.NOT_FOUND,
    code: ErrorCode.RESOURCE_DELETED,
  },

  // Validation
  {
    pattern: /invalid|validation.*error/i,
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.VALIDATION_ERROR,
  },
  {
    pattern: /required.*field|missing.*required/i,
    category: ErrorCategory.VALIDATION,
    code: ErrorCode.MISSING_REQUIRED_FIELD,
  },

  // Network
  {
    pattern: /network|offline|internet/i,
    category: ErrorCategory.NETWORK,
    code: ErrorCode.NETWORK_ERROR,
  },
  {
    pattern: /timeout|timed out/i,
    category: ErrorCategory.NETWORK,
    code: ErrorCode.NETWORK_TIMEOUT,
  },

  // Server
  {
    pattern: /internal.*server|500/i,
    category: ErrorCategory.SERVER,
    code: ErrorCode.SERVER_ERROR,
  },
  {
    pattern: /service.*unavailable|503|502|504/i,
    category: ErrorCategory.SERVER,
    code: ErrorCode.SERVICE_UNAVAILABLE,
  },
  {
    pattern: /maintenance/i,
    category: ErrorCategory.SERVER,
    code: ErrorCode.MAINTENANCE_MODE,
  },
];

// ============================================================================
// 🎯 PARSE FROM HTTP STATUS
// ============================================================================

/**
 * Map HTTP status codes to error categories and codes
 */
function fromHttpStatus(status: number): {
  category: ErrorCategory;
  code: ErrorCode;
} {
  switch (status) {
    case 400:
      return {
        category: ErrorCategory.VALIDATION,
        code: ErrorCode.VALIDATION_ERROR,
      };
    case 401:
      return { category: ErrorCategory.AUTH, code: ErrorCode.UNAUTHORIZED };
    case 403:
      return { category: ErrorCategory.PERMISSION, code: ErrorCode.FORBIDDEN };
    case 404:
      return { category: ErrorCategory.NOT_FOUND, code: ErrorCode.NOT_FOUND };
    case 409:
      return {
        category: ErrorCategory.BUSINESS_RULE,
        code: ErrorCode.RESOURCE_CONFLICT,
      };
    case 422:
      return {
        category: ErrorCategory.VALIDATION,
        code: ErrorCode.VALIDATION_ERROR,
      };
    case 429:
      return {
        category: ErrorCategory.RATE_LIMIT,
        code: ErrorCode.RATE_LIMITED,
      };
    case 500:
      return { category: ErrorCategory.SERVER, code: ErrorCode.SERVER_ERROR };
    case 502:
    case 503:
    case 504:
      return {
        category: ErrorCategory.SERVER,
        code: ErrorCode.SERVICE_UNAVAILABLE,
      };
    default:
      if (status >= 400 && status < 500) {
        return {
          category: ErrorCategory.CLIENT,
          code: ErrorCode.UNKNOWN_ERROR,
        };
      }
      if (status >= 500) {
        return { category: ErrorCategory.SERVER, code: ErrorCode.SERVER_ERROR };
      }
      return { category: ErrorCategory.UNKNOWN, code: ErrorCode.UNKNOWN_ERROR };
  }
}

// ============================================================================
// 🎯 PARSE PLAN LIMIT ERROR
// ============================================================================

/**
 * Extract plan limit details from error message
 */
function parsePlanLimitDetails(
  message: string,
): AppError["planLimitInfo"] | undefined {
  const match = message.match(PLAN_LIMIT_PATTERN);
  if (!match) return undefined;

  const [, currentUsageStr, limitStr, planName, operation] = match;
  const currentUsage = parseFloat(currentUsageStr);
  const limit = parseFloat(limitStr);

  // Determine plan tier from name
  let currentPlanTier = "Free";
  const lowerPlanName = planName.toLowerCase();
  if (lowerPlanName.includes("elite") || lowerPlanName.includes("business")) {
    currentPlanTier = "Elite";
  } else if (lowerPlanName.includes("pro")) {
    currentPlanTier = "Pro";
  }

  // Recommend next tier up
  let recommendedPlan = "Pro";
  if (currentPlanTier === "Pro") {
    recommendedPlan = "Elite";
  } else if (currentPlanTier === "Elite") {
    recommendedPlan = "Elite";
  }

  // Get human-readable operation name
  const operationNames: Record<string, string> = {
    CreatePlayerProfile: "Player Profiles",
    TeamCreate: "Team Creation",
    ReplayUpload: "Replay Uploads",
    ReplayAnalysis: "AI Analysis",
    JoinMatchmakingQueue: "Matchmaking",
    MatchMakingQueueAmount: "Concurrent Queues",
    TournamentCreate: "Tournament Creation",
  };

  return {
    operation,
    operationName: operationNames[operation] || operation,
    currentUsage,
    limit,
    currentPlan: planName,
    recommendedPlan,
  };
}

// ============================================================================
// 🎯 PARSE "ALREADY EXISTS" ERROR
// ============================================================================

interface AlreadyExistsInfo {
  resourceType: string;
  fieldName: string;
  value: string;
  friendlyMessage: string;
}

/**
 * Extract field info from "already exists" error message
 */
function parseAlreadyExistsDetails(
  message: string,
): AlreadyExistsInfo | undefined {
  const match = message.match(ALREADY_EXISTS_PATTERN);
  if (!match) return undefined;

  const [, resourceType, fieldName, value] = match;

  // Map technical field names to user-friendly terms
  const fieldNameMap: Record<string, string> = {
    Nickname: "display name",
    SlugURI: "profile URL",
    "Nickname or SlugURI": "display name or profile URL",
    Name: "name",
    Email: "email",
  };

  const resourceTypeMap: Record<string, string> = {
    PlayerProfile: "player profile",
    Squad: "squad",
    Team: "team",
  };

  const friendlyField = fieldNameMap[fieldName] || fieldName.toLowerCase();
  const _friendlyResource =
    resourceTypeMap[resourceType] || resourceType.toLowerCase();

  return {
    resourceType,
    fieldName,
    value,
    friendlyMessage: `This ${friendlyField} is already taken. Please choose a different one.`,
  };
}

// ============================================================================
// 🎯 MAIN PARSER
// ============================================================================

interface ApiErrorResponse {
  success?: boolean;
  error?: string | { message?: string; code?: string; details?: unknown };
  message?: string;
  code?: string;
  details?: unknown;
  status?: number;
  data?: { message?: string; error?: string };
  response?: { data?: { message?: string; error?: string } };
}

/**
 * Parse any error into a structured AppError
 */
export function parseError(error: unknown): AppError {
  const timestamp = Date.now();

  // Default error
  const appError: AppError = {
    category: ErrorCategory.UNKNOWN,
    code: ErrorCode.UNKNOWN_ERROR,
    message: DEFAULT_ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    timestamp,
    originalError: error,
  };

  // Extract error message and details
  let errorMessage = "";
  let httpStatus: number | undefined;
  let _errorCode: string | undefined;
  let fieldErrors: Record<string, string> | undefined;
  let retryAfterSeconds: number | undefined;

  if (error === null || error === undefined) {
    return appError;
  }

  // String error
  if (typeof error === "string") {
    errorMessage = error;
  }
  // Error instance
  else if (error instanceof Error) {
    errorMessage = error.message;

    // Check for apiError attached by SDK (contains pre-classified error info)
    const errorWithApi = error as Error & {
      apiError?: {
        category?: ErrorCategory;
        errorCode?: ErrorCode;
        isAuthError?: boolean;
        message?: string;
        status?: number;
      };
      status?: number;
    };

    if (errorWithApi.apiError) {
      // Use pre-classified category and code from API client
      if (errorWithApi.apiError.category) {
        appError.category = errorWithApi.apiError.category;
      }
      if (errorWithApi.apiError.errorCode) {
        appError.code = errorWithApi.apiError.errorCode;
      }
      // Also check isAuthError flag
      if (errorWithApi.apiError.isAuthError) {
        appError.category = ErrorCategory.AUTH;
        appError.code = ErrorCode.UNAUTHORIZED;
      }
      // Get status from apiError.status if available
      if (errorWithApi.apiError.status) {
        httpStatus = errorWithApi.apiError.status;
        appError.httpStatus = httpStatus;
      }
      // Also check errorWithApi.status (attached at top level)
      if (errorWithApi.status) {
        httpStatus = errorWithApi.status;
        appError.httpStatus = httpStatus;
      }
    } else {
      // Even without apiError, check for status attached directly
      if (errorWithApi.status) {
        httpStatus = errorWithApi.status;
        appError.httpStatus = httpStatus;
      }
    }

    // Check for network errors
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      appError.category = ErrorCategory.NETWORK;
      appError.code = ErrorCode.NETWORK_TIMEOUT;
      appError.message = DEFAULT_ERROR_MESSAGES[ErrorCode.NETWORK_TIMEOUT];
      return appError;
    }

    if (error.name === "TypeError" && errorMessage.includes("fetch")) {
      appError.category = ErrorCategory.NETWORK;
      appError.code = ErrorCode.NETWORK_ERROR;
      appError.message = DEFAULT_ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
      return appError;
    }
  }
  // Object (API response)
  else if (typeof error === "object") {
    const err = error as ApiErrorResponse;

    // Extract message from various formats
    if (typeof err.error === "string") {
      errorMessage = err.error;
    } else if (typeof err.error === "object" && err.error?.message) {
      errorMessage = err.error.message;
      _errorCode = err.error.code;
    } else if (err.message) {
      errorMessage = err.message;
    } else if (err.data?.message) {
      errorMessage = err.data.message;
    } else if (err.data?.error) {
      errorMessage = err.data.error;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    }

    // Extract status
    httpStatus = err.status;

    // Extract details as field errors if present
    if (err.details && typeof err.details === "object") {
      const details = err.details as Record<string, unknown>;
      if (Object.values(details).every((v) => typeof v === "string")) {
        fieldErrors = details as Record<string, string>;
      }
    }

    // Check for rate limit info
    if (
      "retryAfterSeconds" in err &&
      typeof err.retryAfterSeconds === "number"
    ) {
      retryAfterSeconds = err.retryAfterSeconds;
    }
  }

  // Classify based on HTTP status if available
  if (httpStatus) {
    const statusClassification = fromHttpStatus(httpStatus);
    appError.category = statusClassification.category;
    appError.code = statusClassification.code;
    appError.httpStatus = httpStatus;
  }

  // Classify based on error message patterns
  for (const { pattern, category, code, message } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      appError.category = category;
      appError.code = code;
      if (message) {
        appError.message = message;
      }
      break;
    }
  }

  // Special handling for plan limits
  if (appError.code === ErrorCode.PLAN_LIMIT_EXCEEDED) {
    const planLimitInfo = parsePlanLimitDetails(errorMessage);
    if (planLimitInfo) {
      appError.planLimitInfo = planLimitInfo;
      appError.message = `You've reached your ${planLimitInfo.operationName.toLowerCase()} limit. Upgrade to continue.`;
    }
  }

  // Special handling for "already exists" errors
  if (appError.code === ErrorCode.ALREADY_EXISTS) {
    const alreadyExistsInfo = parseAlreadyExistsDetails(errorMessage);
    if (alreadyExistsInfo) {
      appError.message = alreadyExistsInfo.friendlyMessage;

      // Map the field name to form field for inline validation
      const fieldMap: Record<string, string> = {
        Nickname: "displayName",
        SlugURI: "slug",
        "Nickname or SlugURI": "displayName",
        Name: "name",
      };

      const formField = fieldMap[alreadyExistsInfo.fieldName];
      if (formField) {
        appError.fieldErrors = {
          ...appError.fieldErrors,
          [formField]: alreadyExistsInfo.friendlyMessage,
        };
      }
    }
  }

  // Set user-friendly message if not already set
  if (appError.message === DEFAULT_ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]) {
    appError.message = DEFAULT_ERROR_MESSAGES[appError.code] || errorMessage;
  }

  // Store technical message
  appError.technicalMessage = errorMessage;
  appError.fieldErrors = fieldErrors;
  appError.retryAfterSeconds = retryAfterSeconds;

  return appError;
}

/**
 * Check if an error is a specific type
 */
export function isErrorCategory(
  error: unknown,
  category: ErrorCategory,
): boolean {
  const parsed = parseError(error);
  return parsed.category === category;
}

/**
 * Check if error is a plan limit error
 */
export function isPlanLimitError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.code === ErrorCode.PLAN_LIMIT_EXCEEDED;
}

/**
 * Check if error requires authentication
 */
export function isAuthError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.category === ErrorCategory.AUTH;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseError(error);
  return [
    ErrorCategory.NETWORK,
    ErrorCategory.SERVER,
    ErrorCategory.RATE_LIMIT,
  ].includes(parsed.category);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.category === ErrorCategory.VALIDATION;
}

/**
 * Check if error is a business rule error
 */
export function isBusinessRuleError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.category === ErrorCategory.BUSINESS_RULE;
}

/**
 * Check if error is an "already exists" conflict error
 */
export function isAlreadyExistsError(error: unknown): boolean {
  const parsed = parseError(error);
  return parsed.code === ErrorCode.ALREADY_EXISTS;
}

/**
 * Extract field errors from any error
 */
export function getFieldErrors(
  error: unknown,
): Record<string, string> | undefined {
  const parsed = parseError(error);
  return parsed.fieldErrors;
}
