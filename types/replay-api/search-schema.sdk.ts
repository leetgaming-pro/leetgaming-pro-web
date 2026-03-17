/**
 * Search Schema SDK - Dynamic queryable field discovery
 * 
 * This module provides methods to fetch and cache the search schema from the backend.
 * The schema defines which fields are queryable per entity type, enabling dynamic
 * fuzzy search without hardcoding field names in the frontend.
 * 
 * Architecture:
 * - Backend exposes /api/search/schema endpoint with all queryable fields
 * - Frontend SDK fetches once and caches (in-memory + localStorage)
 * - useGlobalSearch hook uses cached schema for dynamic searches
 * - Cache invalidated by version change or manual refresh
 */

import { ReplayApiClient } from './replay-api.client';

/**
 * Schema for a single entity type
 */
export interface EntitySearchSchema {
  entity_type: string;
  queryable_fields: string[];
  default_search_fields: string[];
  sortable_fields: string[];
  filterable_fields: string[];
}

/**
 * Complete search schema from backend
 */
export interface SearchSchema {
  version: string;
  entities: Record<string, EntitySearchSchema>;
}

// Cache key for localStorage
const SCHEMA_CACHE_KEY = 'leetgaming_search_schema';
const SCHEMA_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedSchema {
  schema: SearchSchema;
  fetchedAt: number;
  version: string;
}

/**
 * Search Schema API - Manages queryable field discovery and caching
 */
export class SearchSchemaAPI {
  private client: ReplayApiClient;
  private memoryCache: SearchSchema | null = null;
  private fetchPromise: Promise<SearchSchema | null> | null = null;

  constructor(client: ReplayApiClient) {
    this.client = client;
    // Try to load from localStorage on init
    this.loadFromLocalStorage();
  }

  /**
   * Get the search schema (from cache or fetch)
   * Returns cached version if available and not expired
   */
  async getSchema(): Promise<SearchSchema | null> {
    // Return memory cache if available
    if (this.memoryCache) {
      return this.memoryCache;
    }

    // Avoid duplicate fetches
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchSchema();
    const result = await this.fetchPromise;
    this.fetchPromise = null;
    return result;
  }

  /**
   * Get queryable fields for a specific entity type
   */
  async getEntitySchema(entityType: string): Promise<EntitySearchSchema | null> {
    const schema = await this.getSchema();
    if (!schema) return null;
    return schema.entities[entityType] || null;
  }

  /**
   * Get default search fields for an entity type
   * These are the fields used when doing fuzzy/global search
   */
  async getDefaultSearchFields(entityType: string): Promise<string[]> {
    const entitySchema = await this.getEntitySchema(entityType);
    return entitySchema?.default_search_fields || [];
  }

  /**
   * Get all queryable fields for an entity type
   */
  async getQueryableFields(entityType: string): Promise<string[]> {
    const entitySchema = await this.getEntitySchema(entityType);
    return entitySchema?.queryable_fields || [];
  }

  /**
   * Check if a field is queryable for an entity type
   */
  async isFieldQueryable(entityType: string, fieldName: string): Promise<boolean> {
    const fields = await this.getQueryableFields(entityType);
    return fields.includes(fieldName);
  }

  /**
   * Build search_fields param for a search query
   * Uses default fields if none specified
   */
  async buildSearchFieldsParam(entityType: string, fields?: string[]): Promise<string> {
    if (fields && fields.length > 0) {
      return fields.join(',');
    }
    const defaultFields = await this.getDefaultSearchFields(entityType);
    return defaultFields.join(',');
  }

  /**
   * Force refresh the schema from backend
   */
  async refresh(): Promise<SearchSchema | null> {
    this.memoryCache = null;
    this.clearLocalStorage();
    return this.getSchema();
  }

  /**
   * Get all available entity types
   */
  async getEntityTypes(): Promise<string[]> {
    const schema = await this.getSchema();
    if (!schema) return [];
    return Object.keys(schema.entities);
  }

  /**
   * Check if schema is cached and valid
   */
  isCached(): boolean {
    return this.memoryCache !== null;
  }

  /**
   * Get the current schema version
   */
  getVersion(): string | null {
    return this.memoryCache?.version || null;
  }

  // Private methods

  private async fetchSchema(): Promise<SearchSchema | null> {
    try {
      const response = await this.client.get<SearchSchema>('/search/schema');
      if (response.data) {
        this.memoryCache = response.data;
        this.saveToLocalStorage(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('[SearchSchemaAPI] Failed to fetch schema:', error);
      // Return cached version if available, even if expired
      return this.memoryCache;
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem(SCHEMA_CACHE_KEY);
      if (!cached) return;

      const parsed: CachedSchema = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - parsed.fetchedAt < SCHEMA_CACHE_TTL) {
        this.memoryCache = parsed.schema;
      } else {
        // Expired, clear it
        this.clearLocalStorage();
      }
    } catch (error) {
      console.warn('[SearchSchemaAPI] Failed to load from localStorage:', error);
      this.clearLocalStorage();
    }
  }

  private saveToLocalStorage(schema: SearchSchema): void {
    if (typeof window === 'undefined') return;

    try {
      const cached: CachedSchema = {
        schema,
        fetchedAt: Date.now(),
        version: schema.version,
      };
      localStorage.setItem(SCHEMA_CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.warn('[SearchSchemaAPI] Failed to save to localStorage:', error);
    }
  }

  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SCHEMA_CACHE_KEY);
    } catch (error) {
      // Ignore
    }
  }
}

/**
 * Entity type constants for type-safe access
 */
export const EntityTypes = {
  PLAYERS: 'players',
  TEAMS: 'teams',
  REPLAYS: 'replays',
  MATCHES: 'matches',
  EVENTS: 'events',
  TOURNAMENTS: 'tournaments',
} as const;

export type EntityType = typeof EntityTypes[keyof typeof EntityTypes];

/**
 * Helper to create a search params object with dynamic fields
 */
export function buildSearchParams(
  searchTerm: string,
  searchFields: string[],
  filters?: Record<string, string | number>,
  pagination?: { limit?: number; offset?: number }
): URLSearchParams {
  const params = new URLSearchParams();

  if (searchTerm) {
    params.append('q', searchTerm);
    if (searchFields.length > 0) {
      params.append('search_fields', searchFields.join(','));
    }
  }

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    }
  }

  if (pagination?.limit) {
    params.append('limit', String(pagination.limit));
  }
  if (pagination?.offset) {
    params.append('offset', String(pagination.offset));
  }

  return params;
}
