# Tenant Management System

This module provides a comprehensive tenant management system for the Zeppex platform. It allows SuperAdmins to create, manage, and delete tenants, as well as manage the users associated with each tenant.

## Features

- **Tenant Management**: Create, edit, view, and delete tenants
- **User Management**: Add, edit, and remove users within each tenant
- **Role-Based Access Control**: Different access levels for SuperAdmin, Admin, and TenantAdmin roles
- **Responsive Design**: Works well on both desktop and mobile devices

## User Roles

- **SuperAdmin**: Can manage all tenants and users
- **Admin**: Can view all tenants and manage certain aspects
- **TenantAdmin**: Can manage only their own tenant and its users
- **MerchantAdmin**: Can manage merchants within their tenant
- **BranchAdmin**: Can manage branches within a merchant
- **PosUser**: Basic user with limited access

## Getting Started

1. Navigate to `/admin/tenants` to see the list of all tenants
2. Click "Create Tenant" to add a new tenant
3. Click on "Users" for any tenant to manage its users
4. Use the "Add User" button within a tenant to create new users

## API Integration

The frontend interfaces with the backend through RESTful API endpoints at `/admin/tenants` and `/admin/users`. All API requests include authentication headers and are made using the axios client with proper error handling and token refreshing.

## Best Practices

- Always assign appropriate roles when creating users
- Use descriptive names for tenants to easily identify them
- Keep tenant names lowercase and use hyphens instead of spaces
- Deactivate users and tenants instead of deleting them when possible
