# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY flig-mvp/backend/package.json ./flig-mvp/backend/
COPY flig-mvp/frontend/package.json ./flig-mvp/frontend/

# Install dependencies
RUN npm install
RUN cd flig-mvp/backend && npm install
RUN cd flig-mvp/frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd flig-mvp/frontend && npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start command
CMD ["npm", "start"]
