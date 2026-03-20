/**
 * Next.js Middleware for security headers, request handling, and route protection
 * Runs on every request before reaching route handlers
 *
 * Security features:
 * - CSP, X-Frame-Options, X-Content-Type-Options, HSTS
 * - Route-based auth enforcement for financial paths
 * - Request ID tracing
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type CSPMode = "strict" | "relaxed-localhost";

/**
 * Financial API paths that MUST have authentication
 * Middleware provides defense-in-depth — individual route handlers also check auth
 */
const PROTECTED_API_PATHS = [
  "/api/wallet/",
  "/api/payments/",
  "/api/match-making/prize-pools/",
  "/api/subscriptions/",
];

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Get CSP connect-src from environment variable or use defaults
 * Env var format: space-separated list of allowed origins
 */
const getConnectSrc = (): string => {
  const envConnectSrc = process.env.NEXT_PUBLIC_CSP_CONNECT_SRC;
  if (envConnectSrc) {
    // Auto-add ws:// variants for any http:// origins
    const wsOrigins = envConnectSrc
      .split(' ')
      .filter(o => o.startsWith('http://'))
      .map(o => o.replace('http://', 'ws://'));
    const wssOrigins = envConnectSrc
      .split(' ')
      .filter(o => o.startsWith('https://'))
      .map(o => o.replace('https://', 'wss://'));
    const allOrigins = [envConnectSrc, ...wsOrigins, ...wssOrigins].join(' ');
    return `connect-src 'self' ${allOrigins}`;
  }
  // Default allowed origins for development and production
  const defaultOrigins = [
    "http://localhost:8080",
    "ws://localhost:8080",
    "http://localhost:4991",
    "ws://localhost:4991",
    "https://api.leetgaming.pro",
    "wss://api.leetgaming.pro",
    "https://replay.leetgaming.pro",
    "wss://replay.leetgaming.pro",
    "https://steamcommunity.com",
    "https://accounts.google.com",
    "https://api.iconify.design",
    "https://api.unisvg.com",
    "https://api.simplesvg.com",
  ].join(" ");
  return `connect-src 'self' ${defaultOrigins}`;
};

function getRequestHostname(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost?.split(",")[0].trim();

  if (!hostHeader) {
    return request.nextUrl.hostname.toLowerCase();
  }

  if (hostHeader.startsWith("[")) {
    const closingBracketIndex = hostHeader.indexOf("]");
    if (closingBracketIndex > 1) {
      return hostHeader.slice(1, closingBracketIndex).toLowerCase();
    }
  }

  return hostHeader.split(":")[0].toLowerCase();
}

function isLocalhostRequest(request: NextRequest): boolean {
  return LOCALHOST_HOSTNAMES.has(getRequestHostname(request));
}

function getRequestProtocol(request: NextRequest): string {
  return request.nextUrl.protocol.replace(/:$/, "") || "https";
}

function getCSPMode(): CSPMode {
  return process.env.WEB_CSP_MODE === "relaxed-localhost"
    ? "relaxed-localhost"
    : "strict";
}

function shouldUseRelaxedScriptPolicy(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return getCSPMode() === "relaxed-localhost" && isLocalhostRequest(request);
}

/**
 * Security headers to prevent common attacks (static, non-CSP)
 */
function getStaticSecurityHeaders(request: NextRequest): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Prevent clickjacking attacks
    "X-Frame-Options": "DENY",

    // Enable XSS protection in older browsers
    "X-XSS-Protection": "1; mode=block",

    // Referrer policy - control information sent to other sites
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions policy - control browser features
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()", // Disable FLoC tracking
    ].join(", "),

    // HTTPS enforcement (Strict-Transport-Security)
    // Skip localhost because local Kind is intentionally accessed over HTTP.
    ...(process.env.NODE_ENV === "production" &&
      !isLocalhostRequest(request) && {
        "Strict-Transport-Security":
          "max-age=63072000; includeSubDomains; preload",
      }),

    // Post-quantum cryptography signal
    // Informs clients and gateway proxies that this service uses ML-KEM-768 /
    // ML-DSA-65 hybrid cryptography (NIST FIPS 203/204/205).
    "X-Security-Policy": "pq-hybrid",
  };
}

/**
 * Build per-request CSP header with a unique nonce for script-src.
 * SECURITY: nonce-based CSP removes the need for 'unsafe-inline' in script-src,
 * preventing XSS via inline script injection.
 */
function buildCSP(request: NextRequest, nonce: string): string {
  const useRelaxedScriptPolicy = shouldUseRelaxedScriptPolicy(request);

  return [
    "default-src 'self'",
    // SECURITY: nonce-based script-src prevents XSS inline script injection.
    // 'unsafe-inline' kept as fallback for browsers that don't support nonces (CSP2).
    // When a nonce is present, modern browsers ignore 'unsafe-inline'.
    useRelaxedScriptPolicy
      ? `script-src 'self' blob: 'unsafe-eval' 'unsafe-inline'`
      : `script-src 'self' blob: 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "worker-src 'self' blob:",
    getConnectSrc(),
    "frame-ancestors 'none'", // Prevent clickjacking
    "base-uri 'self'",
    "form-action 'self' https://steamcommunity.com https://accounts.google.com",
    // Only force HTTPS upgrade for non-localhost production domains.
    ...(process.env.NODE_ENV === "production" && !isLocalhostRequest(request)
      ? ["upgrade-insecure-requests"]
      : []),
  ].join("; ");
}

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  // Generate per-request nonce for CSP script-src
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  if (!requestHeaders.get("x-forwarded-host")) {
    requestHeaders.set("x-forwarded-host", request.headers.get("host") || request.nextUrl.host);
  }

  if (!requestHeaders.get("x-forwarded-proto")) {
    requestHeaders.set("x-forwarded-proto", getRequestProtocol(request));
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const pathname = request.nextUrl.pathname;

  // Apply static security headers
  Object.entries(getStaticSecurityHeaders(request)).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply per-request CSP with nonce
  response.headers.set("Content-Security-Policy", buildCSP(request, nonce));

  // Pass nonce to Next.js for inline script injection (request + response headers)
  response.headers.set("X-Nonce", nonce);

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set("X-Request-ID", requestId);

  // --- Route-based auth enforcement for financial API paths ---
  // Defense-in-depth: individual route handlers also validate auth
  if (request.method !== "GET") {
    const isProtectedPath = PROTECTED_API_PATHS.some((path) =>
      pathname.startsWith(path),
    );
    if (isProtectedPath) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token?.email) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401, headers: { "X-Request-ID": requestId } },
        );
      }
    }
  }

  // Log API requests in development
  if (process.env.NODE_ENV === "development" && pathname.startsWith("/api/")) {
    console.log(`[${requestId}] ${request.method} ${pathname}`);
  }

  return response;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)",
  ],
};
