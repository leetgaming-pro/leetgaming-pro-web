/**
 * Search builder for Replay API queries
 * Provides fluent API for constructing complex searches with visibility controls
 * Based on replay-api/pkg/domain/search.go
 */

import { CSFilters, UUIDParams, TickRange, DateRange } from './searchable';
import { ResourceOwner } from './replay-file';
import { IntendedAudienceKey } from './settings';

/**
 * Search operators matching backend implementation
 * Based on replay-api/pkg/domain/search.go
 */
export enum SearchOperator {
  Equals = 'eq',
  NotEquals = 'ne',
  GreaterThan = 'gt',
  LessThan = 'lt',
  GreaterThanOrEqual = 'gte',
  LessThanOrEqual = 'lte',
  Contains = 'contains',
  StartsWith = 'startswith',
  EndsWith = 'endswith',
  In = 'in',
  NotIn = 'nin',
}

/**
 * Sort direction
 */
export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

/**
 * Sortable field definition
 */
export interface SortableField {
  field: string;
  direction: SortDirection;
}

/**
 * Search result options
 */
export interface SearchResultOptions {
  skip?: number;
  limit?: number;
  pickFields?: string[];
  omitFields?: string[];
}

/**
 * Search visibility options for access control
 * Based on replay-api/pkg/domain/search.go SearchVisibilityOptions
 */
export interface SearchVisibilityOptions {
  requestSource?: ResourceOwner;
  intendedAudience?: IntendedAudienceKey;
}

/**
 * Complete search configuration
 */
export interface SearchRequest {
  filters: CSFilters;
  resultOptions?: SearchResultOptions;
  sortOptions?: SortableField[];
  visibilityOptions?: SearchVisibilityOptions;
}

/**
 * Fluent search builder wrapping CSFilters with additional capabilities
 */
export class SearchBuilder {
  private filters: CSFilters = {};
  private resultOpts: SearchResultOptions = {};
  private sortOpts: SortableField[] = [];
  private visibilityOpts: SearchVisibilityOptions = {};

  /**
   * Filter by game IDs
   */
  withGameIds(gameIds: UUIDParams): SearchBuilder {
    this.filters.gameIds = gameIds;
    return this;
  }

  /**
   * Filter by team IDs
   */
  withTeamIds(teamIds: UUIDParams): SearchBuilder {
    this.filters.teamIds = teamIds;
    return this;
  }

  /**
   * Filter by player IDs
   */
  withPlayerIds(playerIds: UUIDParams): SearchBuilder {
    this.filters.playerIds = playerIds;
    return this;
  }

  /**
   * Filter by replay file IDs
   */
  withReplayFiles(replayFileIds: UUIDParams): SearchBuilder {
    this.filters.replayFiles = replayFileIds;
    return this;
  }

  /**
   * Filter by match IDs
   */
  withMatchIds(matchIds: UUIDParams): SearchBuilder {
    this.filters.matchIds = matchIds;
    return this;
  }

  /**
   * Filter by round numbers
   */
  withRoundNumbers(roundNumbers: UUIDParams): SearchBuilder {
    this.filters.roundNumbers = roundNumbers;
    return this;
  }

  /**
   * Filter by group IDs
   */
  withGroups(groupIds: UUIDParams): SearchBuilder {
    this.filters.groups = groupIds;
    return this;
  }

  /**
   * Filter by side IDs (CT/T)
   */
  withSideIds(sideIds: UUIDParams): SearchBuilder {
    this.filters.sideIds = sideIds;
    return this;
  }

  /**
   * Filter by tick ranges
   */
  withTickRanges(tickRanges: TickRange[]): SearchBuilder {
    this.filters.tickRanges = tickRanges;
    return this;
  }

  /**
   * Filter by date ranges
   */
  withDateRanges(dateRanges: DateRange[]): SearchBuilder {
    this.filters.dateRanges = dateRanges;
    return this;
  }

  /**
   * Filter by text search
   */
  withTextSearch(searchTerms: string[]): SearchBuilder {
    this.filters.textSearch = searchTerms;
    return this;
  }

  /**
   * Filter by maps
   */
  withMaps(mapIds: UUIDParams): SearchBuilder {
    this.filters.maps = mapIds;
    return this;
  }

  /**
   * Filter by networks
   */
  withNetworks(networkIds: UUIDParams): SearchBuilder {
    this.filters.networks = networkIds;
    return this;
  }

