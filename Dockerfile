# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for the build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite client assets and esbuild the Express server
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy dependency manifests to install production dependencies
COPY package*.json ./

# Install only production-needed npm packages
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled files and build assets from previous stage
COPY --from=builder /app/dist ./dist

# Ports are dynamically assigned by Cloud Run, but expose port 3000 as a reference
EXPOSE 3000

# Start the Node production server
CMD ["node", "dist/server.cjs"]
