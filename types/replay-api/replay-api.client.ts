import { ReplayApiSettings, ReplayApiResourceType } from "./settings";
import { ResultOptions, RouteBuilder } from "./replay-api.route-builder";
import { Loggable } from "@/lib/logger";
import { getRIDTokenManager } from "./auth";
import { SearchRequest } from "./search-builder";
import { ErrorCategory, ErrorCode } from "@/lib/errors/error-types";

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError | string;
  nextOffset?: number | string;
  status?: number;
  message?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  retryAfterSeconds?: number;
  isRateLimited?: boolean;
  isValidationError?: boolean;
  isAuthError?: boolean;
  isNotFound?: boolean;
  /** Error category for UI treatment */
  category?: ErrorCategory;
  /** Specific error code */
  errorCode?: ErrorCode;
  /** Field-level validation errors */
  fieldErrors?: Record<string, string>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
  /** Skip auth header injection (for public endpoints) */
  skipAuth?: boolean;
  /** Cache key for request deduplication */
  cacheKey?: string;
}

/**
 * Cached auth headers with TTL
 */
interface CachedAuthHeaders {
  headers: Record<string, string>;
  expiresAt: number;
}

/**
 * In-flight request tracking for deduplication
 */
interface InFlightRequest<T> {
  promise: Promise<ApiResponse<T>>;
  timestamp: number;
}

export class ReplayApiClient {
  private routeBuilder: RouteBuilder;
  private defaultTimeout = 15000; // 15 seconds (reduced from 30s for faster feedback)
  private maxRetries = 2; // Reduced from 3 for faster failure
  private retryDelay = 500; // 500ms (reduced from 1s)

  /** Cached auth headers with 30-second TTL */
  private static cachedAuthHeaders: CachedAuthHeaders | null = null;
  private static authHeaderCacheTTL = 30000; // 30 seconds

  /** In-flight request deduplication map */
  private static inFlightRequests = new Map<string, InFlightRequest<unknown>>();
  private static inFlightCleanupInterval: ReturnType<
    typeof setInterval
  > | null = null;

  constructor(
    private settings: ReplayApiSettings,
    private logger: Loggable,
  ) {
    this.routeBuilder = new RouteBuilder(settings, logger);

    // Start cleanup interval for stale in-flight requests (client-side only)
    if (
      typeof window !== "undefined" &&
      !ReplayApiClient.inFlightCleanupInterval
    ) {
      ReplayApiClient.inFlightCleanupInterval = setInterval(() => {
        this.cleanupStaleRequests();
      }, 10000); // Every 10 seconds
    }
  }

  /**
   * Cleanup stale in-flight requests (older than 30 seconds)
   */
  private cleanupStaleRequests(): void {
    const now = Date.now();
    const staleThreshold = 30000; // 30 seconds

    ReplayApiClient.inFlightRequests.forEach((request, key) => {
      if (now - request.timestamp > staleThreshold) {
        ReplayApiClient.inFlightRequests.delete(key);
      }
    });
  }

  /**
   * Get cached auth headers or fetch new ones
   * Handles token expiration by invalidating cache when headers are empty
   */
  private async getAuthHeadersCached(): Promise<Record<string, string>> {
    // Server-side: use auth token from settings directly
    if (this.settings.authToken) {
      return { "X-Resource-Owner-ID": this.settings.authToken };
    }

    // Client-side: use cached headers or fetch from RIDTokenManager
    if (typeof window !== "undefined") {
      const now = Date.now();

      // Return cached headers if still valid and not empty
      // (empty headers means token was expired or not present)
      if (
        ReplayApiClient.cachedAuthHeaders &&
        ReplayApiClient.cachedAuthHeaders.expiresAt > now &&
        Object.keys(ReplayApiClient.cachedAuthHeaders.headers).length > 0
      ) {
        return ReplayApiClient.cachedAuthHeaders.headers;
      }

      // Fetch fresh headers
      try {
        const headers = await getRIDTokenManager().getAuthHeaders();

        // Only cache non-empty headers (empty means expired/unauthenticated)
        if (Object.keys(headers).length > 0) {
          ReplayApiClient.cachedAuthHeaders = {
            headers,
            expiresAt: now + ReplayApiClient.authHeaderCacheTTL,
          };
        } else {
          // Clear cache if headers are empty (expired token)
          ReplayApiClient.cachedAuthHeaders = null;
        }

        return headers;
      } catch (error) {
        this.logger.warn("[ReplayApiClient] Failed to get auth headers", {
          error,
        });
        return {};
      }
    }

    return {};
  }

