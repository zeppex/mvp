FROM node:20-alpine

WORKDIR /app

# Enable Corepack and set npm version
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./

# Copy backend app
COPY apps/backend ./apps/backend/

# Install dependencies
RUN npm install

# Set working directory to backend app
WORKDIR /app/apps/backend

EXPOSE 8080
CMD ["npm", "run", "start:dev"]