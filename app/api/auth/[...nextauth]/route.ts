import NextAuth from 'next-auth'
import SteamProvider from 'next-auth-steam'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import crypto from 'crypto'

import type { NextRequest } from 'next/server'
import { getRIDTokenManager } from '@/types/replay-api/auth'
import { IdentifierSourceType } from '@/types/replay-api/entities.types'

const mockSalt = process.env.STEAM_VHASH_SOURCE!

const steamOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/steam`;

const googleOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/google`;

const emailOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/email`;

const emailLoginApiRoute = `${process.env.REPLAY_API_URL}/auth/login`;

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return NextAuth(req, ctx, {
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
      SteamProvider(req, {
        clientSecret: process.env.STEAM_SECRET!,
        callbackUrl: `${process.env.LEET_GAMING_PRO_URL}/api/auth/callback/`
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          },
        },
      }),
      CredentialsProvider({
        id: 'email-password',
        name: 'Email',
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          action: { label: "Action", type: "text" },
          displayName: { label: "Display Name", type: "text" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const email = credentials.email;
          const password = credentials.password;
          const action = credentials.action || 'login';
          const displayName = credentials.displayName || '';

          // Generate v_hash (same pattern as Steam/Google)
          const verificationHash = crypto
            .createHash('sha256')
            .update(`${email}${mockSalt}`)
            .digest('hex');

          const apiRoute = action === 'signup'
            ? emailOnboardingApiRoute
            : emailLoginApiRoute;

          const body: Record<string, string> = {
            email,
            password,
            v_hash: verificationHash,
          };

          if (action === 'signup' && displayName) {
            body.display_name = displayName;
          }

          try {
            const response = await fetch(apiRoute, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Email auth API error:', errorText);
              throw new Error(response.status === 401 ? 'Invalid credentials' : 'Authentication failed');
            }

            const userData = await response.json();
            const rid = response.headers.get('X-Resource-Owner-ID') ?? undefined;
            const uid = userData.resource_owner?.user_id || userData.id;

            return {
              id: uid || email,
              email,
              name: userData.display_name || email.split('@')[0],
              rid,
              uid,
            };
          } catch (error) {
            console.error('Email auth request failed:', error);
            throw error;
          }
        },
      }),
    ],
    callbacks: {
      async jwt(param) {
        // Only process account linking on initial sign in
        if (param?.account?.provider === 'steam') {
          try {
            param.token.steam = param.profile as SteamUserProfile | undefined

            const steamProfile = param.profile as SteamUserProfile
            const steamId = steamProfile?.steamid

            if (!steamId) {
              console.error('No steam_id found in profile', param.profile)
              // Return token without backend onboarding - allow basic auth
              return param.token
            }

            // Create a copy without steamid for the backend
            const { steamid: _omitSteamId, ...profileWithoutSteamId } = steamProfile

            const verificationHash = crypto
              .createHash('sha256')
              .update(`${steamId}${mockSalt}`)
              .digest('hex')

            const jsonBody = JSON.stringify({
              v_hash: verificationHash,
              steam: {
                id: steamId,
                communityvisibilitystate: profileWithoutSteamId.communityvisibilitystate,
                profilestate: profileWithoutSteamId.profilestate,
                personaname: profileWithoutSteamId.personaname,
                profileurl: profileWithoutSteamId.profileurl,
                avatar: profileWithoutSteamId.avatar,
                avatarmedium: profileWithoutSteamId.avatarmedium,
                avatarfull: profileWithoutSteamId.avatarfull,
                avatarhash: profileWithoutSteamId.avatarhash,
                personastate: profileWithoutSteamId.personastate,
                realname: profileWithoutSteamId.realname,
                primaryclanid: profileWithoutSteamId.primaryclanid,
                personastateflags: profileWithoutSteamId.personastateflags,
                timecreated: new Date(profileWithoutSteamId.timecreated * 1000).toISOString()
              },
            })

            try {
              const ctoken = await fetch(steamOnboardingApiRoute, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: jsonBody,
              });

              if (ctoken.ok) {
                // API returns user object in body and RID in headers
                const userData = await ctoken.json()
                const rid = ctoken.headers.get('X-Resource-Owner-ID') ?? undefined
                const uid = userData.resource_owner?.user_id || userData.id

                param.token.rid = rid
                param.token.uid = uid

                // Store RID token in manager for SDK usage (client-side only)
                if (typeof window !== 'undefined' && rid) {
                  getRIDTokenManager().setFromOnboarding({
                    profile: { id: '', rid_source: IdentifierSourceType.Steam, source_key: steamId },
                    rid,
                    user_id: uid
                  }).catch(err => console.error('Failed to set RID token:', err));
                }
              } else {
                console.error('Steam onboarding API error:', await ctoken.text())
                // Continue with Steam auth even if backend onboarding fails
              }
            } catch (apiError) {
              console.error('Steam onboarding API request failed:', apiError)
              // Continue with Steam auth even if backend is unavailable
            }
          } catch (error) {
            console.error('Error processing Steam authentication:', error)
            // Continue with basic Steam auth
          }
        }

        if (param?.account?.provider === 'google') {
          try {
            const googleProfileFull = param.profile as GoogleProfile
            param.token.google = googleProfileFull

            // Create a copy without sub for the backend
            const { sub: _omitSub, ...googleProfile } = googleProfileFull

            const googleId = googleProfileFull.email

            if (!googleId) {
              console.error('No email found in Google profile', param.profile)
              // Return token without backend onboarding - allow basic auth
              return param.token
            }

            const verificationHash = crypto
              .createHash('sha256')
              .update(`${googleId}${mockSalt}`)
              .digest('hex')

            const jsonBody = JSON.stringify({ ...googleProfile, v_hash: verificationHash })

            try {
              const ctoken = await fetch(googleOnboardingApiRoute, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: jsonBody
              });

              if (ctoken.ok) {
                // API returns user object in body and RID in headers
                const userData = await ctoken.json()
                const rid = ctoken.headers.get('X-Resource-Owner-ID') ?? undefined
                const uid = userData.resource_owner?.user_id || userData.id

                param.token.rid = rid
                param.token.uid = uid

                // Store RID token in manager for SDK usage (client-side only)
                if (typeof window !== 'undefined' && rid) {
                  getRIDTokenManager().setFromOnboarding({
                    profile: { id: '', rid_source: IdentifierSourceType.Google, source_key: googleId },
                    rid,
                    user_id: uid
                  }).catch(err => console.error('Failed to set RID token:', err));
                }
              } else {
                console.error('Google onboarding API error:', await ctoken.text())
                // Continue with Google auth even if backend onboarding fails
              }
            } catch (apiError) {
              console.error('Google onboarding API request failed:', apiError)
              // Continue with Google auth even if backend is unavailable
            }
          } catch (error) {
            console.error('Error processing Google authentication:', error)
            // Continue with basic Google auth
          }
        }

        // Handle email-password credentials provider
        if (param?.account?.provider === 'email-password') {
          // The authorize function already called the backend and got the RID
          // We just need to copy the values from user to token
          interface CredentialsUser {
            id: string;
            rid?: string;
            uid?: string;
            email?: string;
          }
          const user = param.user as CredentialsUser;
          if (user?.rid) {
            param.token.rid = user.rid;
          }
          if (user?.uid) {
            param.token.uid = user.uid;
          }
          if (user?.email) {
            param.token.email = user.email;
          }
        }

        return param.token
      },
      session({ session, token }) {
        // Add custom fields from token to session
        if (token.steam) {
          session.user.steam = token.steam
        }

        if (token.google) {
          session.user.google = token.google
        }

        // Add RID and UID from token to session
        if (token.rid) {
          session.user.rid = token.rid
        }

        if (token.uid) {
          session.user.uid = token.uid
          session.user.id = token.uid // Also set as id for compatibility
        }

        return session
      }
    },
    logger: {
      error: () => {}, // Suppress NextAuth internal logging errors
      warn: () => {},
      debug: () => {},
    },
    debug: false, // Disable debug mode to prevent _log endpoint calls
  })
}

export {
  handler as GET,
  handler as POST
}

