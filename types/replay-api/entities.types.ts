import { ResourceOwner } from './replay-file';
import { IntendedAudienceKey, VisibilityTypeKey, GameIDKey, ShareTokenStatus, GrantType } from './settings';

/**
 * Identity provider sources
 * Based on replay-api/pkg/domain/profile.go
 */
export enum IdentifierSourceType {
    Steam = 'steam',
    Google = 'google',
    Discord = 'discord',
    Epic = 'epic',
}

/**
 * Profile type classification
 */
export enum ProfileType {
    User = 'user',
    Squad = 'squad',
    Player = 'player',
}

/**
 * Group type classification
 * Based on replay-api/pkg/domain/group.go
 */
export enum GroupType {
    Account = 'account',
    ProfileGroup = 'profile_group',
    System = 'system',
}

/**
 * Base entity interface with ownership and visibility
 * Based on replay-api/pkg/domain/entity.go
 */
export interface BaseEntity {
    id: string;
    visibility_level: IntendedAudienceKey;
    visibility_type: VisibilityTypeKey;
    resource_owner: ResourceOwner;
    created_at: Date;
    updated_at: Date;
}

/**
 * User entity
 * Based on replay-api/pkg/domain/user.go
 */
export interface User {
    id: string;
    name: string;
    resource_owner: ResourceOwner;
    profiles?: Record<IdentifierSourceType, Profile>;
    created_at: Date;
    updated_at: Date;
}

/**
 * Group entity
 * Based on replay-api/pkg/domain/group.go
 */
export interface Group {
    id: string;
    name: string;
    type: GroupType;
    resource_owner: ResourceOwner;
    created_at: Date;
    updated_at: Date;
}

/**
 * Profile entity linking identity sources to users
 * Based on replay-api/pkg/domain/profile.go
 */
export interface Profile extends BaseEntity {
    rid_source: IdentifierSourceType;
    source_key: string;
    type: ProfileType;
    details: ProfileDetails;
}

export type ProfileDetails = any;

/**
 * Membership types for group participation
 * Based on replay-api/pkg/domain/membership.go
 */
export enum MembershipType {
    Owner = 'owner',
    Admin = 'admin',
    Member = 'member',
}

/**
 * Membership status
 */
export enum MembershipStatus {
    Active = 'active',
    Inactive = 'inactive',
    Pending = 'pending',
}

/**
 * Membership entity linking users to groups
 * Based on replay-api/pkg/domain/membership.go
 */
export interface Membership {
    id: string;
    user_id: string;
    group_id: string;
    type: MembershipType;
    status: MembershipStatus;
    resource_owner: ResourceOwner;
    created_at: Date;
    updated_at: Date;
}

/**
 * RID Token (Resource Identity Token) for authentication
 * Based on replay-api/pkg/domain/rid_token.go
 */
export interface RIDToken {
    id: string;
    key: string;
    source: IdentifierSourceType;
    resource_owner: ResourceOwner;
    intended_audience: IntendedAudienceKey;
    grant_type: GrantType;
    expires_at: Date;
    created_at: Date;
}

/**
 * Squad membership types
 * Based on replay-api/pkg/domain/squad.go
 */
export enum SquadMembershipType {
    Owner = 'owner',
    Captain = 'captain',
    Member = 'member',
}

/**
 * Squad membership status
 */
export enum SquadMembershipStatus {
    Active = 'active',
    Inactive = 'inactive',
    Invited = 'invited',
}

/**
 * Squad membership entry
 */
export interface SquadMembership {
    user_id: string;
    type: SquadMembershipType;
    status: SquadMembershipStatus;
    roles: string[];
}

export interface SquadHistory {
    user_id: string;
    action: string;
    created_at: Date;
}

/**
 * Squad entity (team/group)
 * Based on replay-api/pkg/domain/squad.go
 */
export interface Squad extends BaseEntity {
    game_id: GameIDKey;
    group_id: string;
    name: string;
    symbol: string;
    description: string;
    logo_uri?: string;
    slug_uri?: string;
    members: Record<string, SquadMembership>;
    profiles?: Record<string, ProfileDetails>;
    history?: SquadHistory[];
}

/**
 * Player profile entity (per-game player identity)
 * Based on replay-api/pkg/domain/player_profile.go
 */
export interface PlayerProfile extends BaseEntity {
    game_id: GameIDKey;
    nickname: string;
    slug_uri?: string;
    avatar_uri?: string;
    roles: string[];
    description?: string;
}

/**
 * Share token for resource sharing
 * Based on replay-api/pkg/domain/share_token.go
 */
export interface ShareToken extends BaseEntity {
    token: string;
    resource_type: string;
    resource_id: string;
    status: ShareTokenStatus;
    expires_at?: Date;
}

/**
 * Match entity
 * Based on replay-api/pkg/domain/match.go
 */
export interface Match extends BaseEntity {
    game_id: GameIDKey;
    replay_file_id: string;
    network_id: string;
    map_name: string;
    visibility: VisibilityTypeKey;
    share_tokens?: string[];
    metadata?: Record<string, any>;
}

/**
 * Round entity
 * Based on replay-api/pkg/domain/round.go
 */
export interface Round extends BaseEntity {
    match_id: string;
    number: number;
    winner_team_id?: string;
    mvp_player_id?: string;
    round_type?: string;
    end_reason?: string;
    tick_start?: number;
    tick_end?: number;
    metadata?: Record<string, any>;
}