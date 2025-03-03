
export enum IdentifierSourceType {
    Steam = 'steam',
    Google = 'google',
}

export interface User {
    id: string,
    name: string,
    profiles: Record<IdentifierSourceType, Profile>,
    created_at: Date,
    updated_at: Date
}

export interface Profile {
    id: string,
    rid_source: IdentifierSourceType,
    source_key: string,
    details: ProfileDetails,
    created_at: Date,
    updated_at: Date
}

export type ProfileDetails = any

export enum MembershipType {
    Owner = 'owner',
    Admin = 'admin',
    Member = 'member',
}

export interface Membership {
    id: string,
    type: MembershipType,
    created_at: Date,
    updated_at: Date
}

export interface SquadHistory {
    user_id: string,
    action: string,
    created_at: Date,
}

export interface Squad {
    id : string,
    group_id : string,
    game_id : string,
    name : string,
    symbol : string,
    description : string,
    members : Record<string, Membership>,
    profiles : Record<string, ProfileDetails>, // ie.: github, faceit, steam, twitter/x, 
    history: SquadHistory[],
    created_at : Date,
    updated_at : Date
}
