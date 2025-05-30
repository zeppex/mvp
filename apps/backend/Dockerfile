FROM node:20-alpine

WORKDIR /app

# Enable Corepack and set npm version
RUN corepack enable && corepack prepare npm@10.8.2 --activate

# 1) Copy workspace config & locks so pnpm knows about ALL packages
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./

# 2) Copy only the backend package manifests
COPY apps/backend/package.json apps/backend/
COPY apps/backend/pnpm-lock.yaml apps/backend/

# 3) Install (will hoist deps into /app/node_modules)
RUN pnpm install --frozen-lockfile

# 4) Now copy the rest of the code
COPY . .

# Switch into the backend app
WORKDIR /app/apps/backend

EXPOSE 8080
CMD ["pnpm", "run", "start:dev"]