# Payment Flow Implementation with QR Codes

This document describes the implementation of the QR code-based payment flow for the Zeppex backend.

## Overview

The payment flow allows customers to scan a QR code at a POS terminal to view and process payment orders. Each payment order has a configurable time-to-live (TTL) and will be automatically cancelled if not processed within the specified time.

## Flow Description

1. **Cashier creates payment order**: A cashier creates a payment order for a specific POS terminal
2. **Customer scans QR code**: The customer scans the static QR code displayed at the POS terminal
3. **Customer views payment order**: The QR code links to a frontend page showing the current payment order details
4. **Customer processes payment**: The customer can process the payment through the frontend interface
5. **Automatic expiration**: If the payment order is not processed within the TTL period, it is automatically cancelled

## Key Features

### 1. QR Code Generation
- Each POS has a static QR code that links to the current payment order
- QR codes are generated using external services (Google Charts API)
- QR codes are automatically generated when POS terminals are created or updated

### 2. Time-to-Live (TTL) Configuration
- Payment orders have a configurable TTL (default: 2 minutes)
- TTL is set via the `PAYMENT_ORDER_TTL` environment variable (in milliseconds)
- Expired orders are automatically marked as `EXPIRED`

### 3. Payment Order Statuses
- `ACTIVE`: Order is available for payment
- `IN_PROGRESS`: Customer has started payment processing
- `COMPLETED`: Payment has been successfully processed
- `CANCELLED`: Order was manually cancelled
- `EXPIRED`: Order expired due to TTL

### 4. Automatic Cleanup
- A scheduled task runs every minute to cancel expired payment orders
- This ensures system resources are not consumed by stale orders

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Current Payment Order
```
GET /api/v1/public/merchants/:merchantId/branches/:branchId/pos/:posId/orders/current
```
Returns the current active payment order for a POS terminal. This endpoint is used by the QR code link.

**Response:**
```json
{
  "id": "uuid",
  "amount": "25.50",
  "description": "Payment for order #12345",
  "status": "ACTIVE",
  "expiresAt": "2024-01-01T12:02:00.000Z",
  "expiresIn": 45000,
  "qrCodeUrl": "/public/merchants/.../orders/current"
}
```

### Protected Endpoints (Authentication Required)

#### Create Payment Order
```
POST /api/v1/merchants/:merchantId/branches/:branchId/pos/:posId/orders
```
Creates a new payment order with automatic TTL expiration.

#### Trigger In-Progress Status
```
POST /api/v1/merchants/:merchantId/branches/:branchId/pos/:posId/orders/:orderId/trigger-in-progress
```
Changes the payment order status to `IN_PROGRESS` when customer starts payment processing.

#### Get POS QR Code Information
```
GET /api/v1/merchants/:merchantId/branches/:branchId/pos/:posId/qr-code
```
Returns QR code information for a POS terminal.

**Response:**
```json
{
  "posId": "uuid",
  "posName": "POS Terminal 1",
  "qrCodeUrl": "http://localhost:3000/payment/...",
  "qrCodeImageUrl": "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=..."
}
```

## Environment Configuration

Add the following environment variable to your `.env` file:

```env
# Payment order TTL in milliseconds (default: 2 minutes)
PAYMENT_ORDER_TTL=120000
```

## Database Schema Changes

### POS Entity
- Added `qrCode` field to store the QR code URL

### Payment Order Entity
- Added `expiresAt` field to store the expiration timestamp
- Added helper methods: `isExpired()` and `shouldBeCancelled()`

## Services

### QrCodeService
- Generates QR code URLs for POS terminals
- Uses external services for QR code image generation
- Configurable base URL for frontend integration

### PaymentOrderService
- Enhanced with TTL functionality
- Automatic expiration handling
- Status management for payment processing

### PaymentOrderCleanupService
- Scheduled service that runs every minute
- Automatically cancels expired payment orders
- Logs cleanup activities for monitoring

## Testing

Run the test script to verify the implementation:

```bash
cd apps/backend
node test-payment-flow.js
```

This script will:
1. Create a test merchant, branch, and POS
2. Generate QR codes
3. Create a payment order
4. Test the public endpoint
5. Trigger in-progress status

## Frontend Integration

The QR codes link to frontend URLs in the format:
```
{FRONTEND_URL}/payment/{merchantId}/{branchId}/{posId}
```

The frontend should:
1. Display the current payment order details
2. Show the amount, description, and expiration time
3. Provide payment processing options
4. Handle order status changes

## Security Considerations

1. **Public Endpoint Security**: The public endpoint only returns active, non-expired orders
2. **Error Handling**: Generic error messages are returned to avoid exposing internal details
3. **Rate Limiting**: All endpoints are subject to rate limiting
4. **Input Validation**: All inputs are validated using DTOs and class-validator

## Monitoring and Logging

The implementation includes comprehensive logging:
- QR code generation events
- Payment order creation and status changes
- Expiration and cleanup activities
- Error conditions and exceptions

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for real-time order status updates
2. **Payment Processing**: Integration with actual payment gateways
3. **Analytics**: Track QR code scans and conversion rates
4. **Custom QR Codes**: Allow merchants to customize QR code appearance
5. **Multiple Payment Methods**: Support for various payment options 