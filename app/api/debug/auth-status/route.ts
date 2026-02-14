/**
 * Debug endpoint to check authentication status
 * This helps diagnose why RID is not being synced
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const RID_TOKEN_COOKIE = "rid_token";
const RID_METADATA_COOKIE = "rid_metadata";

interface ExtendedSessionUser {
  email?: string | null;
  name?: string | null;
  rid?: string;
  uid?: string;
  id?: string;
  steam?: unknown;
  google?: unknown;
}

export async function GET(_request: NextRequest) {
  // Only allow in development - never expose in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 404 },
    );
  }

  try {
    // Get NextAuth session with authOptions for complete session data
    const session = await getServerSession(authOptions);

    // Get cookies
    const cookieStore = cookies();
    const ridToken = cookieStore.get(RID_TOKEN_COOKIE)?.value;
    const ridMetadata = cookieStore.get(RID_METADATA_COOKIE)?.value;
    const allCookies = cookieStore.getAll();

    // Parse metadata if present
    let metadata = null;
    if (ridMetadata) {
      try {
        metadata = JSON.parse(ridMetadata);
      } catch {
        metadata = { error: "Failed to parse metadata" };
      }
    }

    // Build diagnostic response
    const user = session?.user as ExtendedSessionUser | undefined;
    const status = {
      timestamp: new Date().toISOString(),
      nextAuthSession: {
        hasSession: !!session,
        user: user
          ? {
              email: user.email,
              name: user.name,
              rid: user.rid,
              uid: user.uid,
              id: user.id,
              hasSteam: !!user.steam,
              hasGoogle: !!user.google,
            }
          : null,
        expires: session?.expires,
      },
      ridCookies: {
        hasRidToken: !!ridToken,
        ridTokenPrefix: ridToken?.substring(0, 8),
        hasMetadata: !!ridMetadata,
        metadata: metadata,
      },
      allCookieNames: allCookies.map((c) => c.name),
      diagnosis: {
        hasSessionWithRid: !!user?.rid,
        hasCookiesSet: !!ridToken && !!ridMetadata,
        authSyncShouldRun: !!user?.rid && !ridToken,
      },
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("[Debug Auth Status] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
