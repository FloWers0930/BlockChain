# ====================== BUILD STAGE ======================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# ====================== PRODUCTION STAGE ======================
FROM node:20-alpine

WORKDIR /app

# Copy only production artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
   adduser -S -u 1001 -G nodejs nodejs && \
   chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Use the production start script
CMD ["npm", "start"]