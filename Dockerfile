# Minimal Dockerfile using pre-built standalone output
# Build locally first: npm run build
FROM node:18.20-alpine3.20

WORKDIR /app

# Set environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=3030
ENV HOSTNAME="0.0.0.0"

# Copy standalone build output
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# SECURITY: Run as the built-in non-root 'node' user (uid 1000)
USER node

# Expose port and start
EXPOSE 3030
CMD ["node", "server.js"]
