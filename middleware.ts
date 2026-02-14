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

/**
 * Get CSP connect-src from environment variable or use defaults
 * Env var format: space-separated list of allowed origins
 */
const getConnectSrc = (): string => {
  const envConnectSrc = process.env.NEXT_PUBLIC_CSP_CONNECT_SRC;
  if (envConnectSrc) {
    return `connect-src 'self' ${envConnectSrc}`;
  }
  // Default allowed origins for development and production
  const defaultOrigins = [
    "http://localhost:8080",
    "http://localhost:4991",
    "https://api.leetgaming.pro",
    "http://replay.leetgaming.pro",
    "https://steamcommunity.com",
    "https://accounts.google.com",
    "https://api.iconify.design",
    "https://api.unisvg.com",
    "https://api.simplesvg.com",
  ].join(" ");
  return `connect-src 'self' ${defaultOrigins}`;
};

/**
 * Security headers to prevent common attacks
 */
const securityHeaders = {
  // Content Security Policy - prevents XSS attacks
  "Content-Security-Policy": [
    "default-src 'self'",
    // Production: use nonce-based CSP (Next.js 14 supports this)
    // Development: unsafe-eval needed for HMR
    process.env.NODE_ENV === "production"
      ? "script-src 'self' 'unsafe-inline'" // unsafe-inline still needed for Next.js hydration
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    getConnectSrc(),
    "frame-ancestors 'none'", // Prevent clickjacking
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests", // Force HTTPS for all subresources
  ].join("; "),

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
  // Only in production with HTTPS
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  }),
};

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

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
