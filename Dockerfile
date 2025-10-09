# Use Node.js 18 LTS
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY flig-mvp/backend/package.json ./flig-mvp/backend/

# Install dependencies
RUN npm install
RUN cd flig-mvp/backend && npm install

# Copy backend source code only
COPY flig-mvp/backend/ ./flig-mvp/backend/

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start command
CMD ["npm", "start"]
