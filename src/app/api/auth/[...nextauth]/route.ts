import NextAuth from 'next-auth'
import SteamProvider from 'next-auth-steam'
import GoogleProvider from 'next-auth/providers/google'
import crypto from 'crypto'

import type { NextRequest } from 'next/server'

const mockSalt = process.env.STEAM_VHASH_SOURCE!

const steamOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/steam`;

const googleOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/google`;

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return NextAuth(req, ctx, {
    secret: process.env.NEXTAUTH_SECRET!,
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
    ],
    callbacks: {
      async jwt(param) {
        if (param?.account?.provider === 'steam') {
          param.token.steam = param.profile

          const steamId = (param.profile as any).steamid!

          if (!steamId) {
            const p = JSON.stringify(param)
            throw new Error(`No steam_id found in profile ${p}`)
          }

          const steamProfile = param.profile as SteamUserProfile
          delete steamProfile.steamid

          const verificationHash = crypto
            .createHash('sha256')
            .update(`${steamId}${mockSalt}`)
            .digest('hex')

          const jsonBody = JSON.stringify({
            v_hash: verificationHash,
            steam: {
              id: steamId,
              communityvisibilitystate: steamProfile.communityvisibilitystate,
              profilestate: steamProfile.profilestate,
              personaname: steamProfile.personaname,
              profileurl: steamProfile.profileurl,
              avatar: steamProfile.avatar,
              avatarmedium: steamProfile.avatarmedium,
              avatarfull: steamProfile.avatarfull,
              avatarhash: steamProfile.avatarhash,
              personastate: steamProfile.personastate,
              realname: steamProfile.realname,
              primaryclanid: steamProfile.primaryclanid,
              personastateflags: steamProfile.personastateflags,
              timecreated: new Date(steamProfile.timecreated * 1000).toISOString()
            },
          })

          const ctoken = await fetch(steamOnboardingApiRoute, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: jsonBody,
          });

          if (!ctoken.ok) {
            throw new Error(await ctoken.text())
          }

          const { uid, rid } = await ctoken.json()

          param.token.rid = rid
          param.token.uid = uid
        }

        if (param?.account?.provider === 'google') {
          param.token.google = param.profile as GoogleProfile

          const googleProfile = param.profile as GoogleProfile
          delete googleProfile.sub

          const googleId = (param.profile as any).email!

          const verificationHash = crypto
          .createHash('sha256')
          .update(`${googleId}${mockSalt}`)
          .digest('hex')

          const jsonBody = JSON.stringify({ ...googleProfile, v_hash: verificationHash })

          const ctoken = await fetch(googleOnboardingApiRoute, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: jsonBody
          });

          if (!ctoken.ok) {
            throw new Error(await ctoken.text())
          }

          const { uid, rid } = await ctoken.json()

          param.token.rid = rid
          param.token.uid = uid
        }

        return param.token
      },
      session({ session, token }) {
        if ('steam' in token) {
          // @ts-expect-error
          session.user.steam = token.steam
        }

        if ('google' in token) {
          // @ts-expect-error
          session.user.google = token.google
        }

        return session
      }
    }
  })
}

export {
  handler as GET,
  handler as POST
}

