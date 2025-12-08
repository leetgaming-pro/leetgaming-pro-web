const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // TODO: Re-enable after fixing matchmaking SDK types
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: Install @typescript-eslint/eslint-plugin
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com"
      },
      {
        protocol: "https",
        hostname: "nextuipro.nyc3.cdn.digitaloceanspaces.com"
      }
    ]
  },
  // Sentry webpack plugin options
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // to not leak sourcemaps to the browser
    hideSourceMaps: true,
    // Disable the Sentry webpack plugin in development
    disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
    disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
  },
}

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

  // Automatically associate commits with releases
  setCommits: {
    auto: true,
  },
};

// Conditionally wrap with Sentry
module.exports = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
