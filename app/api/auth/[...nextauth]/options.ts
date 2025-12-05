/**
 * NextAuth Options (for use with getServerSession)
 * Shared auth configuration for server-side session access
 */

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// GoogleProfile is declared globally in types/next-auth.d.ts

/**
 * Base auth options for getServerSession calls
 * Note: Steam provider requires request context and is handled in route.ts
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: '/signin',
    error: '/api/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Preserve existing token data
      if (account?.provider === 'google') {
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
