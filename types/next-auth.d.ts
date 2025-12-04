/**
 * NextAuth Type Extensions
 * Extends default NextAuth types to include custom fields for RID token management
 */

import 'next-auth';
import 'next-auth/jwt';
import { IdentifierSourceType } from './replay-api/entities.types';

/**
 * Steam profile from OpenID
 */
declare global {
  interface SteamUserProfile {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    avatarhash: string;
    personastate: number;
    realname?: string;
    primaryclanid?: string;
    timecreated: number;
    personastateflags: number;
  }

  interface GoogleProfile {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale?: string;
  }
}

declare module 'next-auth' {
  /**
   * Extended Session with custom fields
   */
  interface Session {
    user: {
      /** User's unique identifier from backend */
      id?: string;
      /** User's display name */
      name?: string | null;
      /** User's email address */
      email?: string | null;
      /** User's profile image */
      image?: string | null;
      /** Steam profile data if authenticated via Steam */
      steam?: SteamUserProfile;
      /** Google profile data if authenticated via Google */
      google?: GoogleProfile;
      /** Resource Identity Token for multi-tenant access control */
      rid?: string;
      /** User ID from backend */
      uid?: string;
    };
  }

  /**
   * Extended User with custom fields
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    steam?: SteamUserProfile;
    google?: GoogleProfile;
    rid?: string;
    uid?: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT Token with custom fields
   */
  interface JWT {
    /** User's unique identifier */
    sub?: string;
    /** Steam profile data */
    steam?: SteamUserProfile;
    /** Google profile data */
    google?: GoogleProfile;
    /** Resource Identity Token */
    rid?: string;
    /** User ID from backend */
    uid?: string;
    /** Token expiration timestamp */
    exp?: number;
    /** Token issued at timestamp */
    iat?: number;
  }
}

export {};
