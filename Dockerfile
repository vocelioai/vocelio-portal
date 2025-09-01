FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist ./dist
COPY server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vocilio -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R vocilio:nodejs /app
USER vocilio

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { \
    if (r.statusCode !== 200) throw new Error('Health check failed') \
  }).on('error', () => { throw new Error('Health check failed') })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