  /**
   * Filter by game modes
   */
  withGameModes(gameMode: NonNullable<CSFilters['gameModes']>): SearchBuilder {
    this.filters.gameModes = gameMode;
    return this;
  }

  /**
   * Filter by resource visibilities
   */
  withResourceVisibilities(visibility: NonNullable<CSFilters['resourceVisibilities']>): SearchBuilder {
    this.filters.resourceVisibilities = visibility;
    return this;
  }

  /**
   * Filter by resource owners
   */
  withResourceOwners(ownerIds: UUIDParams): SearchBuilder {
    this.filters.resourceOwners = ownerIds;
    return this;
  }

  /**
   * Filter by resource status
   */
  withResourceStatus(status: NonNullable<CSFilters['resourceStatus']>): SearchBuilder {
    this.filters.resourceStatus = status;
    return this;
  }

  /**
   * Set complete custom filters (advanced usage)
   */
  withCustomFilters(filters: Partial<CSFilters>): SearchBuilder {
    this.filters = { ...this.filters, ...filters };
    return this;
  }

  /**
   * Set skip (offset) for pagination
   */
  skip(count: number): SearchBuilder {
    this.resultOpts.skip = count;
    return this;
  }

  /**
   * Set limit (page size) for pagination
   */
  limit(count: number): SearchBuilder {
    this.resultOpts.limit = count;
    return this;
  }

  /**
   * Paginate results (convenience method)
   */
  paginate(page: number, pageSize: number): SearchBuilder {
    this.resultOpts.skip = (page - 1) * pageSize;
    this.resultOpts.limit = pageSize;
    return this;
  }

  /**
   * Pick specific fields to include in response
   */
  pickFields(...fields: string[]): SearchBuilder {
    this.resultOpts.pickFields = fields;
    return this;
  }

  /**
   * Omit specific fields from response
   */
  omitFields(...fields: string[]): SearchBuilder {
    this.resultOpts.omitFields = fields;
    return this;
  }

  /**
   * Add sort field
   */
  sortBy(field: string, direction: SortDirection = SortDirection.Ascending): SearchBuilder {
    this.sortOpts.push({ field, direction });
    return this;
  }

  /**
   * Sort ascending
   */
  sortAsc(field: string): SearchBuilder {
    return this.sortBy(field, SortDirection.Ascending);
  }

  /**
   * Sort descending
   */
  sortDesc(field: string): SearchBuilder {
    return this.sortBy(field, SortDirection.Descending);
  }

  /**
   * Set request source (who is making the request)
   */
  withRequestSource(resourceOwner: ResourceOwner): SearchBuilder {
    this.visibilityOpts.requestSource = resourceOwner;
    return this;
  }

  /**
   * Set intended audience (required access level for results)
   */
  withIntendedAudience(audience: IntendedAudienceKey): SearchBuilder {
    this.visibilityOpts.intendedAudience = audience;
    return this;
  }

  /**
   * Set complete visibility options
   */
  withVisibilityOptions(options: SearchVisibilityOptions): SearchBuilder {
    this.visibilityOpts = { ...this.visibilityOpts, ...options };
    return this;
  }

  /**
   * Build the complete search request
   */
  build(): SearchRequest {
    return {
      filters: this.filters,
      resultOptions: Object.keys(this.resultOpts).length > 0 ? this.resultOpts : undefined,
      sortOptions: this.sortOpts.length > 0 ? this.sortOpts : undefined,
      visibilityOptions: Object.keys(this.visibilityOpts).length > 0 ? this.visibilityOpts : undefined,
    };
  }

  /**
   * Get just the filters (for backward compatibility)
   */
  getFilters(): CSFilters {
    return this.filters;
  }

  /**
   * Get result options
   */
  getResultOptions(): SearchResultOptions | undefined {
    return Object.keys(this.resultOpts).length > 0 ? this.resultOpts : undefined;
  }

  /**
   * Reset the builder
   */
  reset(): SearchBuilder {
    this.filters = {};
    this.resultOpts = {};
    this.sortOpts = [];
    this.visibilityOpts = {};
    return this;
  }

  /**
   * Clone the builder
   */
  clone(): SearchBuilder {
    const cloned = new SearchBuilder();
    cloned.filters = { ...this.filters };
    cloned.resultOpts = { ...this.resultOpts };
    cloned.sortOpts = [...this.sortOpts];
    cloned.visibilityOpts = { ...this.visibilityOpts };
    return cloned;
  }
}

/**
 * Create a new search builder
 */
export function createSearchBuilder(): SearchBuilder {
  return new SearchBuilder();
}
