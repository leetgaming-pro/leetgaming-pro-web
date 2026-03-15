/**
 * NextAuth Options (for use with getServerSession)
 * Shared auth configuration for server-side session access
 *
 * IMPORTANT: This must mirror the session/JWT callbacks from route.ts
 * so that getServerSession() returns consistent data for ALL providers
 * (Steam, Google, Credentials). The providers array here only needs
 * Google (Steam requires request context), but the callbacks handle
 * all provider data stored in the JWT.
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// GoogleProfile and SteamUserProfile are declared globally in types/next-auth.d.ts

function getNextAuthSecret(): string {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;

  if (!nextAuthSecret && process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: NEXTAUTH_SECRET environment variable is required in production",
    );
  }

  return nextAuthSecret || "dev-secret-do-not-use-in-prod";
}

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  pages: {
    signIn: "/signin",
    error: "/api/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days — reduced from 30 for financial platform security
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Must mirror route.ts redirect callback
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.origin === baseObj.origin) return url;
      } catch {
        // Invalid URL — fall through to default
      }
      return `${baseUrl}/match-making`;
    },
    async jwt({ token, account, profile }) {
      // Preserve existing token data from any provider
      // Note: The actual sign-in flow runs in route.ts which writes
      // steam/google/rid/uid to the JWT. This callback just needs to
      // preserve them on subsequent calls (token rotation).
      if (account?.provider === "google") {
        token.google = profile as GoogleProfile;
      }
      return token;
    },
    session({ session, token }) {
      // Propagate ALL provider data from JWT to session
      // This must match route.ts session callback for consistency
      if (token.steam) {
        session.user.steam = token.steam as SteamUserProfile;
      }
      if (token.google) {
        session.user.google = token.google;
      }
      if (token.rid) {
        session.user.rid = token.rid as string;
      }
      if (token.uid) {
        session.user.uid = token.uid as string;
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
};
