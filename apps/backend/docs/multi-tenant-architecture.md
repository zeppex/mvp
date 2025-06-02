# Multi-Tenant Architecture Documentation

This document describes the multi-tenant architecture implemented in the backend application.

## Overview

The system uses a multi-tenant architecture with the following features:

- An admin side can create and manage tenants
- Each tenant can only view and manage their own data
- Authentication and authorization are tenant-aware

## Key Components

### Tenant Entity

- Represents an organization or client that uses the system
- Each tenant has their own isolated data

### User Entity

- Users belong to a specific tenant
- Role-based permissions control what actions users can perform
- ADMIN roles can manage the system globally
- TENANT_ADMIN roles can manage a specific tenant's resources

### JWT Authentication

- JWT tokens include tenant information
- Used to isolate data and operations by tenant

### Authorization Guards

- Role-based guards restrict access to endpoints
- Tenant middleware extracts tenant info from JWT tokens

### Data Isolation

- Each entity includes tenant information
- Services filter data based on the user's tenant

## How Data Isolation Works

1. **JWT Token**: Contains the user's tenant ID
2. **Middleware**: Extracts tenant ID from JWT token and attaches to request
3. **Custom Decorator**: `@CurrentTenant()` extracts tenant ID from request
4. **Services**: All data operations filter by tenant ID

## Implementation Details

### Entity Structure

- Entities (Merchant, Branch, POS, Transaction) include tenant relationships
- Either direct tenant relationship or hierarchical isolation

### Service Isolation

- Each service method accepts an optional tenant ID
- Tenant ID used to restrict data access and modifications
- Access checks prevent cross-tenant data exposure

### Authorization Flow

1. User authenticates and receives JWT token with tenant info
2. User makes API request with token
3. Middleware extracts tenant ID from token
4. Service methods use tenant ID to filter data
5. User only sees and modifies their tenant's data

## Best Practices

1. Always include tenant checks in service methods
2. Use the `@CurrentTenant()` decorator to extract tenant ID
3. Set up proper role-based permissions for tenant management
4. Validate tenant access for all operations
