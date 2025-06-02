# Zeppex Core API

A multi-tenant backend application built with NestJS for managing merchants, branches, points of sale, and payments.

## Table of Contents

- [Overview](#overview)
- [Multi-Tenant Architecture](#multi-tenant-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [Admin User Configuration](#admin-user-configuration)
  - [User Roles](#user-roles)
- [API Usage](#api-usage)
  - [Creating and Managing Tenants](#creating-and-managing-tenants)
  - [Managing Merchants](#managing-merchants)
  - [Managing Branches](#managing-branches)
  - [Managing POS (Points of Sale)](#managing-pos-points-of-sale)
  - [Payment Orders and Transactions](#payment-orders-and-transactions)
- [Development](#development)
  - [Running the Application](#running-the-application)
  - [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

## Overview

Zeppex Core API is a multi-tenant backend system designed to manage merchants, branches, points of sale, and payment transactions. The system is built with data isolation in mind, ensuring that each tenant can only access their own data.

## Multi-Tenant Architecture

The system uses a multi-tenant architecture with the following features:
- An admin side can create and manage tenants
- Each tenant can only view and manage their own data
- Authentication and authorization are tenant-aware

For more detailed information about the multi-tenant architecture, see [Multi-Tenant Architecture Documentation](docs/multi-tenant-architecture.md).

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PNPM package manager
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/zeppex.git
cd zeppex/apps/backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration values.

5. Start the application:

```bash
pnpm start:dev
```

### Environment Variables

Important environment variables to configure:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASS=password
DB_NAME=zeppex

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Server Configuration
PORT=4000

# Admin User Configuration
ADMIN_TENANT_NAME=admin
ADMIN_TENANT_DISPLAY_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password-here
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

## Authentication

### Admin User Configuration

The system includes a default admin user for initial access. You can configure this admin user through environment variables:

```
ADMIN_TENANT_NAME=admin
ADMIN_TENANT_DISPLAY_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password-here
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

If you don't set these variables, default values will be used. There's also a hardcoded fallback admin created if the configurable admin fails:

- Email: superadmin@zeppex.com
- Password: SuperAdmin!123

### User Roles

The system has the following user roles:

- **ADMIN**: System-wide administrator with full access to all tenants and features
- **TENANT_ADMIN**: Administrator for a specific tenant with full access to that tenant's data
- **MERCHANT_ADMIN**: Administrator for a specific merchant within a tenant
- **BRANCH_ADMIN**: Administrator for a specific branch
- **POS_OPERATOR**: Operator for a specific point of sale

## API Usage

### Creating and Managing Tenants

Only system administrators (ADMIN role) can create and manage tenants.

#### Creating a Tenant

```http
POST /api/v1/admin/tenants
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "tenant-name",
  "displayName": "Tenant Display Name",
  "isActive": true
}
```

#### Listing All Tenants

```http
GET /api/v1/admin/tenants
Authorization: Bearer <admin-jwt-token>
```

#### Getting a Single Tenant

```http
GET /api/v1/admin/tenants/:id
Authorization: Bearer <admin-jwt-token>
```

#### Updating a Tenant

```http
PUT /api/v1/admin/tenants/:id
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "displayName": "Updated Tenant Name",
  "isActive": true
}
```

#### Deleting a Tenant

```http
DELETE /api/v1/admin/tenants/:id
Authorization: Bearer <admin-jwt-token>
```

### Managing Merchants

Merchants are created within a tenant. ADMIN and TENANT_ADMIN roles can create and manage merchants.

#### Creating a Merchant

```http
POST /api/v1/merchants
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Merchant Name",
  "address": "123 Main St, City",
  "contact": "contact@merchant.com",
  "contactName": "John Doe",
  "contactPhone": "+1234567890"
}
```

The tenant ID is automatically determined from the JWT token.

#### Listing Merchants

```http
GET /api/v1/merchants
Authorization: Bearer <jwt-token>
```

This endpoint returns only the merchants belonging to the tenant specified in the JWT token.

#### Getting a Single Merchant

```http
GET /api/v1/merchants/:id
Authorization: Bearer <jwt-token>
```

### Managing Branches

Branches are created within a merchant. ADMIN, TENANT_ADMIN, and MERCHANT_ADMIN roles can create and manage branches.

#### Creating a Branch

```http
POST /api/v1/merchants/:merchantId/branches
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Branch Name",
  "address": "456 Branch St, City",
  "contactName": "Jane Smith",
  "contactPhone": "+1234567890"
}
```

#### Listing Branches for a Merchant

```http
GET /api/v1/merchants/:merchantId/branches
Authorization: Bearer <jwt-token>
```

#### Getting a Single Branch

```http
GET /api/v1/merchants/:merchantId/branches/:branchId
Authorization: Bearer <jwt-token>
```

### Managing POS (Points of Sale)

POS terminals are created within a branch. ADMIN, TENANT_ADMIN, MERCHANT_ADMIN, and BRANCH_ADMIN roles can create and manage POS terminals.

#### Creating a POS Terminal

```http
POST /api/v1/merchants/:merchantId/branches/:branchId/pos
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "POS Terminal 1",
  "description": "Front counter terminal"
}
```

#### Listing POS Terminals for a Branch

```http
GET /api/v1/merchants/:merchantId/branches/:branchId/pos
Authorization: Bearer <jwt-token>
```

#### Getting a Single POS Terminal

```http
GET /api/v1/merchants/:merchantId/branches/:branchId/pos/:posId
Authorization: Bearer <jwt-token>
```

### Payment Orders and Transactions

Payment orders are created at a specific POS terminal and can lead to transactions.

#### Creating a Payment Order

```http
POST /api/v1/merchants/:merchantId/branches/:branchId/pos/:posId/payment-orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 100.50,
  "currency": "USD",
  "description": "Payment for order #12345"
}
```

#### Creating a Transaction

```http
POST /api/v1/transactions
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "merchantId": "uuid-of-merchant",
  "branchId": "uuid-of-branch",
  "posId": "uuid-of-pos",
  "paymentOrderId": "uuid-of-payment-order",
  "status": "completed",
  "amount": 100.50,
  "currency": "USD"
}
```

## Development

### Running the Application

```bash
# development
pnpm start

# watch mode
pnpm start:dev

# production mode
pnpm start:prod
```

### Testing

```bash
# unit tests
pnpm test

# e2e tests
pnpm test:e2e

# test coverage
pnpm test:cov
```

## Deployment

For production deployment:

1. Configure your production environment variables in `.env.production`
2. Build the application:

```bash
pnpm build
```

3. Start the production server:

```bash
NODE_ENV=production pnpm start:prod
```

Docker deployment is also supported:

```bash
docker-compose up -d
```

## API Documentation

The API documentation is available through Swagger UI:

```
http://localhost:4000/api/v1/docs
```

You can use this interactive documentation to explore and test the API endpoints.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
