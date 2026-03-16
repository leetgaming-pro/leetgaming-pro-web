const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "nextuipro.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // MetaMask SDK optionally references the React Native async-storage package
      // in browser builds. It is not needed for our web app and breaks Vercel
      // when webpack tries to resolve it from the RainbowKit connector graph.
      "@react-native-async-storage/async-storage": false,
    };

    return config;
  },
  // Proxy /api/* to the replay-api backend (for client-side requests to avoid CORS)
  async rewrites() {
    // In K8s, use internal service URL; locally, use localhost
    // IMPORTANT: Don't use NEXT_PUBLIC_* vars here as they are baked at build time with wrong value
    // REPLAY_API_URL is set at runtime in K8s configmap
    const apiUrl =
      process.env.REPLAY_API_URL || "http://replay-api-service:8080";
    // API URL used for rewrites (set via REPLAY_API_URL env var or defaults to K8s service URL)
    return {
      // beforeFiles: These rewrites run BEFORE checking filesystem.
      // IMPORTANT: Only proxy routes that do NOT have file-based API handlers.
      // wallet, payments, subscriptions, webhooks, checkout have file-based handlers
      // that inject auth headers — those must NOT be duplicated here.
      beforeFiles: [
        // Proxy /api/games/* to backend (no file-based handler exists)
        {
          source: "/api/games/:path*",
          destination: `${apiUrl}/games/:path*`,
        },
        // Proxy /api/plans to backend (public, no auth needed)
        {
          source: "/api/plans",
          destination: `${apiUrl}/plans`,
        },
        {
          source: "/api/plans/:path*",
          destination: `${apiUrl}/plans/:path*`,
        },
      ],
      // These rewrites run AFTER checking filesystem (fallback for routes without handler)
      afterFiles: [
        // Proxy other unhandled /api/* routes (except auth and routes with file-based handlers)
        {
          source:
            "/api/:path((?!auth|health|players|payments|billing|matches|match-making|replays|search|leaderboard|ranks|squads|wallet|upload|notifications|onboarding|iam|account|webhooks|debug|games|subscriptions|plans|checkout|scores|tournaments|metrics).*)",
          destination: `${apiUrl}/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Only upload source maps in production
  silent: true,

  // Suppresses source map uploading logs during build
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;
