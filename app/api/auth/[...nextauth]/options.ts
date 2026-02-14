/**
 * NextAuth Options (for use with getServerSession)
 * Shared auth configuration for server-side session access
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// GoogleProfile is declared globally in types/next-auth.d.ts

/**
 * Base auth options for getServerSession calls
 * Note: Steam provider requires request context and is handled in route.ts
 */
// Fail fast if NEXTAUTH_SECRET is not configured — prevents JWT forgery with empty string signing
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "CRITICAL: NEXTAUTH_SECRET environment variable is required in production",
  );
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret || "dev-secret-do-not-use-in-prod",
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
    async jwt({ token, account, profile }) {
      // Preserve existing token data
      if (account?.provider === "google") {
        token.google = profile as GoogleProfile;
      }
      return token;
    },
    session({ session, token }) {
      // Add custom fields from token to session
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
