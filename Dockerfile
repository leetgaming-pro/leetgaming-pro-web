# Minimal Dockerfile using pre-built standalone output
# Build locally first: npm run build
FROM node:18-alpine

WORKDIR /app

# Set environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3030
ENV HOSTNAME="0.0.0.0"

# Copy standalone build output
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# Expose port and start
EXPOSE 3030
CMD ["node", "server.js"]
