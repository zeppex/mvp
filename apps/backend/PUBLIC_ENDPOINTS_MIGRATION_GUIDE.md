# Public Endpoints Migration Guide

## Overview

This guide outlines the strategy for migrating from the current nested public endpoint structure to a simplified structure while maintaining backward compatibility.

## Current vs New Structure

### Current Structure (Legacy)
```
GET  /api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/current
POST /api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/{orderId}/trigger-in-progress
```

### New Structure (Simplified)
```
GET  /api/v1/public/pos/{posId}/orders/current
POST /api/v1/public/pos/{posId}/orders/{orderId}/trigger-in-progress
```

## Migration Strategy

### Phase 1: Dual Endpoints (Current Implementation)
- ✅ Both legacy and simplified endpoints are now available
- ✅ Legacy endpoints continue to work unchanged
- ✅ New simplified endpoints provide the same functionality
- ✅ Backward compatibility is maintained

### Phase 2: QR Code URL Migration
- QR codes can be generated in either format based on configuration
- Environment variable `USE_SIMPLIFIED_QR_URLS` controls the format
- Default: `false` (uses legacy format)

### Phase 3: Frontend Updates
- ✅ Frontend now supports both URL formats
- Automatically detects format based on URL structure
- Calls appropriate API endpoint based on detected format

### Phase 4: Gradual Migration (Recommended)
1. Deploy the new endpoints alongside existing ones
2. Update QR code generation for new POS devices to use simplified format
3. Monitor usage and ensure stability
4. Eventually deprecate legacy endpoints (with proper notice)

## Configuration

### Environment Variables

```bash
# Control QR code URL format
USE_SIMPLIFIED_QR_URLS=false  # Default: false (legacy format)
USE_SIMPLIFIED_QR_URLS=true   # Use simplified format

# Frontend URL for QR codes
FRONTEND_URL=http://localhost:3000
```

### QR Code URL Formats

**Legacy Format (default):**
```
http://localhost:3000/payment/{merchantId}/{branchId}/{posId}
```

**Simplified Format:**
```
http://localhost:3000/payment/{posId}
```

## API Endpoints

### Current Active Endpoints

#### Legacy Endpoints (Backward Compatible)
```
GET  /api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/current
POST /api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/{orderId}/trigger-in-progress
```

#### New Simplified Endpoints
```
GET  /api/v1/public/pos/{posId}/orders/current
POST /api/v1/public/pos/{posId}/orders/{orderId}/trigger-in-progress
```

### Response Format

Both endpoints return the same response format:

```json
{
  "id": "uuid",
  "amount": "25.00",
  "description": "Payment description",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:10:00.000Z",
  "expiresIn": 600000,
  "pos": {
    "id": "uuid",
    "name": "POS Name",
    "branch": {
      "id": "uuid",
      "name": "Branch Name",
      "merchant": {
        "id": "uuid",
        "name": "Merchant Name"
      }
    }
  },
  "qrCodeUrl": "string"
}
```

## Frontend Integration

### URL Parsing

The frontend automatically detects the URL format:

```typescript
// Parse the URL to determine the format
const pathSegments = params.id.split('/')
const isSimplifiedFormat = pathSegments.length === 1
const posId = isSimplifiedFormat ? pathSegments[0] : pathSegments[2]
const merchantId = isSimplifiedFormat ? null : pathSegments[0]
const branchId = isSimplifiedFormat ? null : pathSegments[1]
```

### API Endpoint Selection

```typescript
// Determine the API endpoint based on the URL format
let apiUrl: string
if (isSimplifiedFormat) {
  // New simplified format
  apiUrl = `/api/v1/public/pos/${posId}/orders/current`
} else {
  // Legacy format
  apiUrl = `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`
}
```

## Testing

### Test Both Formats

```bash
# Test legacy format
curl "http://localhost:3001/api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/current"

# Test simplified format
curl "http://localhost:3001/api/v1/public/pos/{posId}/orders/current"
```

### QR Code Testing

1. Generate QR codes with both formats
2. Scan with mobile devices
3. Verify both lead to the same payment page
4. Test payment processing with both formats

## Benefits of Migration

### Simplified URLs
- Shorter, cleaner URLs
- Easier to remember and share
- Reduced complexity in URL parsing

### Better Security
- POS IDs are globally unique
- No need to expose merchant/branch IDs in public URLs
- Reduced information disclosure

### Improved Maintainability
- Simpler routing logic
- Easier to implement caching
- Reduced complexity in frontend code

## Risks and Considerations

### Backward Compatibility
- Existing QR codes will continue to work
- No immediate breaking changes
- Gradual migration reduces risk

### URL Collision
- POS IDs must remain globally unique
- Database constraints ensure uniqueness
- No risk of collision with current implementation

### Monitoring
- Monitor usage of both endpoint formats
- Track QR code scan success rates
- Ensure no degradation in user experience

## Migration Timeline

### Immediate (Completed)
- ✅ Deploy dual endpoints
- ✅ Update frontend to support both formats
- ✅ Add configuration for QR code format

### Short Term (1-2 weeks)
- Test both formats thoroughly
- Update documentation
- Train support team on new endpoints

### Medium Term (1-2 months)
- Begin generating new QR codes with simplified format
- Monitor usage patterns
- Gather feedback from merchants

### Long Term (3-6 months)
- Consider deprecating legacy endpoints
- Provide migration tools for existing QR codes
- Complete full migration

## Support

For questions or issues during migration:
1. Check the API documentation
2. Review test cases in `test/e2e/`
3. Contact the development team
4. Monitor application logs for errors 