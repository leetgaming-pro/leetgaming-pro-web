const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const DEFAULT_APP_HOSTNAMES = ["leetgaming.pro", "www.leetgaming.pro"];

function normalizeHostname(hostname: string): string {
  return hostname
    .replace(/^\[/, "")
    .replace(/\](:\d+)?$/, "")
    .split(":")[0]
    .toLowerCase();
}

function extractConfiguredHostname(value?: string): string | null {
  if (!value) return null;

  try {
    return normalizeHostname(new URL(value).hostname);
  } catch {
    return null;
  }
}

function getAllowedAppHostnames(): Set<string> {
  const configuredHostnames = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ]
    .map(extractConfiguredHostname)
    .filter((hostname): hostname is string => Boolean(hostname));

  return new Set([
    ...DEFAULT_APP_HOSTNAMES,
    ...LOCALHOST_HOSTNAMES,
    ...configuredHostnames,
  ]);
}

function isAllowedAppUrl(url: URL): boolean {
  return getAllowedAppHostnames().has(normalizeHostname(url.hostname));
}

function getPathWithQueryAndHash(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function normalizeClientCallbackUrl(
  callbackUrl: string | null | undefined,
  currentOrigin: string,
  fallbackPath: string,
): string {
  if (!callbackUrl) {
    return fallbackPath;
  }

  if (callbackUrl.startsWith("/")) {
    return callbackUrl;
  }

  try {
    const parsed = new URL(callbackUrl, currentOrigin);

    if (parsed.origin === currentOrigin || isAllowedAppUrl(parsed)) {
      return getPathWithQueryAndHash(parsed);
    }
  } catch {
    // Fall back below
  }

  return fallbackPath;
}

export function normalizeServerRedirectUrl(
  url: string,
  requestBaseUrl: string,
  fallbackPath: string,
): string {
  const fallbackUrl = `${requestBaseUrl}${fallbackPath}`;

  if (!url) {
    return fallbackUrl;
  }

  if (url.startsWith("/")) {
    return `${requestBaseUrl}${url}`;
  }

  try {
    const parsed = new URL(url);
    const requestBase = new URL(requestBaseUrl);

    if (parsed.origin === requestBase.origin) {
      return parsed.toString();
    }

    if (isAllowedAppUrl(parsed)) {
      return `${requestBaseUrl}${getPathWithQueryAndHash(parsed)}`;
    }
  } catch {
    // Fall back below
  }

  return fallbackUrl;
}
