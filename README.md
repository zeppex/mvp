# Zeppex MVP Monorepo

A comprehensive payment processing platform built with a modern monorepo architecture, featuring a NestJS backend API and Next.js frontend application.

## 🏗️ Architecture Overview

This monorepo contains both the frontend and backend applications for the Zeppex MVP project, organized using **Turborepo** and **pnpm workspaces** for efficient development and deployment.

### 📁 Project Structure

```
zeppex-mvp/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication & authorization
│   │   │   ├── core/     # Core business logic
│   │   │   ├── hedera/   # Hedera blockchain integration
│   │   │   ├── binance-client/ # Binance Pay integration
│   │   │   └── shared/   # Shared utilities & services
│   │   └── test/         # E2E and unit tests
│   └── frontend/         # Next.js web application
│       ├── app/          # App router pages
│       ├── components/   # Reusable UI components
│       └── lib/          # Utility functions
├── docker-compose.yaml   # Local development services
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## 🚀 Features

### Backend (NestJS)
- **Multi-tenant Architecture**: Support for multiple merchants with isolated data
- **Role-based Access Control**: Hierarchical user roles (SuperAdmin, Admin, Branch Admin, Cashier)
- **Payment Processing**: Integration with Binance Pay and other exchanges
- **Blockchain Integration**: Hedera network integration for token management
- **Transaction Management**: Complete transaction lifecycle management
- **API Documentation**: Swagger/OpenAPI documentation
- **Rate Limiting**: Built-in request throttling
- **Security**: JWT authentication, CORS, Helmet security headers

### Frontend (Next.js)
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Admin Dashboard**: Merchant and user management interfaces
- **Payment Interface**: QR code generation and payment processing
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Dark/light mode toggle
- **Real-time Updates**: Live transaction status updates

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.18.0 (specified in `.nvmrc`)
- **pnpm**: Version 8.8.0 or higher
- **Docker & Docker Compose**: For local database and services
- **PostgreSQL**: Version 15 (can be run via Docker)

### Node.js Installation

If you're using nvm (Node Version Manager):

```bash
nvm install 20.18.0
nvm use 20.18.0
```

Or download directly from [nodejs.org](https://nodejs.org/)

### pnpm Installation

```bash
npm install -g pnpm@8.8.0
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zeppex-mvp
```

### 2. Install Dependencies

```bash
# Install all dependencies for both apps
pnpm install
```

### 3. Environment Configuration

Create environment files for both applications:

#### Backend Environment (`.env` in `apps/backend/`)

```bash
# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/zeppex

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Application Configuration
NODE_ENV=development
PORT=8080
FRONTEND_URL=http://localhost:3000

# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=your-hedera-account-id
HEDERA_PRIVATE_KEY=your-hedera-private-key

# Binance Configuration
BINANCE_API_KEY=your-binance-api-key
BINANCE_SECRET_KEY=your-binance-secret-key

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
```

#### Frontend Environment (`.env.local` in `apps/frontend/`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup

Start the PostgreSQL database using Docker:

```bash
# Start only the database service
docker-compose up postgres -d
```

### 5. Database Migrations

```bash
# Navigate to backend directory
cd apps/backend

# Run database migrations
pnpm migrate

# Seed initial data (optional)
pnpm seed
```

## 🚀 Development

### Start Development Servers

#### Option 1: Start All Services (Recommended)

```bash
# From the root directory
pnpm dev
```

This will start both the backend (port 8080) and frontend (port 3000) in development mode.

#### Option 2: Start Services Individually

```bash
# Backend only
cd apps/backend
pnpm start:dev

# Frontend only (in another terminal)
cd apps/frontend
pnpm dev
```

### Available Scripts

#### Root Level Commands
```bash
pnpm build          # Build all applications
pnpm start          # Start all applications in production mode
pnpm dev            # Start all applications in development mode
```

#### Backend Commands (`apps/backend/`)
```bash
pnpm start:dev      # Start in development mode with hot reload
pnpm start:debug    # Start in debug mode
pnpm test           # Run unit tests
pnpm test:e2e       # Run end-to-end tests
pnpm test:watch     # Run tests in watch mode
pnpm migrate        # Run database migrations
pnpm seed           # Seed database with initial data
pnpm lint           # Run ESLint
pnpm format         # Format code with Prettier
```

#### Frontend Commands (`apps/frontend/`)
```bash
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint
```

## 🧪 Testing

### Backend Testing

The backend includes comprehensive test suites:

```bash
cd apps/backend

# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Specific test suites
pnpm test:e2e:payments      # Payment flow tests
pnpm test:e2e:hedera        # Hedera integration tests
pnpm test:e2e:multi-tenant  # Multi-tenant architecture tests
pnpm test:e2e:validation    # Validation tests
```


## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

Once the backend is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:8080/api/v1/docs
- **OpenAPI JSON**: http://localhost:8080/api/v1/docs-json

## 🔐 Authentication

The application uses JWT-based authentication with the following user roles:

- **SuperAdmin**: Full system access
- **Admin**: Merchant management
- **Branch Admin**: Branch-specific operations
- **Cashier**: Payment processing

## 💳 Payment Processing

The platform supports:

- **QR Code Generation**: Dynamic QR codes for payments
- **Binance Pay Integration**: Cryptocurrency payments
- **Hedera Integration**: Token minting and management
- **Multi-currency Support**: Various payment methods

## 🛡️ Security Features

- JWT token authentication
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention

## 🔄 Environment Variables

### Required Environment Variables

Make sure to set up all required environment variables before running the application. The application will fail to start if critical variables are missing.

### Development vs Production

- Use `.env` files for local development
- Use environment variables or secrets management for production
- Never commit sensitive information to version control

---

**Note**: This is an MVP (Minimum Viable Product) version. For production deployment, additional security measures, monitoring, and scaling configurations should be implemented.


