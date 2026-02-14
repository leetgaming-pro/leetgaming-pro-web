import { IntendedAudienceKey, VisibilityTypeKey } from "./settings";

// Define BaseEntity interface locally to avoid circular dependency
interface BaseEntity {
  id: string;
  visibility_level: IntendedAudienceKey;
  visibility_type: VisibilityTypeKey;
  resource_owner: ResourceOwner;
  created_at: Date;
  updated_at: Date;
}

export type ReplayFileStatus =
  | "Pending"
  | "Processing"
  | "Failed"
  | "Completed"
  | "Ready";

/**
 * Default TeamPRO tenant ID
 * From replay-api/pkg/domain/resource_owner.go
 */
export const DEFAULT_TENANT_ID = "a3a80810-f91c-4391-9eff-6d47a13bebde";

/**
 * Default TeamPRO client application ID
 * From replay-api/pkg/domain/resource_owner.go
 */
export const DEFAULT_CLIENT_ID = "ff96c01f-a741-4429-a0cd-2868d408c42f";

/**
 * Hierarchical resource ownership model
 * Represents tenant → client → group → user ownership chain
 * Based on replay-api/pkg/domain/resource_owner.go
 */
export class ResourceOwner {
  tenantId: string;
  clientId: string;
  groupId: string | null;
  userId: string | null;

  constructor(
    tenantId: string = DEFAULT_TENANT_ID,
    clientId: string = DEFAULT_CLIENT_ID,
    groupId: string | null = null,
    userId: string | null = null
  ) {
    this.tenantId = tenantId;
    this.clientId = clientId;
    this.groupId = groupId;
    this.userId = userId;
  }

  /**
   * Check if this is tenant-level ownership (no client, group, or user)
   */
  isTenant(): boolean {
    return !this.clientId && !this.groupId && !this.userId;
  }

  /**
   * Check if this is client-level ownership (has tenant + client, no group or user)
   */
  isClient(): boolean {
    return !!this.tenantId && !!this.clientId && !this.groupId && !this.userId;
  }

  /**
   * Check if this is group-level ownership (has tenant + group, no user)
   */
  isGroup(): boolean {
    return !!this.tenantId && !!this.groupId && !this.userId;
  }

  /**
   * Check if this is user-level ownership (full hierarchy)
   */
  isUser(): boolean {
    return !!this.tenantId && !!this.userId;
  }

  /**
   * Get the ownership level as a string
   */
  getLevel(): "tenant" | "client" | "group" | "user" {
    if (this.isUser()) return "user";
    if (this.isGroup()) return "group";
    if (this.isClient()) return "client";
    return "tenant";
  }

  /**
   * Create a ResourceOwner from a user ID (creates full hierarchy with defaults)
   */
  static fromUser(
    userId: string,
    groupId: string | null = null
  ): ResourceOwner {
    return new ResourceOwner(
      DEFAULT_TENANT_ID,
      DEFAULT_CLIENT_ID,
      groupId,
      userId
    );
  }

  /**
   * Create a ResourceOwner from a group ID
   */
  static fromGroup(groupId: string): ResourceOwner {
    return new ResourceOwner(
      DEFAULT_TENANT_ID,
      DEFAULT_CLIENT_ID,
      groupId,
      null
    );
  }

  /**
   * Create a client-level ResourceOwner
   */
  static fromClient(clientId: string = DEFAULT_CLIENT_ID): ResourceOwner {
    return new ResourceOwner(DEFAULT_TENANT_ID, clientId, null, null);
  }

  /**
   * Create a tenant-level ResourceOwner
   */
  static fromTenant(tenantId: string = DEFAULT_TENANT_ID): ResourceOwner {
    return new ResourceOwner(tenantId, "", null, null);
  }

  /**
   * Serialize to API-compatible format
   */
  toJSON(): {
    tenant_id: string;
    client_id: string;
    group_id: string | null;
    user_id: string | null;
  } {
    return {
      tenant_id: this.tenantId,
      client_id: this.clientId,
      group_id: this.groupId,
      user_id: this.userId,
    };
  }

  /**
   * Deserialize from API response
   */
  static fromJSON(data: {
    tenant_id?: string;
    client_id?: string;
    group_id?: string | null;
    user_id?: string | null;
  }): ResourceOwner {
    return new ResourceOwner(
      data.tenant_id || DEFAULT_TENANT_ID,
      data.client_id || DEFAULT_CLIENT_ID,
      data.group_id || null,
      data.user_id || null
    );
  }

  /**
   * Get the primary identifier (user > group > client > tenant)
   */
  getPrimaryId(): string {
    return this.userId || this.groupId || this.clientId || this.tenantId;
  }
}

/**
 * Helper function to safely get the primary ID from a ResourceOwner-like object
 * Works with both class instances and plain JSON objects from API responses
 */
export function getResourceOwnerPrimaryId(
  owner:
    | ResourceOwner
    | {
        user_id?: string | null;
        group_id?: string | null;
        client_id?: string | null;
        tenant_id?: string | null;
        userId?: string | null;
        groupId?: string | null;
        clientId?: string | null;
        tenantId?: string | null;
      }
    | null
    | undefined
): string {
  if (!owner) return "Unknown";

  // If it's a class instance with the method
  if (typeof (owner as ResourceOwner).getPrimaryId === "function") {
    return (owner as ResourceOwner).getPrimaryId();
  }

  // Handle snake_case (from API JSON) or camelCase properties
  const userId = (owner as any).user_id || (owner as any).userId;
  const groupId = (owner as any).group_id || (owner as any).groupId;
  const clientId = (owner as any).client_id || (owner as any).clientId;
  const tenantId = (owner as any).tenant_id || (owner as any).tenantId;

  return userId || groupId || clientId || tenantId || "Unknown";
}

export class ReplayFile implements BaseEntity {
  id: string;
  visibility_level: IntendedAudienceKey;
  visibility_type: VisibilityTypeKey;
  resource_owner: ResourceOwner;
  created_at: Date;
  updated_at: Date;
  game_id: string;
  network_id: string;
  size: number;
  uri: string;
  status: ReplayFileStatus;
  error?: string;
  header?: any;
  // Extended metadata from Header field
  matchId?: string;
  duration?: number;
  map?: string;
  mode?: string;
  players?: string[];
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: "public" | "private" | "unlisted";
  views?: number;
  likes?: number;

  constructor(
    id: string,
    visibility_level: IntendedAudienceKey,
    visibility_type: VisibilityTypeKey,
    resource_owner: ResourceOwner,
    created_at: Date,
    updated_at: Date,
    game_id: string,
    network_id: string,
    size: number,
    uri: string,
    status: ReplayFileStatus,
    error?: string,
    header?: any
  ) {
    this.id = id;
    this.visibility_level = visibility_level;
    this.visibility_type = visibility_type;
    this.resource_owner = resource_owner;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.game_id = game_id;
    this.network_id = network_id;
    this.size = size;
    this.uri = uri;
    this.status = status;
    this.error = error;
    this.header = header;
  }
}
