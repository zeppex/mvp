# Frontend Migration Progress

## ✅ Completed Updates

### 1. Type Definitions Updated

- **`/types/enums.ts`** - Updated UserRole enum to remove tenant-based roles (TENANT_ADMIN, POS_USER) and use merchant-based roles (SUPERADMIN, ADMIN, BRANCH_ADMIN, CASHIER)
- **`/types/user.ts`** - Updated User interface to include merchant-based relationships (merchantId, branchId, posId)

### 2. API Services Updated

- **`/lib/user-api.ts`** - Complete rewrite with merchant-based structure:

  - Updated User and DTO interfaces
  - Added support for merchantId/branchId query parameters
  - Added getUsersByMerchant() and getUsersByBranch() methods
  - Removed tenant-based methods

- **`/lib/merchant-api.ts`** - Updated to remove tenant dependencies:
  - Removed tenant relationship from Merchant interface
  - Updated API endpoints to use merchant hierarchy (merchants/{id}/branches, merchants/{id}/branches/{id}/pos)
  - Simplified CreateMerchantDto (removed tenantId)

### 3. Components Updated

- **`/components/admin/UserForm.tsx`** - Complete rewrite with:

  - Merchant/branch/pos selection based on user role
  - Dynamic form fields based on selected role
  - Hierarchical dropdowns (merchant → branch → pos)
  - Role-based permission validation
  - Navigation updated for merchant-based URLs

- **`/components/admin/MerchantForm.tsx`** - New component to replace TenantForm:
  - Form fields for merchant details (name, address, contact info)
  - Removed tenant dependencies
  - Updated validation and navigation

### 4. Authentication System

- **JWT Handling** - Already supports merchant-based structure:
  - `/lib/auth.ts` uses updated User type with merchant relationships
  - `/lib/server-auth.ts` handles merchant-aware JWT tokens
  - API routes (`/app/api/auth/`) work with new structure

## 🔄 Remaining Tasks

### High Priority

1. **Update Admin Pages** - Need to update pages that still reference tenants:

   - `/app/admin/tenants/` → should become `/app/admin/merchants/`
   - Update navigation and routing
   - Update table displays and CRUD operations

2. **Update Navigation Components**

   - Update navbar and sidebar to show merchant hierarchy
   - Remove tenant-based menu items
   - Add merchant/branch/pos navigation

3. **Update Hooks and Utilities**
   - `/hooks/useAuth.ts` - Test with new user structure
   - Update any remaining tenant references

### Medium Priority

4. **Page Components** - Update pages that use old APIs:

   - User management pages
   - Merchant/branch/pos listing pages
   - Dashboard components

5. **Form Validation** - Ensure all forms work with new structure:
   - Branch creation forms
   - POS device forms
   - User assignment forms

### Low Priority

6. **Documentation Updates**
   - Update component documentation
   - Update API integration guides

## 🧪 Testing Needed

1. **Authentication Flow** - Test login/logout with merchant-based JWT
2. **User Management** - Test user CRUD operations with new permissions
3. **Merchant Hierarchy** - Test merchant → branch → pos relationships
4. **Role-Based Access** - Test all four roles (SUPERADMIN, ADMIN, BRANCH_ADMIN, CASHIER)

## 📋 Backend Compatibility

✅ **Backend Ready** - The backend migration is complete and provides:

- Merchant-based API endpoints
- Updated JWT with merchantId/branchId/posId
- Role-based permission system
- All CRUD operations for merchant hierarchy

## 🔧 Build Status

- **Backend**: ✅ Builds successfully
- **Frontend**: 🔄 In progress (type updates completed, some pages need updating)

## 📁 Files Modified

### New Files Created:

- `/components/admin/MerchantForm.tsx`
- `/components/admin/UserFormNew.tsx` → `/components/admin/UserForm.tsx`

### Files Updated:

- `/types/enums.ts`
- `/types/user.ts`
- `/lib/user-api.ts`
- `/lib/merchant-api.ts`

### Files Backed Up:

- `/components/admin/UserFormOld.tsx` (original tenant-based version)
- `/components/admin/TenantForm.tsx` (needs to be replaced with MerchantForm in pages)

## ⚡ Next Steps

1. Run frontend build to identify remaining compilation errors
2. Update admin pages to use MerchantForm instead of TenantForm
3. Update page routing from `/admin/tenants/` to `/admin/merchants/`
4. Test all user flows end-to-end
5. Update navigation components for merchant hierarchy
