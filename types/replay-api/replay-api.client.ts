import { ReplayApiSettings, ReplayApiResourceType } from "./settings";
import { ResultOptions, RouteBuilder } from "./replay-api.route-builder";
import { Loggable } from "@/lib/logger";
import { getRIDTokenManager } from "./auth";
import { SearchRequest } from "./search-builder";

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
}

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

export class ReplayApiClient {
  private routeBuilder: RouteBuilder;
  private defaultTimeout = 30000; // 30 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(private settings: ReplayApiSettings, private logger: Loggable) {
    this.routeBuilder = new RouteBuilder(settings, logger);
  }

  /**
   * Get resource (existing method - maintained for backward compatibility)
   */
  async getResource<T>(
    resourceType: ReplayApiResourceType,
    filters: { resourceType: ReplayApiResourceType, params?: { [key: string]: string } }[],
    resultOptions?: ResultOptions
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
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Generic POST request with authentication
   */
  async post<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, options);
  }

  /**
   * Generic PUT request with authentication
   */
  async put<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, options);
  }

  /**
   * Generic DELETE request with authentication
   */
  async delete<T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /**
   * Generic PATCH request with authentication
   */
  async patch<T, D = unknown>(
    path: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, data, options);
  }

  /**
   * Search with complex query
   */
  async search<T>(
    searchRequest: SearchRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.post<T, SearchRequest>('/search', searchRequest, options);
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
    options?: RequestOptions,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    
    // Use auth token from settings (server-side) or RIDTokenManager (client-side)
    let authHeaders: Record<string, string> = {};
    if (this.settings.authToken) {
      // Server-side: use token from settings
      authHeaders = { 'Authorization': `Bearer ${this.settings.authToken}` };
    } else if (typeof window !== 'undefined') {
      // Client-side: use RIDTokenManager
      authHeaders = await getRIDTokenManager().getAuthHeaders();
    }

    const controller = new AbortController();
    const timeoutId = options?.timeout
      ? setTimeout(() => controller.abort(), options.timeout)
      : setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: options?.signal || controller.signal,
      };

      if (data && method !== 'GET') {
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
        
        // For rate limiting, use exponential backoff with Retry-After header
        if (response.status === 429 && retryCount < this.maxRetries) {
          const retryAfter = errorData.retryAfterSeconds || (this.retryDelay / 1000) * Math.pow(2, retryCount);
          this.logger.warn(`[ReplayApiClient] Rate limited, retrying ${method} ${url} after ${retryAfter}s (attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(retryAfter * 1000);
          return this.request<T>(method, path, data, options, retryCount + 1);
        }
        
        // Retry on server errors (5xx)
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          this.logger.warn(`[ReplayApiClient] Retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.request<T>(method, path, data, options, retryCount + 1);
        }

        this.logger.error(`[ReplayApiClient] ${method} ${url} failed`, errorData);
        return {
          error: errorData,
          status: response.status,
          rateLimitInfo,
        };
      }

      // Parse successful response
      const responseData = await this.parseSuccessResponse<T>(response);

      this.logger.info(`[ReplayApiClient] ${method} ${url} succeeded`, { status: response.status });

      return {
        data: responseData,
        status: response.status,
        rateLimitInfo,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      // Handle network errors with retry
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        this.logger.warn(`[ReplayApiClient] Network error, retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.request<T>(method, path, data, options, retryCount + 1);
      }

      this.logger.error(`[ReplayApiClient] ${method} ${url} exception`, { error: errorMessage });

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
    const basePath = path.startsWith('/') ? path : `/${path}`;
    return `${this.settings.baseUrl}${basePath}`;
  }

  /**
   * Parse error response with enhanced error categorization
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    const status = response.status;
    
    try {
      const errorData = await response.json();
      
      // Extract rate limit specific info from structured error response
      const error = errorData.error || errorData;
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfterSeconds = error.retry_after_seconds || 
        (retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined);

      return {
        message: this.getUserFriendlyMessage(status, error.message || errorData.message || response.statusText),
        status,
        code: error.code || errorData.code,
        details: error.details || errorData.details || errorData,
        retryAfterSeconds,
        isRateLimited: status === 429,
        isValidationError: status === 400 || status === 422,
        isAuthError: status === 401 || status === 403,
        isNotFound: status === 404,
      };
    } catch {
      return {
        message: this.getUserFriendlyMessage(status, response.statusText),
        status,
        isRateLimited: status === 429,
        isValidationError: status === 400 || status === 422,
        isAuthError: status === 401 || status === 403,
        isNotFound: status === 404,
      };
    }
  }

  /**
   * Get user-friendly error message based on status code
   */
  private getUserFriendlyMessage(status: number, fallbackMessage: string): string {
    switch (status) {
      case 400:
        return fallbackMessage || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Please sign in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return fallbackMessage || 'This action conflicts with existing data.';
      case 422:
        return fallbackMessage || 'The provided data is invalid. Please check and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Something went wrong on our end. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return fallbackMessage || 'An unexpected error occurred.';
    }
  }

  /**
   * Extract rate limit info from response headers
   */
  private extractRateLimitInfo(response: Response): RateLimitInfo | undefined {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const retryAfter = response.headers.get('Retry-After');

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
   */
  private async parseSuccessResponse<T>(response: Response): Promise<T | undefined> {
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined;
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
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
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.message?.includes('network') ||
        error.message?.includes('fetch')
      );
    }
    return false;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
