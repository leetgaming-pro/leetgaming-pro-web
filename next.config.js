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
  }
}

module.exports = nextConfig
