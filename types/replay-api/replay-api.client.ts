import { ReplayApiSettings, ReplayApiResourceType } from "./settings";
import { ResultOptions, RouteBuilder } from "./replay-api.route-builder";
import { Loggable } from "@/lib/logger";
import { getRIDTokenManager } from "./auth";
import { SearchRequest } from "./search-builder";

export interface ApiResponse<T> {
  data?: T;
  error?: any;
  nextOffset?: number | string;
  status?: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
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
  async post<T, D = any>(
    path: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, options);
  }

  /**
   * Generic PUT request with authentication
   */
  async put<T, D = any>(
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
  async patch<T, D = any>(
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
    data?: any,
    options?: RequestOptions,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const authHeaders: Record<string, string> = await getRIDTokenManager().getAuthHeaders();

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

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        
        // Retry on specific status codes
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          this.logger.warn(`[ReplayApiClient] Retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return this.request<T>(method, path, data, options, retryCount + 1);
        }

        this.logger.error(`[ReplayApiClient] ${method} ${url} failed`, errorData);
        return {
          error: errorData,
          status: response.status,
        };
      }

      // Parse successful response
      const responseData = await this.parseSuccessResponse<T>(response);

      this.logger.info(`[ReplayApiClient] ${method} ${url} succeeded`, { status: response.status });

      return {
        data: responseData,
        status: response.status,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle network errors with retry
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        this.logger.warn(`[ReplayApiClient] Network error, retrying ${method} ${url} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.request<T>(method, path, data, options, retryCount + 1);
      }

      this.logger.error(`[ReplayApiClient] ${method} ${url} exception`, error);

      return {
        error: {
          message: error.message || 'Request failed',
          code: error.name,
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
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || errorData.error || response.statusText,
        status: response.status,
        code: errorData.code,
        details: errorData,
      };
    } catch {
      return {
        message: response.statusText || 'Request failed',
        status: response.status,
      };
    }
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
    return text as any;
  }

  /**
   * Check if status code should trigger retry
   */
  private shouldRetry(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message?.includes('network') ||
      error.message?.includes('fetch')
    );
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