  /**
   * Invalidate cached auth headers (call after logout or token refresh)
   */
  static invalidateAuthCache(): void {
    ReplayApiClient.cachedAuthHeaders = null;
  }

  /**
   * Get resource (existing method - maintained for backward compatibility)
   */
  async getResource<T>(
    resourceType: ReplayApiResourceType,
    filters: {
      resourceType: ReplayApiResourceType;
      params?: { [key: string]: string };
    }[],
    resultOptions?: ResultOptions,
  ): Promise<ApiResponse<T> | undefined> {
    for (const { resourceType, params } of filters) {
      this.routeBuilder.route(resourceType, params);
    }

    return this.routeBuilder.get(resourceType, resultOptions);
  }

  /**
   * Generic GET request with authentication
   */
  async get<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, undefined, options);
  }

  /**
   * Generic POST request with authentication
   */
  async post<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, data, options);
  }

  /**
   * Generic PUT request with authentication
   */
  async put<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, data, options);
  }

  /**
   * Generic DELETE request with authentication
   */
  async delete<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  /**
   * Generic PATCH request with authentication
   */
  async patch<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, data, options);
  }

  /**
   * Search with complex query
   */
  async search<T>(
    searchRequest: SearchRequest,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.post<T, SearchRequest>("/search", searchRequest, options);
  }

  /**
   * Core request method with retry logic, caching, and deduplication
   */
  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
    options?: RequestOptions,
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);

    // Generate cache key for request deduplication (GET requests only)
    const cacheKey =
      options?.cacheKey || (method === "GET" ? `${method}:${url}` : null);

    // Check for in-flight duplicate request (GET only)
    if (cacheKey && typeof window !== "undefined") {
      const inFlight = ReplayApiClient.inFlightRequests.get(cacheKey);
      if (inFlight) {
        this.logger.info(`[ReplayApiClient] Deduplicating ${method} ${url}`);
        return inFlight.promise as Promise<ApiResponse<T>>;
      }
    }

    // Create the actual request promise
    const requestPromise = this.executeRequest<T>(
      method,
      url,
      path,
      data,
      options,
      retryCount,
    );

    // Track in-flight request for deduplication
    if (cacheKey && typeof window !== "undefined") {
      ReplayApiClient.inFlightRequests.set(cacheKey, {
        promise: requestPromise,
        timestamp: Date.now(),
      });

      // Clean up after request completes
      requestPromise.finally(() => {
        ReplayApiClient.inFlightRequests.delete(cacheKey);
      });
    }

    return requestPromise;
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest<T>(
    method: string,
    url: string,
    path: string,
    data?: unknown,
    options?: RequestOptions,
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    // Get auth headers (cached for performance)
    let authHeaders: Record<string, string> = {};
    if (!options?.skipAuth) {
      authHeaders = await this.getAuthHeadersCached();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeout || this.defaultTimeout,
    );

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options?.headers,
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: options?.signal || controller.signal,
      };

      if (data && method !== "GET") {
        fetchOptions.body = JSON.stringify(data);
      }

      this.logger.info(`[ReplayApiClient] ${method} ${url}`, { data });

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Extract rate limit info from headers (always present on successful or failed requests)
      const rateLimitInfo = this.extractRateLimitInfo(response);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);

        // On 401, invalidate auth cache to force re-fetch on next request
        if (response.status === 401) {
          this.logger.warn(
            "[ReplayApiClient] 401 received, invalidating auth cache",
          );
          ReplayApiClient.invalidateAuthCache();
        }

        // For rate limiting, use exponential backoff with Retry-After header
        if (response.status === 429 && retryCount < this.maxRetries) {
          const retryAfter =
            errorData.retryAfterSeconds ||
            (this.retryDelay / 1000) * Math.pow(2, retryCount);
          this.logger.warn(
            `[ReplayApiClient] Rate limited, retrying ${method} ${url} after ${retryAfter}s (attempt ${retryCount + 1}/${this.maxRetries})`,
          );
          await this.delay(retryAfter * 1000);
          return this.request<T>(method, path, data, options, retryCount + 1);
        }

        // Retry on server errors (5xx)
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          this.logger.warn(
            `[ReplayApiClient] Retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`,
          );
          await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.request<T>(method, path, data, options, retryCount + 1);
        }

        this.logger.error(
          `[ReplayApiClient] ${method} ${url} failed`,
          errorData,
        );
        return {
          error: errorData,
          status: response.status,
          rateLimitInfo,
        };
      }

      // Parse successful response
      const responseData = await this.parseSuccessResponse<T>(response);

      this.logger.info(`[ReplayApiClient] ${method} ${url} succeeded`, {
        status: response.status,
      });

      return {
        data: responseData,
        status: response.status,
        rateLimitInfo,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const errorMessage =
        error instanceof Error ? error.message : "Request failed";
      const errorName = error instanceof Error ? error.name : "UnknownError";

      // Handle network errors with retry
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        this.logger.warn(
          `[ReplayApiClient] Network error, retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`,
        );
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.executeRequest<T>(
          method,
          url,
          path,
          data,
          options,
          retryCount + 1,
        );
      }

      this.logger.error(`[ReplayApiClient] ${method} ${url} exception`, {
        error: errorMessage,
      });

      return {
        error: {
          message: errorMessage,
          code: errorName,
          details: error,
        },
        status: 0,
      };
    }
  }

  /**
   * Build full URL from path
   */
  private buildUrl(path: string): string {
    const basePath = path.startsWith("/") ? path : `/${path}`;
    return `${this.settings.baseUrl}${basePath}`;
  }

  /**
   * Parse error response with enhanced error categorization
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    const status = response.status;

    // Determine error category based on status
    const { category, errorCode } = this.getErrorCategoryFromStatus(status);

    try {
      const errorData = await response.json();

      // Extract rate limit specific info from structured error response
      const error = errorData.error || errorData;
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterSeconds =
        error.retry_after_seconds ||
        (retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined);

      // Extract field errors if present
      let fieldErrors: Record<string, string> | undefined;
      if (error.details && typeof error.details === "object") {
        const details = error.details as Record<string, unknown>;
        if (Object.values(details).every((v) => typeof v === "string")) {
          fieldErrors = details as Record<string, string>;
        }
      }

      return {
        message: this.getUserFriendlyMessage(
          status,
          error.message || errorData.message || response.statusText,
        ),
        status,
        code: error.code || errorData.code,
        details: error.details || errorData.details || errorData,
        retryAfterSeconds,
        isRateLimited: status === 429,
        isValidationError: status === 400 || status === 422,
        isAuthError: status === 401 || status === 403,
        isNotFound: status === 404,
        category,
        errorCode,
        fieldErrors,
      };
    } catch {
      return {
        message: this.getUserFriendlyMessage(status, response.statusText),
        status,
        isRateLimited: status === 429,
        isValidationError: status === 400 || status === 422,
        category,
        errorCode,
        isAuthError: status === 401 || status === 403,
        isNotFound: status === 404,
      };
    }
  }

  /**
   * Get error category and code from HTTP status
   */
  private getErrorCategoryFromStatus(status: number): {
    category: ErrorCategory;
    errorCode: ErrorCode;
  } {
    switch (status) {
      case 400:
        return {
          category: ErrorCategory.VALIDATION,
          errorCode: ErrorCode.VALIDATION_ERROR,
        };
      case 401:
        return {
          category: ErrorCategory.AUTH,
          errorCode: ErrorCode.UNAUTHORIZED,
        };
      case 403:
        return {
          category: ErrorCategory.PERMISSION,
          errorCode: ErrorCode.FORBIDDEN,
        };
      case 404:
        return {
          category: ErrorCategory.NOT_FOUND,
          errorCode: ErrorCode.NOT_FOUND,
        };
      case 409:
        return {
          category: ErrorCategory.BUSINESS_RULE,
          errorCode: ErrorCode.RESOURCE_CONFLICT,
        };
      case 422:
        return {
          category: ErrorCategory.VALIDATION,
          errorCode: ErrorCode.VALIDATION_ERROR,
        };
      case 429:
        return {
          category: ErrorCategory.RATE_LIMIT,
          errorCode: ErrorCode.RATE_LIMITED,
        };
      case 500:
        return {
          category: ErrorCategory.SERVER,
          errorCode: ErrorCode.SERVER_ERROR,
        };
      case 502:
      case 503:
      case 504:
        return {
          category: ErrorCategory.SERVER,
          errorCode: ErrorCode.SERVICE_UNAVAILABLE,
        };
      default:
        if (status >= 400 && status < 500) {
          return {
            category: ErrorCategory.CLIENT,
            errorCode: ErrorCode.UNKNOWN_ERROR,
          };
        }
        if (status >= 500) {
          return {
            category: ErrorCategory.SERVER,
            errorCode: ErrorCode.SERVER_ERROR,
          };
        }
        return {
          category: ErrorCategory.UNKNOWN,
          errorCode: ErrorCode.UNKNOWN_ERROR,
        };
    }
  }

  /**
   * Get user-friendly error message based on status code
   */
  private getUserFriendlyMessage(
    status: number,
    fallbackMessage: string,
  ): string {
    switch (status) {
      case 400:
        return (
          fallbackMessage ||
          "Invalid request. Please check your input and try again."
        );
      case 401:
        return "Please sign in to continue.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return fallbackMessage || "This action conflicts with existing data.";
      case 422:
        return (
          fallbackMessage ||
          "The provided data is invalid. Please check and try again."
        );
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Something went wrong on our end. Please try again later.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again in a few moments.";
      default:
        return fallbackMessage || "An unexpected error occurred.";
    }
  }

  /**
   * Extract rate limit info from response headers
   */
  private extractRateLimitInfo(response: Response): RateLimitInfo | undefined {
    const limit = response.headers.get("X-RateLimit-Limit");
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const reset = response.headers.get("X-RateLimit-Reset");
    const retryAfter = response.headers.get("Retry-After");

    if (limit || remaining || reset) {
      return {
        limit: limit ? parseInt(limit, 10) : 0,
        remaining: remaining ? parseInt(remaining, 10) : 0,
        resetAt: reset ? parseInt(reset, 10) : 0,
        retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : undefined,
      };
    }
    return undefined;
  }

  /**
   * Parse success response
   * Handles wrapped responses from backend: {success: true, data: {...}}
   */
  private async parseSuccessResponse<T>(
    response: Response,
  ): Promise<T | undefined> {
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const json = await response.json();

      // Handle wrapped API responses: {success: true/false, data: {...}, error?: string}
      // Many backend endpoints return this format
      if (json && typeof json === "object" && "success" in json) {
        // If success is false, this is actually an error
        if (json.success === false) {
          throw new Error(json.error || json.message || "Request failed");
        }
        // If success is true and data exists, unwrap it
        if (json.data !== undefined) {
          return json.data as T;
        }
      }

      return json as T;
    }

    // Return as text for non-JSON responses
    const text = await response.text();
    return text as T;
  }

  /**
   * Check if status code should trigger retry
   */
  private shouldRetry(status: number): boolean {
    // Retry on server errors only (not rate limiting - that's handled separately)
    return status >= 500;
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === "AbortError" ||
        error.name === "TypeError" ||
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      );
    }
    return false;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set default timeout
   */
  setDefaultTimeout(ms: number): void {
    this.defaultTimeout = ms;
  }

  /**
   * Set max retries
   */
  setMaxRetries(count: number): void {
    this.maxRetries = count;
  }

  /**
   * Set retry delay
   */
  setRetryDelay(ms: number): void {
    this.retryDelay = ms;
  }
}
