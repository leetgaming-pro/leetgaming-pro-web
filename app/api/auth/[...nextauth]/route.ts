import NextAuth from "next-auth";
import SteamProvider from "next-auth-steam";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

import type { NextRequest } from "next/server";
import { normalizeServerRedirectUrl } from "@/lib/auth/callback-url";

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function getRequestBaseUrl(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = forwardedHost || req.headers.get("host") || req.nextUrl.host;

  const forwardedProto = req.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim()
    .replace(/:$/, "");

  const requestProto = req.nextUrl.protocol.replace(/:$/, "");
  const hostname = (forwardedHost || req.headers.get("host") || req.nextUrl.host)
    .replace(/^\[/, "")
    .replace(/\](:\d+)?$/, "")
    .split(":")[0]
    .toLowerCase();

  const protocol =
    forwardedProto ||
    requestProto ||
    (LOCALHOST_HOSTNAMES.has(hostname) ? "http" : "https");

  return `${protocol}://${host}`;
}

function getVerificationSalt(): string {
  const salt = process.env.STEAM_VHASH_SOURCE;

  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: STEAM_VHASH_SOURCE environment variable is required in production",
    );
  }

  return salt || "";
}

const steamOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/steam`;
const googleOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/google`;
const emailOnboardingApiRoute = `${process.env.REPLAY_API_URL}/onboarding/email`;
const emailLoginApiRoute = `${process.env.REPLAY_API_URL}/auth/login`;

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } },
) {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const requestBaseUrl = getRequestBaseUrl(req);

  if (!nextAuthSecret && process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: NEXTAUTH_SECRET environment variable is required in production",
    );
  }

  return NextAuth(req, ctx, {
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
      ...(process.env.STEAM_SECRET
        ? [
            SteamProvider(req, {
              clientSecret: process.env.STEAM_SECRET,
              callbackUrl: `${requestBaseUrl}/api/auth/callback`,
            }),
          ]
        : []),
      ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      !process.env.GOOGLE_CLIENT_ID.includes("placeholder")
        ? [
            GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code",
                },
              },
            }),
          ]
        : []),
      CredentialsProvider({
        id: "email-password",
        name: "Email",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          action: { label: "Action", type: "text" },
          displayName: { label: "Display Name", type: "text" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const email = credentials.email;
          const password = credentials.password;
          const action = credentials.action || "login";
          const displayName = credentials.displayName || "";

          const verificationHash = crypto
            .createHash("sha256")
            .update(`${email}${getVerificationSalt()}`)
            .digest("hex");

          const apiRoute =
            action === "signup" ? emailOnboardingApiRoute : emailLoginApiRoute;

          const body: Record<string, string> = {
            email,
            password,
            v_hash: verificationHash,
          };

          if (action === "signup" && displayName) {
            body.display_name = displayName;
          }

          try {
            const response = await fetch(apiRoute, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("Email auth API error:", errorText);
              throw new Error(
                response.status === 401
                  ? "Invalid credentials"
                  : "Authentication failed",
              );
            }

            const userData = await response.json();
            const rid =
              response.headers.get("X-Resource-Owner-ID") ?? undefined;
            const uid = userData.resource_owner?.user_id || userData.id;

            return {
              id: uid || email,
              email,
              name: userData.display_name || email.split("@")[0],
              rid,
              uid,
            };
          } catch (error) {
            console.error("Email auth request failed:", error);
            throw error;
          }
        },
      }),
    ],
    callbacks: {
      async redirect({ url, baseUrl }) {
        const normalizedBaseUrl = requestBaseUrl || baseUrl;
        return normalizeServerRedirectUrl(
          url,
          normalizedBaseUrl,
          "/match-making",
        );
      },
      async jwt(param) {
        if (param?.account?.provider === "steam") {
          try {
            param.token.steam = param.profile as SteamUserProfile | undefined;

            const steamProfile = param.profile as SteamUserProfile;
            const steamId = steamProfile?.steamid;

            if (!steamId) {
              console.error("No steam_id found in profile", param.profile);
              return param.token;
            }

            const { steamid: _omitSteamId, ...profileWithoutSteamId } =
              steamProfile;

            const verificationHash = crypto
              .createHash("sha256")
              .update(`${steamId}${getVerificationSalt()}`)
              .digest("hex");

            const jsonBody = JSON.stringify({
              v_hash: verificationHash,
              steam: {
                id: steamId,
                communityvisibilitystate:
                  profileWithoutSteamId.communityvisibilitystate,
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
                timecreated: new Date(
                  profileWithoutSteamId.timecreated * 1000,
                ).toISOString(),
              },
            });

            try {
              const ctoken = await fetch(steamOnboardingApiRoute, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: jsonBody,
              });

              if (ctoken.ok) {
                const userData = await ctoken.json();
                const rid =
                  ctoken.headers.get("X-Resource-Owner-ID") ?? undefined;
                const uid = userData.resource_owner?.user_id || userData.id;

                param.token.rid = rid;
                param.token.uid = uid;
              } else {
                console.error(
                  "Steam onboarding API error:",
                  await ctoken.text(),
                );
              }
            } catch (apiError) {
              console.error("Steam onboarding API request failed:", apiError);
            }
          } catch (error) {
            console.error("Error processing Steam authentication:", error);
          }
        }

        if (param?.account?.provider === "google") {
          try {
            const googleProfileFull = param.profile as GoogleProfile;
            param.token.google = googleProfileFull;

            const { sub: _omitSub, ...googleProfile } = googleProfileFull;
            const googleId = googleProfileFull.email;

            if (!googleId) {
              console.error("No email found in Google profile", param.profile);
              return param.token;
            }

            const verificationHash = crypto
              .createHash("sha256")
              .update(`${googleId}${getVerificationSalt()}`)
              .digest("hex");

            const jsonBody = JSON.stringify({
              ...googleProfile,
              v_hash: verificationHash,
            });

            try {
              const ctoken = await fetch(googleOnboardingApiRoute, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: jsonBody,
              });

              if (ctoken.ok) {
                const userData = await ctoken.json();
                const rid =
                  ctoken.headers.get("X-Resource-Owner-ID") ?? undefined;
                const uid = userData.resource_owner?.user_id || userData.id;

                param.token.rid = rid;
                param.token.uid = uid;
              } else {
                console.error(
                  "Google onboarding API error:",
                  await ctoken.text(),
                );
              }
            } catch (apiError) {
              console.error("Google onboarding API request failed:", apiError);
            }
          } catch (error) {
            console.error("Error processing Google authentication:", error);
          }
        }

        if (param?.account?.provider === "email-password") {
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

        return param.token;
      },
      session({ session, token }) {
        if (token.steam) {
          session.user.steam = token.steam;
        }

        if (token.google) {
          session.user.google = token.google;
        }

        if (token.rid) {
          session.user.rid = token.rid;
        }

        if (token.uid) {
          session.user.uid = token.uid;
          session.user.id = token.uid; // Also set as id for compatibility
        }

        return session;
      },
    },
    logger: {
      error: (code, metadata) => {
        console.error("[NextAuth Error]", code, metadata);
      },
      warn: (code) => {
        console.warn("[NextAuth Warn]", code);
      },
      debug: (_code, _metadata) => {
        // intentionally empty
      },
    },
    debug: process.env.NODE_ENV !== "production",
  });
}

export { handler as GET, handler as POST };
