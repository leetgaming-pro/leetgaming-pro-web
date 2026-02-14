/**
 * RID refresh endpoint
 * Fetches RID for an authenticated user whose session is missing the RID
 * This can happen if the user logged in before RID was properly implemented
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import crypto from "crypto";
import { getBackendUrl } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

const REPLAY_API_BASE = getBackendUrl();
const verificationSalt =
  process.env.GOOGLE_VERIFICATION_SALT ||
  process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_SALT ||
  "";

interface SessionUser {
  email?: string | null;
  name?: string | null;
  google?: {
    sub: string;
    email?: string;
  };
  steam?: {
    steamid: string;
    personaname?: string;
  };
  rid?: string;
  uid?: string;
}

export async function POST(_request: NextRequest) {
  try {
    // Get the current session (App Router: no authOptions needed)
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // If already has RID, return it
    if (user.rid) {
      return NextResponse.json({
        rid: user.rid,
        uid: user.uid,
        status: "already_present",
      });
    }

    // Try to fetch RID from backend based on provider
    let rid: string | undefined;
    let uid: string | undefined;

    // Try Google first
    if (user.google?.sub || user.email) {
      const googleId = user.google?.sub || "";
      const googleEmail = user.google?.email || user.email || "";

      const verificationHash = crypto
        .createHash("sha256")
        .update(`${googleId}${verificationSalt}`)
        .digest("hex");

      try {
        const response = await fetch(`${REPLAY_API_BASE}/identity/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sub: googleId,
            email: googleEmail,
            email_verified: true,
            name: user.name || googleEmail,
            v_hash: verificationHash,
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          rid = response.headers.get("X-Resource-Owner-ID") || undefined;
          uid = userData.resource_owner?.user_id || userData.id;
        } else {
          console.error(
            "[RID Refresh] Google onboarding failed:",
            await response.text(),
          );
        }
      } catch (error) {
        console.error("[RID Refresh] Google onboarding request failed:", error);
      }
    }

    // Try Steam if Google didn't work
    if (!rid && user.steam?.steamid) {
      const steamId = user.steam.steamid;

      const verificationHash = crypto
        .createHash("sha256")
        .update(`${steamId}${verificationSalt}`)
        .digest("hex");

      try {
        const response = await fetch(`${REPLAY_API_BASE}/identity/steam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            v_hash: verificationHash,
            steam: {
              id: steamId,
              personaname: user.steam.personaname || "",
            },
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          rid = response.headers.get("X-Resource-Owner-ID") || undefined;
          uid = userData.resource_owner?.user_id || userData.id;
        } else {
          console.error(
            "[RID Refresh] Steam onboarding failed:",
            await response.text(),
          );
        }
      } catch (error) {
        console.error("[RID Refresh] Steam onboarding request failed:", error);
      }
    }

    if (!rid) {
      return NextResponse.json(
        {
          error: "Could not obtain RID",
          status: "failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      rid,
      uid,
      status: "refreshed",
    });
  } catch (error) {
    console.error("[RID Refresh] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
