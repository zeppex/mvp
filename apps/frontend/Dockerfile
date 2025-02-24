FROM node:20-alpine

WORKDIR /app

# Enable Corepack to manage package managers
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./

# Copy frontend app
COPY apps/frontend ./apps/frontend/

# Install dependencies
RUN npm install

# Set working directory to frontend app
WORKDIR /app/apps/frontend

# Build the frontend application
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]